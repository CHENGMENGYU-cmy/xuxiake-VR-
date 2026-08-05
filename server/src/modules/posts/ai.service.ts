import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Post } from '../../entities/post.entity.js';
import { MediaItem } from '../../entities/media-item.entity.js';
import { Journey } from '../../entities/journey.entity.js';
import { JourneyStop } from '../../entities/journey-stop.entity.js';
import { AiClientService } from '../../common/ai-client.service.js';

export interface GenerationJob {
  id: string;
  userId: string;
  status: 'QUEUED' | 'ANALYZING' | 'GENERATING' | 'DONE' | 'ERROR';
  progress: number;
  result?: string;
  postId?: string;
  error?: string;
  createdAt: Date;
  jobType?: 'TRAVELOGUE' | 'ESSAY' | 'MULTI_DIARY';
}

export interface TravelogueGenerateInput {
  logIds: string[];
  diaryIds: string[];
  prompt?: string;
  style?: string;
  tone?: string;
  length?: string;
}

export interface MultiDiaryGenerateInput {
  snapIds: string[];
  style?: string;
  tone?: string;
  length?: string;
}

interface SourceMaterial {
  logs: Post[];
  diaries: Post[];
  locations: string[];
  keywords: string[];
  moods: string[];
}

@Injectable()
export class AiService {
  private jobs = new Map<string, GenerationJob>();

  constructor(
    @Inject(AiClientService) private readonly aiClient: AiClientService,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(MediaItem) private readonly mediaRepo: Repository<MediaItem>,
    @InjectRepository(Journey) private readonly journeyRepo: Repository<Journey>,
    @InjectRepository(JourneyStop) private readonly journeyStopRepo: Repository<JourneyStop>,
  ) {}

  /** 根据种子内容生成游记（旧 ESSAY 模式） */
  async generateEssay(userId: string, seedPostIds: string[], style: string, tone: string, length: string): Promise<string> {
    const jobId = uuidv4();
    const job: GenerationJob = { id: jobId, userId, status: 'QUEUED', progress: 0, createdAt: new Date() };
    this.jobs.set(jobId, job);
    this.executeJob(jobId, userId, seedPostIds, style, tone, length).catch(() => {});
    return jobId;
  }

  /** LOG + DIARY + prompt → TRAVELOGUE 游记生成 */
  async generateTravelogue(userId: string, input: TravelogueGenerateInput): Promise<string> {
    const jobId = uuidv4();
    const job: GenerationJob = { id: jobId, userId, status: 'QUEUED', progress: 0, createdAt: new Date() };
    this.jobs.set(jobId, job);
    this.executeTravelogueJob(jobId, userId, input).catch(() => {});
    return jobId;
  }

  /** N 张闪拍 → 一篇日记（真实 AI） */
  async generateMultiDiary(userId: string, input: MultiDiaryGenerateInput): Promise<string> {
    const jobId = uuidv4();
    const job: GenerationJob = {
      id: jobId, userId, status: 'QUEUED', progress: 0, createdAt: new Date(), jobType: 'MULTI_DIARY',
    };
    this.jobs.set(jobId, job);
    this.executeMultiDiaryJob(jobId, userId, input).catch(() => {});
    return jobId;
  }

  /** 查询任务状态 */
  getJobStatus(jobId: string): GenerationJob | null {
    return this.jobs.get(jobId) || null;
  }

  // ===== TRAVELOGUE 模式（真实 AI） =====

  private async executeTravelogueJob(jobId: string, userId: string, input: TravelogueGenerateInput) {
    const job = this.jobs.get(jobId)!;
    try {
      // 阶段1: 收集素材
      job.status = 'ANALYZING'; job.progress = 10;

      const logs = input.logIds.length > 0
        ? await this.postRepo.find({ where: { id: In(input.logIds), authorId: userId }, relations: { mediaItems: true } })
        : [];
      const diaries = input.diaryIds.length > 0
        ? await this.postRepo.find({ where: { id: In(input.diaryIds), authorId: userId }, relations: { mediaItems: true } })
        : [];

      const material = this.extractMaterial(logs, diaries);
      job.progress = 30;

      // 阶段2: AI 生成
      job.status = 'GENERATING'; job.progress = 40;

      let generated: string;
      try {
        generated = await this.callAiForTravelogue(material, input);
        console.log(`[Travelogue] AI 生成完成，${generated.length} 字符`);
      } catch (aiErr: any) {
        console.warn(`[Travelogue] AI 调用失败，回退到模板生成: ${aiErr.message}`);
        generated = this.buildTravelogueContent(material, input);
      }

      job.progress = 80;

      // 阶段3: 保存游记
      const loc = material.locations[0];
      const title = this.extractTitle(generated) || (loc ? `${loc}游记` : '我的游记');

      const vrMetadata = JSON.stringify({
        sourceLogIds: logs.map(l => l.id),
        sourceDiaryIds: diaries.map(d => d.id),
        prompt: input.prompt || '',
        style: input.style || '游记',
        tone: input.tone || '温暖',
        keywords: material.keywords,
        aiGenerated: true,
      });

      const post = this.postRepo.create({
        id: uuidv4(), authorId: userId,
        postType: 'NOTE', contentLevel: 'TRAVELOGUE',
        parentPostId: diaries[0]?.id || logs[0]?.id || null,
        title, content: generated,
        locationName: material.locations[0] || null,
        vrMetadata,
        visibility: 'PRIVATE',
        likeCount: 0, commentCount: 0, viewCount: 0,
      });
      await this.postRepo.save(post);

      // 复制素材媒体
      const allSeeds = [...logs, ...diaries].filter(p => p.mediaItems?.length);
      if (allSeeds.length > 0) {
        const allMedia = allSeeds.flatMap((s, si) =>
          (s.mediaItems || []).map((m, mi) => ({
            id: uuidv4(), postId: post.id, type: m.type, url: m.url,
            thumbnailUrl: m.thumbnailUrl, duration: m.duration,
            vrFormat: m.vrFormat, sortOrder: si * 10 + mi,
          }))
        );
        await this.mediaRepo.save(allMedia);
      }

      job.status = 'DONE'; job.progress = 100;
      job.result = generated;
      job.postId = post.id;
    } catch (err: any) {
      job.status = 'ERROR';
      job.error = err.message || '生成失败';
      job.progress = 0;
    }
  }

  /** 调用 AI 生成游记 */
  private async callAiForTravelogue(material: SourceMaterial, input: TravelogueGenerateInput): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(input);
    const userPrompt = this.buildUserPrompt(material, input);

    return this.aiClient.generate({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      maxTokens: 4096,
      timeout: 120000,
    });
  }

  /** 构建系统提示词 */
  private buildSystemPrompt(input: TravelogueGenerateInput): string {
    const styleGuide = this.getStyleGuide(input.style || '游记');
    const toneGuide = this.getToneGuide(input.tone || '温暖');
    const lengthGuide = this.getLengthGuide(input.length || '标准');

    return `你是一位经验丰富的旅行作家，擅长将旅行日志和日记感悟融合成优美的游记。

## 写作要求
- 文体：${styleGuide}
- 语气：${toneGuide}
- 篇幅：${lengthGuide}

## 核心原则
1. 基于用户提供的真实日志和日记内容写作，不得虚构地点、人物、事件
2. 日志提供事实骨架（时间、地点、活动），日记提供情感血肉（感受、反思）
3. 将事实和感受有机融合，不机械堆砌
4. 如果信息不足，用模糊表达而非编造
5. 每个章节应有明确的主题

## 输出格式
使用 Markdown 格式，结构如下：
# [标题]
> [一句话摘要]

## [章节标题1]
[段落内容 — 融合日志事实和日记感悟]

## [章节标题2]
...

## 写在最后
[结尾感悟]

---
*本文由 AI 辅助生成，素材来源于个人日志和日记。*`;
  }

  /** 构建用户提示词 */
  private buildUserPrompt(material: SourceMaterial, input: TravelogueGenerateInput): string {
    const parts: string[] = [];

    // 日志（事实素材）
    if (material.logs.length > 0) {
      parts.push('## 日志记录（事实素材）');
      for (let i = 0; i < material.logs.length; i++) {
        const log = material.logs[i];
        parts.push(`### 日志${i + 1}：${log.locationName || '未知地点'}`);
        parts.push(log.content || '');
        parts.push('');
      }
    }

    // 日记（情感素材）
    if (material.diaries.length > 0) {
      parts.push('## 日记记录（情感素材）');
      for (let i = 0; i < material.diaries.length; i++) {
        const diary = material.diaries[i];
        parts.push(`### 日记${i + 1}${diary.title ? `：《${diary.title}》` : ''}`);
        parts.push(diary.content || '');
        parts.push('');
      }
    }

    // 提示词
    if (input.prompt) {
      parts.push(`## 写作方向`);
      parts.push(input.prompt);
      parts.push('');
    }

    // 补充信息
    if (material.locations.length > 0) {
      parts.push(`涉及地点：${material.locations.join('、')}`);
    }
    if (material.moods.length > 0) {
      parts.push(`整体心情：${material.moods.join('、')}`);
    }
    if (material.keywords.length > 0) {
      parts.push(`关键词：${material.keywords.join('、')}`);
    }

    parts.push('\n请根据以上素材，撰写一篇完整的游记。');

    return parts.join('\n');
  }

  /** 提取素材 */
  private extractMaterial(logs: Post[], diaries: Post[]): SourceMaterial {
    const allLocations = [...new Set(
      [...logs, ...diaries].map(p => p.locationName).filter(Boolean)
    )] as string[];

    const allKeywords: string[] = [];
    const allMoods: string[] = [];
    for (const p of [...logs, ...diaries]) {
      try {
        const meta = p.vrMetadata ? JSON.parse(p.vrMetadata) : {};
        if (meta.keywords) allKeywords.push(...(meta.keywords as string[]));
        if (meta.mood) allMoods.push(meta.mood as string);
      } catch { /* ignore */ }
    }

    return {
      logs, diaries,
      locations: allLocations,
      keywords: [...new Set(allKeywords)],
      moods: [...new Set(allMoods)],
    };
  }

  private getStyleGuide(style: string): string {
    const map: Record<string, string> = {
      '游记': '旅行记录风格，按时间线和地点推进叙述，注重行程的完整性和场景描写',
      '日记': '个人随笔风格，以第一人称感受为主，注重内心体验和反思',
    };
    return map[style] || map['游记'];
  }

  private getToneGuide(tone: string): string {
    const map: Record<string, string> = {
      '纪实': '客观冷静，如实记录，用词准确克制',
      '温暖': '温馨治愈，语言柔和有温度，给人安慰和力量',
      '轻松': '轻松愉快，口语化表达，有幽默感',
    };
    return map[tone] || map['温暖'];
  }

  private getLengthGuide(length: string): string {
    const map: Record<string, string> = {
      '简短': '约500-800字，2-3个章节',
      '标准': '约1000-1500字，3-4个章节',
      '详细': '约2000-3000字，4-6个章节',
    };
    return map[length] || map['标准'];
  }

  // ===== 模板生成（AI 调用失败时的回退） =====

  private buildTravelogueContent(material: SourceMaterial, input: TravelogueGenerateInput): string {
    const { locations, keywords, moods } = material;
    const mainLocation = locations[0] || '未知地点';
    const locationText = locations.join('、');
    const moodText = moods.length > 0 ? moods.join('、') : '值得记录';
    const keywordText = keywords.length > 0 ? keywords.join('、') : '旅行';

    let essay = `# ${mainLocation}游记\n\n`;
    essay += `> 记录了在${locationText}的旅程。心情：${moodText}。\n\n`;

    if (input.prompt) {
      essay += `*写作方向：${input.prompt}*\n\n`;
    }

    essay += `## 出发\n\n`;
    if (material.logs.length > 0) {
      essay += `${material.logs[0].content}\n\n`;
    }

    essay += `## 在路上\n\n`;
    if (material.diaries.length > 0) {
      essay += `${material.diaries[0].content}\n\n`;
    }

    essay += `## 写在最后\n\n`;
    essay += `这次${mainLocation}之行，关键词是${keywordText}。`;
    essay += `带着${moodText}的心情，我把这些片段记录下来。`;
    essay += `\n\n---\n*本文由 AI 辅助生成，素材来源于个人日志和日记。*`;

    return essay;
  }

  // ===== 辅助方法 =====

  private extractTitle(content: string): string | null {
    const match = content.match(/^# (.+)$/m);
    return match ? match[1].trim() : null;
  }

  // ===== 旧 ESSAY 模式（保留兼容） =====

  private async executeJob(jobId: string, userId: string, seedPostIds: string[], style: string, tone: string, length: string) {
    const job = this.jobs.get(jobId)!;
    try {
      job.status = 'ANALYZING'; job.progress = 10;
      const seeds = await this.postRepo.find({
        where: { id: In(seedPostIds) },
        relations: { mediaItems: true },
      });

      const contents: string[] = [];
      const locations: string[] = [];
      let imageCount = 0;

      for (const seed of seeds) {
        job.progress += Math.floor(20 / Math.max(seeds.length, 1));
        if (seed.content) contents.push(seed.content);
        if (seed.locationName) locations.push(seed.locationName);
        if (seed.mediaItems?.length) imageCount += seed.mediaItems.filter(m => m.type === 'IMAGE').length;
      }

      job.status = 'GENERATING'; job.progress = 30;
      const generated = this.buildEssayContent(contents, locations, style, tone, length, imageCount);
      job.progress = 70;

      const post = this.postRepo.create({
        id: uuidv4(), authorId: userId,
        postType: 'JOURNEY', contentLevel: 'ESSAY',
        content: generated, visibility: 'PRIVATE',
        locationName: locations[0] || null,
      });
      await this.postRepo.save(post);

      const journey = this.journeyRepo.create({
        postId: post.id,
        title: locations.length > 0 ? `${locations[0]}游记` : '我的游记',
        destination: locations[0] || null,
        stopCount: locations.length,
      });
      await this.journeyRepo.save(journey);

      if (seeds.some(s => s.mediaItems?.length)) {
        const allMedia = seeds.flatMap((s, si) => (s.mediaItems || []).map((m, mi) => ({
          id: uuidv4(), postId: post.id, type: m.type, url: m.url,
          thumbnailUrl: m.thumbnailUrl, duration: m.duration,
          vrFormat: m.vrFormat, sortOrder: si * 10 + mi,
        })));
        await this.mediaRepo.save(allMedia);
      }

      for (let i = 0; i < locations.length; i++) {
        const stop = this.journeyStopRepo.create({
          journeyId: journey.id, dayNumber: i + 1,
          locationName: locations[i], description: `第${i + 1}站`, sortOrder: i,
        });
        await this.journeyStopRepo.save(stop);
      }

      job.status = 'DONE'; job.progress = 100;
      job.result = generated;
      job.postId = post.id;
    } catch (err: any) {
      job.status = 'ERROR';
      job.error = err.message || '生成失败';
      job.progress = 0;
    }
  }

  private buildEssayContent(
    contents: string[], locations: string[], style: string, tone: string, length: string, imageCount: number,
  ): string {
    const toneMap: Record<string, string> = { 纪实: '真实记录', 温暖: '温馨美好', 轻松: '轻松愉快' };
    const styleMap: Record<string, string> = { 游记: '旅行记录', 日记: '个人随笔' };
    const lengthMap: Record<string, number> = { 简短: 3, 标准: 5, 详细: 8 };

    const paragraphs = lengthMap[length] || 5;
    const locationText = locations.length > 0 ? locations.join('、') : '未知地点';
    const toneText = toneMap[tone] || '温馨美好';
    const styleText = styleMap[style] || '旅行记录';

    let essay = `# ${locationText}${styleText}\n\n`;
    essay += `> 一段${toneText}的旅程，${imageCount > 0 ? `共记录了${imageCount}个精彩瞬间。` : '用心感受每一刻。'}\n\n`;

    essay += `## 出发\n\n`;
    essay += `踏上前往${locationText}的旅程，心中充满了期待。`;

    const sampleContents = contents.length > 0 ? contents : [
      '清晨的阳光洒在古老的石板路上，空气中弥漫着花草的清香。',
      '沿着蜿蜒的小路前行，每一步都是新的风景。',
      '站在高处俯瞰，整个城市尽收眼底，美不胜收。',
      '夕阳西下，金色的光芒铺满大地，让人流连忘返。',
      '夜幕降临，繁星点点，为这段旅程画上完美的句号。',
    ];

    for (let i = 0; i < Math.min(paragraphs, sampleContents.length); i++) {
      if (locations[i % locations.length] || locations.length === 0) {
        essay += `\n\n## ${locations[i % locations.length] || `第${i + 1}站`}\n\n`;
      }
      const baseContent = contents[i] || sampleContents[i];
      if (tone === '温暖') {
        essay += `${baseContent}温暖的阳光伴随着微风，让人感到无比舒适。`;
      } else if (tone === '纪实') {
        essay += `${baseContent}\n\n此处地处${locations[i % locations.length] || '目的地'}，是本次旅程的重要一站。`;
      } else {
        essay += `${baseContent}一路欢声笑语，轻松自在。`;
      }
    }

    essay += `\n\n## 尾声\n\n`;
    essay += `这次${locationText}之旅，留下了太多美好的回忆。`;
    essay += `每一张照片、每一段视频，都是珍贵的记忆。`;
    essay += `期待下一次的旅程，继续探索这个美丽的世界。`;

    return essay;
  }
}

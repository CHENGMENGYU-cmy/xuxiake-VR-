import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Post } from '../../entities/post.entity.js';
import { MediaItem } from '../../entities/media-item.entity.js';
import { Journey } from '../../entities/journey.entity.js';
import { JourneyStop } from '../../entities/journey-stop.entity.js';
import { JourneyStopMedia } from '../../entities/journey-stop-media.entity.js';
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

interface DayGroup {
  date: string;
  locationName: string | null;
  media: { url: string; thumbnailUrl: string | null }[];
}

interface StructuredTravelogue {
  title: string;
  summary: string;
  destination: string;
  transport: string;
  budget: string;
  theme: string;
  insight: string;
  tips: string;
  dayTexts: string[];
  dayHighlights: Record<number, string>;
  dayTips: Record<number, string>;
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
    @InjectRepository(JourneyStopMedia) private readonly journeyStopMediaRepo: Repository<JourneyStopMedia>,
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
      const seeds = [...logs, ...diaries];
      const days = this.groupByDay(seeds);
      if (days.length === 0) throw new Error('没有可用的游记素材');
      job.progress = 30;

      // 阶段2: AI 生成
      job.status = 'GENERATING'; job.progress = 40;

      let generated: string;
      try {
        generated = await this.callAiForTravelogue(material, input, days);
        console.log(`[Travelogue] AI 生成完成，${generated.length} 字符`);
      } catch (aiErr: any) {
        console.warn(`[Travelogue] AI 调用失败，回退到模板生成: ${aiErr.message}`);
        generated = this.buildTravelogueContent(material, input, days);
      }

      job.progress = 80;

      // 解析结构化输出 → 落库
      const structured = this.parseStructuredTravelogue(generated, days);
      const loc = material.locations[0];
      const title = structured.title || (loc ? `${loc}游记` : '我的游记');
      const content = this.assembleTravelogueContent(structured, days);

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
        postType: 'JOURNEY', contentLevel: 'TRAVELOGUE',
        parentPostId: diaries[0]?.id || logs[0]?.id || null,
        title, content,
        locationName: structured.destination || loc || null,
        vrMetadata,
        visibility: 'PRIVATE',
        likeCount: 0, commentCount: 0, viewCount: 0,
      });
      await this.postRepo.save(post);

      // 复制素材媒体到 post.mediaItems（列表/卡片兜底展示）
      const allSeeds = seeds.filter(p => p.mediaItems?.length);
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

      // 创建 Journey 结构化章节（按天）
      const journey = this.journeyRepo.create({
        postId: post.id,
        title,
        startDate: days[0]?.date || null,
        endDate: days[days.length - 1]?.date || null,
        destination: structured.destination || loc || null,
        coverUrl: days[0]?.media[0]?.url || null,
        summary: structured.summary || null,
        transport: structured.transport || null,
        budget: structured.budget || null,
        theme: structured.theme || null,
        insight: structured.insight || null,
        tips: structured.tips || null,
        stopCount: days.length,
      });
      await this.journeyRepo.save(journey);

      for (let i = 0; i < days.length; i++) {
        const d = days[i];
        const stop = await this.journeyStopRepo.save(this.journeyStopRepo.create({
          journeyId: journey.id,
          dayNumber: i + 1,
          dayDate: d.date,
          locationName: d.locationName || null,
          description: structured.dayTexts[i] || null,
          highlights: structured.dayHighlights[i] || null,
          tips: structured.dayTips[i] || null,
          sortOrder: i,
        }));
        if (d.media.length > 0) {
          await this.journeyStopMediaRepo.save(d.media.map((m, mi) =>
            this.journeyStopMediaRepo.create({
              stopId: stop.id,
              url: m.url,
              thumbnailUrl: m.thumbnailUrl,
              sortOrder: mi,
            }),
          ));
        }
      }

      job.status = 'DONE'; job.progress = 100;
      job.result = content;
      job.postId = post.id;
    } catch (err: any) {
      job.status = 'ERROR';
      job.error = err.message || '生成失败';
      job.progress = 0;
    }
  }

  /** 调用 AI 生成游记 */
  private async callAiForTravelogue(material: SourceMaterial, input: TravelogueGenerateInput, days: DayGroup[]): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(input);
    const userPrompt = this.buildUserPrompt(material, input, days);

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

## 输出格式（必须严格按此格式，每行一个字段，章节正文写成一个自然段）
标题：<游记标题>
导语：<一句话简介>
目的地：<主要目的地>
出行方式：<交通方式>
人均：<人均消费>
主题：<旅行主题>

Day 1：<第1天的正文，融合该日素材的事实与感悟，写成一个自然段>
Day 1 推荐：<当天推荐亮点，1-2个地点或活动，用逗号分隔>
Day 1 贴士：<当天实用建议，1-2条>
Day 2：<第2天的正文>
Day 2 推荐：<当天推荐亮点>
Day 2 贴士：<当天实用建议>

...

结尾：<结尾感悟，一个自然段>
旅行贴士：<整体旅行建议，3-5条实用建议，用分号分隔>

注意：Day 的序号必须与素材天数对应；若信息不足可在字段写"未知"；推荐和贴士基于素材推断，无依据时可写"暂无"。`;
  }

  /** 构建用户提示词 */
  private buildUserPrompt(material: SourceMaterial, input: TravelogueGenerateInput, days: DayGroup[]): string {
    const parts: string[] = [];

    parts.push('## 旅程概况');
    if (material.locations.length > 0) parts.push(`涉及地点：${material.locations.join('、')}`);
    if (material.moods.length > 0) parts.push(`整体心情：${material.moods.join('、')}`);
    if (material.keywords.length > 0) parts.push(`关键词：${material.keywords.join('、')}`);
    parts.push('');

    // 按天列出素材
    parts.push('## 每天的行程与素材（按天分节，每节包含地点与当天记录/感悟）');
    for (let i = 0; i < days.length; i++) {
      const d = days[i];
      parts.push(`### Day ${i + 1}（${d.date}）${d.locationName ? `· ${d.locationName}` : ''}`);
      for (const p of [...material.logs, ...material.diaries]) {
        const pd = new Date(p.createdAt);
        const key = `${pd.getFullYear()}-${String(pd.getMonth() + 1).padStart(2, '0')}-${String(pd.getDate()).padStart(2, '0')}`;
        if (key !== d.date) continue;
        const tag = p.contentLevel === 'LOG' ? '记录' : '感悟';
        const title = (p as any).title;
        parts.push(`- 【${tag}】${title ? `${title}：` : ''}${(p.content || '').slice(0, 300)}`);
      }
      parts.push('');
    }

    // 日志（事实素材，未按天匹配的兜底补充）
    if (material.logs.length > 0) {
      parts.push('## 日志记录（事实素材）');
      for (let i = 0; i < material.logs.length; i++) {
        const log = material.logs[i];
        parts.push(`### 日志${i + 1}：${log.locationName || '未知地点'}`);
        parts.push(log.content || '');
        parts.push('');
      }
    }

    // 提示词
    if (input.prompt) {
      parts.push(`## 写作方向`);
      parts.push(input.prompt);
      parts.push('');
    }

    parts.push('请根据以上素材，按输出格式撰写一篇完整的游记。');

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

  // ===== MULTI_DIARY 模式（多张闪拍 → 一篇日记，真实 AI） =====

  private async executeMultiDiaryJob(jobId: string, userId: string, input: MultiDiaryGenerateInput) {
    const job = this.jobs.get(jobId)!;
    try {
      job.status = 'ANALYZING'; job.progress = 10;

      const snaps = input.snapIds.length > 0
        ? await this.postRepo.find({ where: { id: In(input.snapIds), authorId: userId }, relations: { mediaItems: true } })
        : [];
      if (snaps.length === 0) throw new Error('没有可用的闪拍素材');

      const material = this.extractMaterial(snaps, []);
      job.progress = 30;

      job.status = 'GENERATING'; job.progress = 40;
      let generated: string;
      try {
        generated = await this.callAiForDiary(material, input);
        console.log(`[MultiDiary] AI 生成完成，${generated.length} 字符`);
      } catch (aiErr: any) {
        console.warn(`[MultiDiary] AI 调用失败，回退到模板生成: ${aiErr.message}`);
        generated = this.buildDiaryContent(material, input);
      }
      job.progress = 80;

      const title = this.extractTitle(generated) || this.buildDiaryTitle(material);
      const vrMetadata = JSON.stringify({
        sourceSnapIds: snaps.map((s) => s.id),
        style: input.style || '温柔治愈',
        tone: input.tone || '温暖',
        keywords: material.keywords,
        mood: material.moods[0] || undefined,
        aiGenerated: true,
        status: 'draft',
      });

      const post = this.postRepo.create({
        id: uuidv4(), authorId: userId,
        postType: 'NOTE', contentLevel: 'DIARY',
        parentPostId: snaps[0].id,
        title, content: generated,
        locationName: material.locations[0] || null,
        vrMetadata,
        visibility: 'PRIVATE',
        likeCount: 0, commentCount: 0, viewCount: 0,
      });
      await this.postRepo.save(post);

      const seedMedia = snaps.flatMap((s, si) =>
        (s.mediaItems || []).map((m, mi) => ({
          id: uuidv4(), postId: post.id, type: m.type, url: m.url,
          thumbnailUrl: m.thumbnailUrl, duration: m.duration,
          vrFormat: m.vrFormat, sortOrder: si * 10 + mi,
        }))
      );
      if (seedMedia.length > 0) await this.mediaRepo.save(seedMedia);

      for (const snap of snaps) {
        try {
          const meta = snap.vrMetadata ? JSON.parse(snap.vrMetadata) : {};
          meta.hasDiary = true;
          meta.diaryId = post.id;
          await this.postRepo.update(snap.id, { vrMetadata: JSON.stringify(meta) });
        } catch { /* ignore */ }
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

  private async callAiForDiary(material: SourceMaterial, input: MultiDiaryGenerateInput): Promise<string> {
    return this.aiClient.generate({
      messages: [
        { role: 'system', content: this.buildDiarySystemPrompt(input) },
        { role: 'user', content: this.buildDiaryUserPrompt(material) },
      ],
      temperature: 0.9,
      maxTokens: 2048,
      timeout: 120000,
    });
  }

  private buildDiarySystemPrompt(input: MultiDiaryGenerateInput): string {
    const styleGuide = this.getDiaryStyleGuide(input.style || '温柔治愈');
    const toneGuide = this.getToneGuide(input.tone || '温暖');
    const lengthGuide = this.getLengthGuide(input.length || '标准');

    return `你是一位细腻的生活记录者，擅长把零散的旅行瞬间写成真挚的个人日记。

## 写作要求
- 风格：${styleGuide}
- 语气：${toneGuide}
- 篇幅：${lengthGuide}

## 核心原则
1. 基于用户提供的真实闪拍素材（时间、地点、关键词、心情、感悟）写作，不虚构地点、人物、事件
2. 以第一人称"我"的视角，记录当下的感受和反思
3. 把多个瞬间有机串联成一篇有温度的日记，而不是机械罗列
4. 如果信息不足，用模糊表达而非编造

## 输出格式
使用 Markdown 格式：
# [日记标题]

[正文 —— 2-4 个自然段，每段围绕一个瞬间或一个感受]

---
*本文由 AI 辅助生成，素材来源于个人闪拍。*`;
  }

  private buildDiaryUserPrompt(material: SourceMaterial): string {
    const parts: string[] = [];
    parts.push('## 我的闪拍瞬间');
    for (let i = 0; i < material.logs.length; i++) {
      const snap = material.logs[i];
      const meta = snap.vrMetadata ? JSON.parse(snap.vrMetadata) : {};
      const line: string[] = [];
      if (snap.locationName) line.push(`地点：${snap.locationName}`);
      if (snap.content) line.push(`感悟：${snap.content}`);
      if (meta.keywords) line.push(`关键词：${(meta.keywords as string[]).join('、')}`);
      if (meta.mood) line.push(`心情：${meta.mood}`);
      parts.push(`### 瞬间${i + 1}${snap.createdAt ? `（${this.formatDate(snap.createdAt)}）` : ''}`);
      parts.push(line.length > 0 ? line.join('\n') : '（仅有照片）');
      parts.push('');
    }
    parts.push('\n请根据以上瞬间，写一篇真诚的个人日记。');
    return parts.join('\n');
  }

  private buildDiaryTitle(material: SourceMaterial): string {
    const loc = material.locations[0];
    return loc ? `${loc}的一天` : '今天的小日记';
  }

  private buildDiaryContent(material: SourceMaterial, input: MultiDiaryGenerateInput): string {
    const loc = material.locations[0];
    const mood = material.moods[0] || '值得记录的瞬间';
    const keywords = material.keywords.slice(0, 5).join('、');
    let diary = `# ${loc ? `${loc}的一天` : '今天'}\n\n`;
    diary += `今天记录的这些瞬间${keywords ? `，围绕着「${keywords}」` : ''}，简单而真实。\n\n`;
    material.logs.forEach((snap, i) => {
      diary += `${snap.content || `第${i + 1}个瞬间`}${snap.locationName ? `（在${snap.locationName}）` : ''}\n\n`;
    });
    diary += `带着${mood}的心情，我把这些片段记录成日记。\n\n---\n*本文由 AI 辅助生成，素材来源于个人闪拍。*`;
    return diary;
  }

  private getDiaryStyleGuide(style: string): string {
    const map: Record<string, string> = {
      '温柔治愈风': '温柔细腻，治愈人心，语言柔软有温度',
      '生活碎片风': '记录生活细节，真实自然，像随手写下的片段',
      '成长复盘风': '以反思为主，从经历中提炼成长',
      '诗意散文风': '语言优美，富有诗意和画面感',
      '轻松口语风': '轻松随意，口语化，像和朋友聊天',
      // 兼容旧数据（不带"风"后缀）
      '温柔治愈': '温柔细腻，治愈人心，语言柔软有温度',
      '生活碎片': '记录生活细节，真实自然，像随手写下的片段',
      '成长复盘': '以反思为主，从经历中提炼成长',
      '诗意散文': '语言优美，富有诗意和画面感',
      '轻松口语': '轻松随意，口语化，像和朋友聊天',
    };
    return map[style] || map['温柔治愈风'];
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }

  // ===== 模板生成（AI 调用失败时的回退） =====

  private buildTravelogueContent(material: SourceMaterial, input: TravelogueGenerateInput, days: DayGroup[]): string {
    const { locations, keywords, moods } = material;
    const mainLocation = locations[0] || '未知地点';
    const moodText = moods.length > 0 ? moods.join('、') : '值得记录';
    const keywordText = keywords.length > 0 ? keywords.join('、') : '旅行';

    let out = `标题：${mainLocation}游记\n`;
    out += `导语：记录了在${locations.join('、')}的旅程，心情${moodText}。\n`;
    out += `目的地：${mainLocation}\n`;
    out += `出行方式：未知\n`;
    out += `人均：未知\n`;
    out += `主题：${keywordText}\n\n`;

    days.forEach((d, i) => {
      const text = d.locationName
        ? `抵达${d.locationName}，这里的风景与人文令人难忘。`
        : `旅程的第${i + 1}天，继续探索未知的风景。`;
      out += `Day ${i + 1}：${text}\n`;
      out += `Day ${i + 1} 推荐：${d.locationName || mainLocation}值得探索\n`;
      out += `Day ${i + 1} 贴士：建议提前规划行程\n`;
    });

    out += `\n结尾：这次${mainLocation}之行，关键词是${keywordText}。带着${moodText}的心情，我把这些片段记录下来。\n`;
    out += `旅行贴士：建议提前了解目的地天气和交通情况；准备舒适的出行装备；保持开放心态享受旅途。\n`;
    return out;
  }

  // ===== 结构化游记辅助 =====

  /** 素材按创建日期分天 */
  private groupByDay(posts: Post[]): DayGroup[] {
    const map = new Map<string, DayGroup>();
    const sorted = [...posts].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    for (const p of sorted) {
      const d = new Date(p.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, { date: key, locationName: null, media: [] });
      const day = map.get(key)!;
      if (!day.locationName && p.locationName) day.locationName = p.locationName;
      for (const m of p.mediaItems || []) {
        if (m.type === 'IMAGE') day.media.push({ url: m.url || '', thumbnailUrl: m.thumbnailUrl });
      }
    }
    return [...map.values()];
  }

  /** 解析 AI 输出的结构化字段 */
  private parseStructuredTravelogue(generated: string, days: DayGroup[]): StructuredTravelogue {
    const out: StructuredTravelogue = {
      title: '', summary: '', destination: '', transport: '', budget: '', theme: '', insight: '', tips: '',
      dayTexts: new Array(days.length).fill(''),
      dayHighlights: {},
      dayTips: {},
    };
    let currentDay = -1;
    const lines = generated.split('\n');
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      const field = line.match(/^(标题|导语|目的地|出行方式|人均|主题|结尾|旅行贴士)[：:]\s*(.+)$/);
      if (field) {
        const key = field[1];
        const val = field[2].trim();
        if (key === '标题') out.title = val;
        else if (key === '导语') out.summary = val;
        else if (key === '目的地') out.destination = val;
        else if (key === '出行方式') out.transport = val;
        else if (key === '人均') out.budget = val;
        else if (key === '主题') out.theme = val;
        else if (key === '结尾') out.insight = (out.insight ? out.insight + '\n' : '') + val;
        else if (key === '旅行贴士') out.tips = val;
        continue;
      }
      // Day N 推荐： / Day N 贴士：
      const dayHighlight = line.match(/^Day\s*(\d+)\s*推荐[：:]\s*(.+)$/i);
      if (dayHighlight) {
        out.dayHighlights[parseInt(dayHighlight[1], 10) - 1] = dayHighlight[2].trim();
        continue;
      }
      const dayTip = line.match(/^Day\s*(\d+)\s*贴士[：:]\s*(.+)$/i);
      if (dayTip) {
        out.dayTips[parseInt(dayTip[1], 10) - 1] = dayTip[2].trim();
        continue;
      }
      const dayMatch = line.match(/^Day\s*(\d+)[：:]\s*(.*)$/i);
      if (dayMatch) {
        const idx = parseInt(dayMatch[1], 10) - 1;
        currentDay = idx;
        out.dayTexts[idx] = dayMatch[2].trim();
        continue;
      }
      // 归属当前章节的续行
      if (currentDay >= 0 && out.dayTexts[currentDay]) {
        out.dayTexts[currentDay] += '\n' + line;
      }
    }
    return out;
  }

  /** 组装完整 Markdown 游记（content 字段，与结构化章节一致） */
  private assembleTravelogueContent(structured: StructuredTravelogue, days: DayGroup[]): string {
    let md = `# ${structured.title || '我的游记'}\n\n`;
    if (structured.summary) md += `> ${structured.summary}\n\n`;
    const info = [
      structured.destination && `目的地：${structured.destination}`,
      structured.transport && `出行方式：${structured.transport}`,
      structured.budget && `人均：${structured.budget}`,
      structured.theme && `主题：${structured.theme}`,
    ].filter(Boolean) as string[];
    if (info.length > 0) md += info.join(' · ') + '\n\n';

    for (let i = 0; i < days.length; i++) {
      const d = days[i];
      md += `## Day ${i + 1}${d.locationName ? `｜${d.locationName}` : ''}${d.date ? `（${d.date}）` : ''}\n\n`;
      md += `${structured.dayTexts[i] || ''}\n\n`;
      if (structured.dayHighlights[i]) md += `**推荐亮点**：${structured.dayHighlights[i]}\n\n`;
      if (structured.dayTips[i]) md += `**实用贴士**：${structured.dayTips[i]}\n\n`;
    }

    if (structured.tips) md += `## 旅行贴士\n\n${structured.tips}\n\n`;
    if (structured.insight) md += `## 写在最后\n\n${structured.insight}\n\n`;
    md += `---\n*本文由 AI 辅助生成，素材来源于个人日志和日记。*`;
    return md;
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

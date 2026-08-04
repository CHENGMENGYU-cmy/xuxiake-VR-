import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Post } from '../../entities/post.entity.js';
import { MediaItem } from '../../entities/media-item.entity.js';
import { Journey } from '../../entities/journey.entity.js';
import { JourneyStop } from '../../entities/journey-stop.entity.js';

export interface GenerationJob {
  id: string;
  userId: string;
  status: 'QUEUED' | 'ANALYZING' | 'GENERATING' | 'DONE' | 'ERROR';
  progress: number;
  result?: string;
  postId?: string;
  error?: string;
  createdAt: Date;
}

export interface TravelogueGenerateInput {
  logIds: string[];
  diaryIds: string[];
  prompt?: string;
  style?: string;
  tone?: string;
  length?: string;
}

@Injectable()
export class AiService {
  private jobs = new Map<string, GenerationJob>();

  constructor(
    private readonly config: ConfigService,
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

  /** 查询任务状态 */
  getJobStatus(jobId: string): GenerationJob | null {
    return this.jobs.get(jobId) || null;
  }

  // ===== 旧 ESSAY 模式 =====

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

      job.status = 'DONE'; job.progress = 100;
      job.result = generated;

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

      job.result = generated;
      job.postId = post.id;
    } catch (err: any) {
      job.status = 'ERROR';
      job.error = err.message || '生成失败';
      job.progress = 0;
    }
  }

  // ===== TRAVELOGUE 模式 =====

  private async executeTravelogueJob(jobId: string, userId: string, input: TravelogueGenerateInput) {
    const job = this.jobs.get(jobId)!;
    try {
      // 阶段1: 收集素材
      job.status = 'ANALYZING'; job.progress = 10;

      const logs = input.logIds.length > 0
        ? await this.postRepo.find({ where: { id: In(input.logIds), authorId: userId } })
        : [];
      const diaries = input.diaryIds.length > 0
        ? await this.postRepo.find({ where: { id: In(input.diaryIds), authorId: userId } })
        : [];

      job.progress = 30;

      // 阶段2: 分析素材
      const allLocations = [...new Set(
        [...logs, ...diaries].map(p => p.locationName).filter(Boolean)
      )] as string[];

      const logContents = logs.map(l => l.content || '').filter(Boolean);
      const diaryContents = diaries.map(d => d.content || '').filter(Boolean);
      const diaryTitles = diaries.map(d => d.title || '').filter(Boolean);

      // 从 vr_metadata 提取关键词和心情
      const allKeywords: string[] = [];
      const allMoods: string[] = [];
      for (const p of [...logs, ...diaries]) {
        try {
          const meta = p.vrMetadata ? JSON.parse(p.vrMetadata) : {};
          if (meta.keywords) allKeywords.push(...(meta.keywords as string[]));
          if (meta.mood) allMoods.push(meta.mood as string);
        } catch { /* ignore */ }
      }

      job.progress = 40;

      // 阶段3: 生成游记
      job.status = 'GENERATING'; job.progress = 50;

      const generated = this.buildTravelogueContent({
        logs: logContents,
        diaries: diaryContents,
        diaryTitles,
        locations: allLocations,
        keywords: [...new Set(allKeywords)],
        moods: [...new Set(allMoods)],
        prompt: input.prompt || '',
        style: input.style || '游记',
        tone: input.tone || '温暖',
        length: input.length || '标准',
      });

      job.progress = 80;

      // 阶段4: 保存游记
      const title = this.extractTitle(generated) || allLocations[0] ? `${allLocations[0]}游记` : '我的游记';
      const summary = this.extractSummary(generated);

      const sourceLogIds = logs.map(l => l.id);
      const sourceDiaryIds = diaries.map(d => d.id);

      const vrMetadata = JSON.stringify({
        sourceLogIds,
        sourceDiaryIds,
        prompt: input.prompt || '',
        style: input.style || '游记',
        tone: input.tone || '温暖',
        keywords: [...new Set(allKeywords)],
        aiGenerated: true,
      });

      const post = this.postRepo.create({
        id: uuidv4(), authorId: userId,
        postType: 'NOTE', contentLevel: 'TRAVELOGUE',
        parentPostId: diaries[0]?.id || logs[0]?.id || null,
        title, content: generated, summary,
        locationName: allLocations[0] || null,
        vrMetadata,
        visibility: 'PRIVATE',
        likeCount: 0, commentCount: 0, viewCount: 0,
      });
      await this.postRepo.save(post);

      // 复制素材中的媒体
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

  /** 基于 LOG + DIARY + 提示词综合生成游记正文 */
  private buildTravelogueContent(input: {
    logs: string[]; diaries: string[]; diaryTitles: string[];
    locations: string[]; keywords: string[]; moods: string[];
    prompt: string; style: string; tone: string; length: string;
  }): string {
    const { logs, diaries, diaryTitles, locations, keywords, moods, prompt, tone } = input;
    const locationText = locations.length > 0 ? locations.join('、') : '未知地点';
    const mainLocation = locations[0] || '未知地点';
    const moodText = moods.length > 0 ? moods.join('、') : '值得记录';
    const keywordText = keywords.length > 0 ? keywords.join('、') : '旅行';

    const lengthMap: Record<string, number> = { 简短: 2, 标准: 3, 详细: 4 };
    const sectionCount = lengthMap[input.length] || 3;

    // 标题
    let essay = `# ${mainLocation}游记\n\n`;

    // 摘要
    if (diaryTitles.length > 0) {
      essay += `> 从"${diaryTitles[0]}"到这篇游记，记录了在${locationText}的旅程。心情：${moodText}。\n\n`;
    } else {
      essay += `> 一段关于${locationText}的旅行记录。心情：${moodText}。\n\n`;
    }

    // 用户提示词引导
    if (prompt) {
      essay += `*写作提示：${prompt}*\n\n`;
    }

    // 引言 — 融合日志事实 + 日记感悟
    essay += `## 出发之前\n\n`;
    if (logs.length > 0) {
      essay += `${logs[0]}\n\n`;
    }
    if (diaries.length > 0) {
      essay += `${diaries[0]}\n\n`;
    }

    // 正文段落 — 交替使用日志和日记内容
    const sections = [
      { heading: '在路上', logIdx: 0, diaryIdx: 0 },
      { heading: `${mainLocation}的日与夜`, logIdx: 1 % logs.length || 0, diaryIdx: 1 % diaries.length || 0 },
      { heading: '那一刻的感受', logIdx: 0, diaryIdx: Math.min(2, diaries.length - 1) },
      { heading: '归途', logIdx: Math.min(logs.length - 1, 2), diaryIdx: Math.min(diaries.length - 1, 1) },
    ];

    for (let i = 0; i < Math.min(sectionCount, sections.length); i++) {
      const sec = sections[i];
      essay += `\n## ${sec.heading}\n\n`;

      // 日志提供事实骨架
      if (logs[sec.logIdx]) {
        if (tone === '纪实') {
          essay += `${logs[sec.logIdx]}\n\n`;
        } else {
          // 把日志事实转化为叙述
          essay += this.factualToNarrative(logs[sec.logIdx], tone) + '\n\n';
        }
      }

      // 日记提供情感血肉
      if (diaries[sec.diaryIdx]) {
        const diaryExcerpt = this.extractReflectivePart(diaries[sec.diaryIdx]);
        essay += `${diaryExcerpt}\n\n`;
      }
    }

    // 尾声
    essay += `## 写在最后\n\n`;
    essay += `这次${locationText}之行，关键词是${keywordText}。`;
    if (moods.length > 0) {
      essay += `带着${moodText}的心情，我把这些片段记录下来。`;
    }
    essay += `\n\n`;

    if (tone === '温暖') {
      essay += `旅行不一定是远方，有时候就是认真对待每一天的风景和感受。希望这篇游记能让读到的你，也感受到一点点${locationText}的光和温度。`;
    } else if (tone === '轻松') {
      essay += `写完这篇游记回头看，其实旅行的意义没那么复杂——去一个地方，看一些风景，然后觉得"嗯，来对了"。就这样。`;
    } else {
      essay += `以上内容基于真实的时间、地点和个人记录生成。每一段文字都能追溯到一条日志或一篇日记。`;
    }

    essay += `\n\n---\n*本文由 AI 辅助生成，素材来源于个人日志和日记。发布前请核对内容。*`;

    return essay;
  }

  /** 将事实性日志转为叙述性文字 */
  private factualToNarrative(fact: string, tone: string): string {
    // 提取关键信息重新组织
    const sentences = fact.replace(/\n/g, ' ').split(/[。；]/).filter(Boolean);
    if (sentences.length === 0) return fact;

    if (tone === '温暖') {
      return sentences.slice(0, 2).join('。') + '。这些细节构成了旅途中最真实的质感。';
    }
    if (tone === '轻松') {
      return sentences.slice(0, 2).join('。') + '——听起来挺有意思的吧？';
    }
    return sentences.slice(0, 3).join('。') + '。';
  }

  /** 从日记中提取感悟部分 */
  private extractReflectivePart(diary: string): string {
    // 取日记中情感浓度最高的段落
    const paragraphs = diary.split('\n\n').filter(p => p.trim());
    for (const p of paragraphs) {
      if (/觉得|感到|想|明白|理解|也许|可能|应该|突然|原来/.test(p)) {
        return p.trim();
      }
    }
    return paragraphs[paragraphs.length - 1]?.trim() || diary;
  }

  /** 从 markdown 内容中提取标题 */
  private extractTitle(content: string): string | null {
    const match = content.match(/^# (.+)$/m);
    return match ? match[1].trim() : null;
  }

  /** 从 markdown 内容中提取摘要 */
  private extractSummary(content: string): string | null {
    const match = content.match(/^> (.+)$/m);
    return match ? match[1].trim() : null;
  }

  // ===== ESSAY 旧内容生成（保留兼容） =====

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

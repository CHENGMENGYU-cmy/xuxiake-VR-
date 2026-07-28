import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Post } from '../../entities/post.entity.js';
import { MediaItem } from '../../entities/media-item.entity.js';
import { Journey } from '../../entities/journey.entity.js';
import { JourneyStop } from '../../entities/journey-stop.entity.js';

interface GenerationJob {
  id: string;
  userId: string;
  status: 'QUEUED' | 'ANALYZING' | 'GENERATING' | 'DONE' | 'ERROR';
  progress: number;
  result?: string;
  error?: string;
  createdAt: Date;
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

  /** 根据种子内容（瞬间/日记）模拟生成游记 */
  async generateEssay(userId: string, seedPostIds: string[], style: string, tone: string, length: string): Promise<string> {
    const jobId = uuidv4();
    const job: GenerationJob = { id: jobId, userId, status: 'QUEUED', progress: 0, createdAt: new Date() };
    this.jobs.set(jobId, job);

    // 异步执行
    this.executeJob(jobId, userId, seedPostIds, style, tone, length).catch(() => {});

    return jobId;
  }

  private async executeJob(jobId: string, userId: string, seedPostIds: string[], style: string, tone: string, length: string) {
    const job = this.jobs.get(jobId)!;
    try {
      // 阶段1: 分析内容 (30%)
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

      // 阶段2: 生成文本 (60%)
      job.status = 'GENERATING'; job.progress = 30;
      const generated = this.buildEssayContent(contents, locations, style, tone, length, imageCount);
      job.progress = 70;

      // 阶段3: 保存游记 (90%)
      job.status = 'DONE'; job.progress = 100;
      job.result = generated;

      // 自动创建游记帖子
      const post = this.postRepo.create({
        id: uuidv4(),
        authorId: userId,
        postType: 'JOURNEY',
        contentLevel: 'ESSAY',
        content: generated,
        visibility: 'PRIVATE',
        locationName: locations[0] || null,
      });
      await this.postRepo.save(post);

      // 创建旅程记录
      const journey = this.journeyRepo.create({
        postId: post.id,
        title: locations.length > 0 ? `${locations[0]}游记` : '我的游记',
        destination: locations[0] || null,
        stopCount: locations.length,
      });
      await this.journeyRepo.save(journey);

      // 关联种子内容的媒体到新帖子
      if (seeds.some(s => s.mediaItems?.length)) {
        const allMedia = seeds.flatMap((s, si) => (s.mediaItems || []).map((m, mi) => ({
          id: uuidv4(), postId: post.id, type: m.type, url: m.url,
          thumbnailUrl: m.thumbnailUrl, duration: m.duration,
          vrFormat: m.vrFormat, sortOrder: si * 10 + mi,
        })));
        await this.mediaRepo.save(allMedia);
      }

      // 创建站点
      for (let i = 0; i < locations.length; i++) {
        const stop = this.journeyStopRepo.create({
          journeyId: journey.id, dayNumber: i + 1,
          locationName: locations[i], description: `第${i + 1}站`,
          sortOrder: i,
        });
        await this.journeyStopRepo.save(stop);
      }

      job.result = generated;
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

    // 基于原始内容生成结构化文章
    let essay = `# ${locationText}${styleText}\n\n`;
    essay += `> 一段${toneText}的旅程，${imageCount > 0 ? `共记录了${imageCount}个精彩瞬间。` : '用心感受每一刻。'}\n\n`;

    // 引言
    essay += `## 出发\n\n`;
    essay += `踏上前往${locationText}的旅程，心中充满了期待。`;

    // 正文段落
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

    // 结尾
    essay += `\n\n## 尾声\n\n`;
    essay += `这次${locationText}之旅，留下了太多美好的回忆。`;
    essay += `每一张照片、每一段视频，都是珍贵的记忆。`;
    essay += `期待下一次的旅程，继续探索这个美丽的世界。`;

    return essay;
  }

  /** 查询任务状态 */
  getJobStatus(jobId: string): GenerationJob | null {
    return this.jobs.get(jobId) || null;
  }
}

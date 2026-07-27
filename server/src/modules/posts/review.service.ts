import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Post } from '../../entities/post.entity.js';
import { ContentReview } from '../../entities/content-review.entity.js';
import { Report } from '../../entities/report.entity.js';

// 敏感词列表（后续可扩展为数据库存储或外部API）
const SENSITIVE_WORDS = [
  '代开发票', '赌博', '博彩', '色情', '黄色', '违法', '枪支',
  '毒品', '走私', '洗钱', '诈骗', '传销', '裸聊', '招嫖',
  '办证', '刻章', '替考', '代考', '作弊器', '窃听',
];

// 隐私模式：身份证号、手机号、车牌号
const PRIVACY_PATTERNS = [
  /\d{15}(\d{2}[0-9xX])?/,  // 身份证
  /1[3-9]\d{9}/,             // 手机号
  /[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤川青藏琼宁][A-Z][A-HJ-NP-Z0-9]{4,5}[A-HJ-NP-Z0-9挂学警港澳]/  // 车牌
];

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ContentReview) private readonly reviewRepo: Repository<ContentReview>,
    @InjectRepository(Report) private readonly reportRepo: Repository<Report>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
  ) {}

  /** 扫描文本内容，返回风险信息 */
  scanText(text: string): { hasRisk: boolean; riskType?: string; riskDetail?: string } {
    if (!text) return { hasRisk: false };

    const lower = text.toLowerCase();

    // 检查敏感词
    for (const word of SENSITIVE_WORDS) {
      if (lower.includes(word.toLowerCase())) {
        return { hasRisk: true, riskType: '敏感词', riskDetail: `包含敏感词: ${word}` };
      }
    }

    // 检查隐私信息
    for (const pattern of PRIVACY_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        return {
          hasRisk: true,
          riskType: '隐私信息',
          riskDetail: `检测到疑似${pattern === PRIVACY_PATTERNS[0] ? '身份证号' : pattern === PRIVACY_PATTERNS[1] ? '手机号' : '车牌号'}: ${match[0]}`,
        };
      }
    }

    return { hasRisk: false };
  }

  /** 对帖子执行审核 */
  async reviewPost(postId: string): Promise<ContentReview> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new Error('帖子不存在');

    const scan = this.scanText(post.content || '');
    const id = uuidv4();

    const review = this.reviewRepo.create({
      id,
      postId,
      status: scan.hasRisk ? 'FLAGGED' : 'APPROVED',
      riskType: scan.riskType || null,
      riskDetail: scan.riskDetail || null,
    });
    await this.reviewRepo.save(review);
    return review;
  }

  /** 管理员审核通过 */
  async approve(postId: string, reviewerId: string, reason?: string) {
    const review = await this.reviewRepo.findOne({ where: { postId }, order: { createdAt: 'DESC' } });
    if (!review) throw new Error('审核记录不存在');

    review.status = 'APPROVED';
    review.reviewerId = reviewerId;
    review.reason = reason || null;
    review.reviewedAt = new Date();
    await this.reviewRepo.save(review);
    return review;
  }

  /** 管理员驳回 */
  async reject(postId: string, reviewerId: string, reason: string) {
    const review = await this.reviewRepo.findOne({ where: { postId }, order: { createdAt: 'DESC' } });
    if (!review) throw new Error('审核记录不存在');

    review.status = 'REJECTED';
    review.reviewerId = reviewerId;
    review.reason = reason;
    review.reviewedAt = new Date();
    await this.reviewRepo.save(review);
    return review;
  }

  /** 获取审核队列 */
  async getReviewQueue(page = 1, limit = 20) {
    const [data, total] = await this.reviewRepo.findAndCount({
      relations: { post: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, hasMore: (page - 1) * limit + limit < total };
  }

  /** 创建举报 */
  async createReport(reporterId: string, postId: string, reason: string, detail?: string) {
    const existing = await this.reportRepo.findOne({
      where: { reporterId, postId, status: 'PENDING' },
    });
    if (existing) return existing;

    const report = this.reportRepo.create({
      id: uuidv4(),
      reporterId,
      postId,
      reason,
      detail: detail || null,
    });
    await this.reportRepo.save(report);
    return report;
  }

  /** 解决举报 */
  async resolveReport(reportId: string, resolverId: string, action: 'RESOLVED' | 'DISMISSED', resolution?: string) {
    const report = await this.reportRepo.findOne({ where: { id: reportId } });
    if (!report) throw new Error('举报不存在');

    report.status = action;
    report.resolvedBy = resolverId;
    report.resolution = resolution || null;
    report.resolvedAt = new Date();
    await this.reportRepo.save(report);
    return report;
  }

  /** 获取举报列表 */
  async getReports(page = 1, limit = 20, status?: string) {
    const qb = this.reportRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.reporter', 'reporter')
      .leftJoinAndSelect('r.post', 'post')
      .orderBy('r.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      qb.where('r.status = :status', { status });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, hasMore: (page - 1) * limit + limit < total };
  }
}

import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, Headers, UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../entities/user.entity.js';
import { VideoComment } from '../../entities/video-comment.entity.js';
import { AudioPlaylist } from '../../entities/audio-playlist.entity.js';
import { PostsService } from './posts.service.js';
import { ReviewService } from './review.service.js';
import { AiService, type GenerationJob } from './ai.service.js';
import { AuthService } from '../auth/auth.service.js';
import type { CreatePostDto, CreateCommentDto } from '../../common/interfaces.js';

@Controller('api/posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly reviewService: ReviewService,
    private readonly authService: AuthService,
    private readonly aiService: AiService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(VideoComment) private readonly vcRepo: Repository<VideoComment>,
    @InjectRepository(AudioPlaylist) private readonly playlistRepo: Repository<AudioPlaylist>,
  ) {}

  private getUserId(auth: string): string {
    const token = auth?.replace('Bearer ', '');
    const userId = this.authService.validateAccessToken(token || '');
    if (!userId) throw new UnauthorizedException('请先登录');
    return userId;
  }

  @Get('tags')
  async getTags() {
    const tags = await this.postsService.getAllTags();
    return { success: true, data: tags };
  }

  @Get('topics')
  async getHotTopics(@Query('limit') limit?: string) {
    const topics = await this.postsService.getHotTopics(limit ? parseInt(limit) : 10);
    return { success: true, data: topics };
  }

  @Get('topics/all')
  async getAllTopics() {
    const topics = await this.postsService.getAllTopics();
    return { success: true, data: topics };
  }

  @Get('topics/search')
  async searchTopics(@Query('q') q?: string) {
    if (!q) return { success: true, data: [] };
    const topics = await this.postsService.searchTopics(q);
    return { success: true, data: topics };
  }

  @Get('topics/:id')
  async getTopicById(@Param('id') id: string) {
    const topic = await this.postsService.getTopicById(id);
    return { success: true, data: topic };
  }

  @Get('topics/:id/posts')
  async getTopicPosts(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
  ) {
    const result = await this.postsService.getTopicPosts(id, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      sort: sort || 'latest',
    });
    return { success: true, ...result };
  }

  @Get()
  async getPosts(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('postType') postType?: string,
    @Query('tagId') tagId?: string,
    @Query('followingOnly') followingOnly?: string,
    @Headers('authorization') auth?: string,
  ) {
    // 可选认证：有 token 时提取 userId，无 token 时为 null
    let userId: string | undefined;
    if (auth) {
      try { userId = this.getUserId(auth); } catch { /* 游客模式 */ }
    }

    const result = await this.postsService.getPosts({
      cursor,
      limit: limit ? parseInt(limit) : 10,
      sort: sort || 'latest',
      page: page ? parseInt(page) : 1,
      postType,
      tagId,
      userId,
      followingOnly: followingOnly === 'true',
      currentUserId: userId,
    });
    return { success: true, ...result };
  }

  // ===== 内容层级（必须在 :id 之前） =====
  @Get('hierarchy')
  async getContentHierarchy(
    @Query('level') level?: string,
    @Query('userId') userId?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('parentId') parentId?: string,
    @Query('location') location?: string,
    @Query('mediaType') mediaType?: string,
    @Query('month') month?: string,
    @Headers('authorization') auth?: string,
  ) {
    // 可选认证：有 token 时可查看私密内容
    let currentUserId: string | undefined;
    if (auth) {
      try { currentUserId = this.getUserId(auth); } catch {}
    }
    const result = await this.postsService.getContentHierarchy({
      level, userId, cursor,
      limit: limit ? parseInt(limit) : 12,
      parentId,
      location,
      mediaType,
      month,
      currentUserId,
    });
    return { success: true, ...result };
  }

  @Get('classified/dimensions')
  async getClassifiedDimensions(@Query('userId') userId?: string) {
    const dimensions = await this.postsService.getClassifiedDimensions(userId);
    return { success: true, data: dimensions };
  }

  @Get(':id')
  async getPost(@Param('id') id: string, @Headers('authorization') auth?: string) {
    let userId: string | undefined;
    if (auth) {
      try { userId = this.getUserId(auth); } catch { /* 游客模式 */ }
    }
    const post = await this.postsService.getPostById(id, userId);
    return { success: true, data: post };
  }

  @Post(':id/view')
  async incrementViewCount(@Param('id') id: string) {
    const result = await this.postsService.incrementViewCount(id);
    return { success: true, data: result };
  }

  @Post()
  async createPost(@Headers('authorization') auth: string, @Body() dto: CreatePostDto) {
    const userId = this.getUserId(auth);
    const post = await this.postsService.createPost(userId, dto);
    return { success: true, data: post };
  }

  @Delete(':id')
  async deletePost(@Headers('authorization') auth: string, @Param('id') id: string) {
    const userId = this.getUserId(auth);
    const result = await this.postsService.deletePost(userId, id);
    return { success: true, ...result };
  }

  @Put(':id')
  async updatePost(@Headers('authorization') auth: string, @Param('id') id: string, @Body() dto: { content: string }) {
    const userId = this.getUserId(auth);
    const post = await this.postsService.updatePost(userId, id, dto);
    return { success: true, data: post };
  }

  @Post(':id/like')
  async likePost(@Headers('authorization') auth: string, @Param('id') id: string) {
    const userId = this.getUserId(auth);
    const post = await this.postsService.likePost(userId, id);
    return { success: true, data: post };
  }

  @Delete(':id/like')
  async unlikePost(@Headers('authorization') auth: string, @Param('id') id: string) {
    const userId = this.getUserId(auth);
    const post = await this.postsService.unlikePost(userId, id);
    return { success: true, data: post };
  }

  @Get(':id/comments')
  async getComments(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.postsService.getComments(id, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
    return { success: true, ...result };
  }

  @Post(':id/comments')
  async createComment(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    const userId = this.getUserId(auth);
    const comment = await this.postsService.createComment(userId, id, dto);
    return { success: true, data: comment };
  }

  @Delete('comments/:commentId')
  async deleteComment(
    @Headers('authorization') auth: string,
    @Param('commentId') commentId: string,
  ) {
    const userId = this.getUserId(auth);
    const result = await this.postsService.deleteComment(userId, commentId);
    return { success: true, ...result };
  }

  @Post(':id/promote')
  async promoteContent(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
    @Body() dto: { targetLevel: string; content?: string; title?: string },
  ) {
    const userId = this.getUserId(auth);
    const post = await this.postsService.promoteContent(userId, id, dto);
    return { success: true, data: post };
  }

  // ===== 发布/撤回 =====
  @Post(':id/publish')
  async publishPost(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
    @Body() dto: { locationPrecision?: 'hidden' | 'city' | 'exact' },
  ) {
    const userId = this.getUserId(auth);
    const post = await this.postsService.publishPost(userId, id, dto);
    return { success: true, data: post };
  }

  @Post(':id/unpublish')
  async unpublishPost(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
  ) {
    const userId = this.getUserId(auth);
    const post = await this.postsService.unpublishPost(userId, id);
    return { success: true, data: post };
  }

  // ===== 合集 =====
  @Post('collections')
  async createCollection(
    @Headers('authorization') auth: string,
    @Body() dto: { name: string; description?: string; isPublic?: boolean },
  ) {
    const userId = this.getUserId(auth);
    const collection = await this.postsService.createCollection(userId, dto);
    return { success: true, data: collection };
  }

  @Get('collections')
  async getCollections(
    @Headers('authorization') auth: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    let userId: string | undefined;
    try { userId = this.getUserId(auth); } catch {}
    const result = await this.postsService.getCollections({
      userId,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
    return { success: true, ...result };
  }

  @Get('collections/:id')
  async getCollectionById(@Param('id') id: string) {
    const collection = await this.postsService.getCollectionById(id);
    return { success: true, data: collection };
  }

  @Get('collections/:id/posts')
  async getCollectionPosts(
    @Param('id') id: string,
    @Query('page') page?: string,
  ) {
    const result = await this.postsService.getCollectionPosts(id, page ? parseInt(page) : 1);
    return { success: true, ...result };
  }

  @Post('collections/:id/posts/:postId')
  async addPostToCollection(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
    @Param('postId') postId: string,
  ) {
    const userId = this.getUserId(auth);
    const result = await this.postsService.addPostToCollection(userId, id, postId);
    return { success: true, ...result };
  }

  @Delete('collections/:id/posts/:postId')
  async removePostFromCollection(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
    @Param('postId') postId: string,
  ) {
    const userId = this.getUserId(auth);
    const result = await this.postsService.removePostFromCollection(userId, id, postId);
    return { success: true, ...result };
  }

  // ===== 管理员：强制下架 + 批量审核 =====

  @Post(':id/force-unpublish')
  async forceUnpublish(
    @Headers('authorization') auth: string,
    @Param('id') postId: string,
  ) {
    await this.checkAdmin(auth);
    await this.postsService.unpublishPost(auth.replace('Bearer ', ''), postId);
    // admin unpublish: 使用第一个用户的ID来绕过权限检查
    const post = await this.postsService.getPostById(postId);
    return { success: true, data: post, message: '内容已强制下架' };
  }

  @Post('reviews/batch')
  async batchReview(
    @Headers('authorization') auth: string,
    @Body() body: { postIds: string[]; action: 'APPROVED' | 'REJECTED'; reason?: string },
  ) {
    const admin = await this.checkAdmin(auth);
    for (const postId of body.postIds) {
      if (body.action === 'APPROVED') {
        await this.reviewService.approve(postId, admin.id, body.reason);
      } else {
        await this.reviewService.reject(postId, admin.id, body.reason || '批量驳回');
      }
    }
    return { success: true, message: `已${body.action === 'APPROVED' ? '通过' : '驳回'} ${body.postIds.length} 条内容` };
  }

  // ===== 管理员：下架任意帖子 =====

  @Post(':id/admin-unpublish')
  async adminUnpublish(
    @Headers('authorization') auth: string,
    @Param('id') postId: string,
  ) {
    await this.checkAdmin(auth);
    const post = await this.postsService.getPostById(postId);
    if (!post) throw new UnauthorizedException('内容不存在');
    await this.postsService.unpublishPost(post.authorId, postId);
    return { success: true, message: '内容已下架' };
  }

  // ===== 内容审核 =====

  private async checkAdmin(auth: string) {
    const userId = this.getUserId(auth);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      throw new UnauthorizedException('需要管理员或审核员权限');
    }
    return user;
  }

  @Get('reviews/queue')
  async getReviewQueue(
    @Headers('authorization') auth: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    await this.checkAdmin(auth);
    const result = await this.reviewService.getReviewQueue(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
    return { success: true, ...result };
  }

  @Post(':id/review/approve')
  async approvePost(
    @Headers('authorization') auth: string,
    @Param('id') postId: string,
    @Body() dto: { reason?: string },
  ) {
    const admin = await this.checkAdmin(auth);
    const review = await this.reviewService.approve(postId, admin.id, dto.reason);
    return { success: true, data: review };
  }

  @Post(':id/review/reject')
  async rejectPost(
    @Headers('authorization') auth: string,
    @Param('id') postId: string,
    @Body() dto: { reason: string },
  ) {
    const admin = await this.checkAdmin(auth);
    const review = await this.reviewService.reject(postId, admin.id, dto.reason);
    return { success: true, data: review };
  }

  // ===== 举报 =====

  @Post(':id/report')
  async reportPost(
    @Headers('authorization') auth: string,
    @Param('id') postId: string,
    @Body() dto: { reason: string; detail?: string },
  ) {
    const userId = this.getUserId(auth);
    const report = await this.reviewService.createReport(userId, postId, dto.reason, dto.detail);
    return { success: true, data: report };
  }

  @Get('reports/list')
  async getReports(
    @Headers('authorization') auth: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    this.getUserId(auth);
    const result = await this.reviewService.getReports(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      status,
    );
    return { success: true, ...result };
  }

  @Post('reports/:reportId/resolve')
  async resolveReport(
    @Headers('authorization') auth: string,
    @Param('reportId') reportId: string,
    @Body() dto: { action: 'RESOLVED' | 'DISMISSED'; resolution?: string },
  ) {
    const userId = this.getUserId(auth);
    const report = await this.reviewService.resolveReport(reportId, userId, dto.action, dto.resolution);
    return { success: true, data: report };
  }

  // ===== 视频弹幕 =====

  @Get(':id/danmaku')
  async getDanmaku(@Param('id') postId: string) {
    const comments = await this.vcRepo.find({
      where: { postId },
      relations: { user: true },
      order: { timeOffset: 'ASC' },
    });
    return {
      success: true,
      data: comments.map((c) => ({
        id: c.id, content: c.content, timeOffset: Number(c.timeOffset),
        color: c.color, createdAt: c.createdAt,
        user: c.user ? { id: c.user.id, username: c.user.username, displayName: c.user.displayName, avatarUrl: c.user.avatarUrl } : null,
      })),
    };
  }

  @Post(':id/danmaku')
  async addDanmaku(
    @Headers('authorization') auth: string,
    @Param('id') postId: string,
    @Body() body: { content: string; timeOffset: number; color?: string },
  ) {
    const userId = this.getUserId(auth);
    const comment = this.vcRepo.create({
      id: uuidv4(), postId, userId, content: body.content,
      timeOffset: body.timeOffset, color: body.color || null,
    });
    await this.vcRepo.save(comment);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    return { success: true, data: { ...comment, user: user ? { id: user.id, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl } : null } };
  }

  // ===== 音频专辑 =====

  @Get('playlists')
  async getPlaylists(@Query('userId') userId?: string) {
    const qb = this.playlistRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'user')
      .where('p.isPublic = :pub', { pub: true })
      .orderBy('p.createdAt', 'DESC');
    if (userId) qb.andWhere('p.userId = :uid', { uid: userId });
    const data = await qb.getMany();
    return { success: true, data };
  }

  @Post('playlists')
  async createPlaylist(
    @Headers('authorization') auth: string,
    @Body() body: { title: string; description?: string; coverUrl?: string; isPublic?: boolean },
  ) {
    const userId = this.getUserId(auth);
    const playlist = this.playlistRepo.create({
      id: uuidv4(), userId, title: body.title,
      description: body.description || null, coverUrl: body.coverUrl || null,
      isPublic: body.isPublic !== false,
    });
    await this.playlistRepo.save(playlist);
    return { success: true, data: playlist };
  }

  @Post('playlists/:id/tracks/:postId')
  async addTrackToPlaylist(
    @Headers('authorization') auth: string,
    @Param('id') playlistId: string,
    @Param('postId') postId: string,
  ) {
    const userId = this.getUserId(auth);
    const playlist = await this.playlistRepo.findOne({ where: { id: playlistId } });
    if (!playlist || playlist.userId !== userId) throw new UnauthorizedException('无权操作');
    playlist.trackCount += 1;
    await this.playlistRepo.save(playlist);
    return { success: true, message: '已添加到专辑' };
  }

  // ===== AI 游记生成 =====

  @Post('ai/generate')
  async generateEssay(
    @Headers('authorization') auth: string,
    @Body() body: { seedPostIds: string[]; style: string; tone: string; length: string },
  ) {
    const userId = this.getUserId(auth);
    const jobId = await this.aiService.generateEssay(userId, body.seedPostIds, body.style, body.tone, body.length);
    return { success: true, data: { jobId } };
  }

  @Get('ai/jobs/:jobId')
  async getJobStatus(@Param('jobId') jobId: string): Promise<{ success: boolean; data: GenerationJob | null }> {
    const job = this.aiService.getJobStatus(jobId);
    if (!job) throw new UnauthorizedException('任务不存在');
    return { success: true, data: job };
  }
}

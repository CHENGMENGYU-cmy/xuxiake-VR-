import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, Headers, UnauthorizedException,
} from '@nestjs/common';
import { PostsService } from './posts.service.js';
import { AuthService } from '../auth/auth.service.js';
import type { CreatePostDto, CreateCommentDto } from '../../common/interfaces.js';

@Controller('api/posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly authService: AuthService,
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
}

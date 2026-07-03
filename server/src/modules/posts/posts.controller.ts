import {
  Controller, Get, Post, Delete, Body, Param, Query, Headers, UnauthorizedException,
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

  @Get()
  async getPosts(@Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    const result = await this.postsService.getPosts(cursor, limit ? parseInt(limit) : 10);
    return { success: true, ...result };
  }

  @Get(':id')
  async getPost(@Param('id') id: string) {
    const post = await this.postsService.getPostById(id);
    return { success: true, data: post };
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
  async getComments(@Param('id') id: string) {
    const comments = await this.postsService.getComments(id);
    return { success: true, data: comments };
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
}

import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity.js';

@Controller('api/feed')
export class FeedController {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
  ) {}

  @Get()
  async getFeed(@Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 10;
    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.mediaItems', 'mediaItems')
      .where('post.visibility = :vis', { vis: 'PUBLIC' })
      .orderBy('post.createdAt', 'DESC')
      .take(limitNum + 1);

    if (cursor) {
      qb.andWhere('post.id != :cursor', { cursor });
    }

    const posts = await qb.getMany();
    const hasMore = posts.length > limitNum;
    const data = posts.slice(0, limitNum);

    return {
      success: true,
      data: data.map((p) => this.formatPost(p)),
      nextCursor: hasMore ? data[data.length - 1].id : null,
      hasMore,
    };
  }

  private formatPost(post: Post) {
    const { passwordHash, ...author } = post.author;
    return {
      ...post,
      author: {
        ...author,
        vrDeviceInfo: author.vrDeviceModel
          ? { model: author.vrDeviceModel, version: author.vrDeviceVersion || '' }
          : null,
      },
      location: post.locationLat
        ? { lat: Number(post.locationLat), lng: Number(post.locationLng), name: post.locationName || '' }
        : null,
      vrMetadata: post.vrMetadata ? JSON.parse(post.vrMetadata) : null,
      isLiked: false,
    };
  }
}

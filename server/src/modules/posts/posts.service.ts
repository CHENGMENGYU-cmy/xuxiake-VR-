import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Post } from '../../entities/post.entity.js';
import { MediaItem } from '../../entities/media-item.entity.js';
import { Comment } from '../../entities/comment.entity.js';
import { Like } from '../../entities/like.entity.js';
import { Notification } from '../../entities/notification.entity.js';
import { User } from '../../entities/user.entity.js';
import { CreatePostDto, CreateCommentDto } from '../../common/interfaces.js';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(MediaItem) private readonly mediaRepo: Repository<MediaItem>,
    @InjectRepository(Comment) private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Like) private readonly likeRepo: Repository<Like>,
    @InjectRepository(Notification) private readonly notifRepo: Repository<Notification>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async getPosts(options: { cursor?: string; limit?: number; sort?: string; page?: number } = {}) {
    const { cursor, limit = 10, sort = 'latest', page = 1 } = options;

    // trending 和 hot 使用 offset 分页（排名动态变化），latest 使用 cursor 分页
    if (sort === 'trending') {
      return this.getTrendingPosts(limit, page);
    }
    if (sort === 'hot') {
      return this.getHotPosts(limit, page);
    }

    // 默认 latest：按时间倒序，cursor 分页
    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.mediaItems', 'mediaItems')
      .where('post.visibility = :vis', { vis: 'PUBLIC' })
      .orderBy('post.createdAt', 'DESC')
      .take(limit + 1);

    if (cursor) {
      const cursorPost = await this.postRepo.findOne({ where: { id: cursor } });
      if (cursorPost) {
        qb.andWhere('post.createdAt < :cursorDate', { cursorDate: cursorPost.createdAt });
      }
    }

    const posts = await qb.getMany();
    const hasMore = posts.length > limit;
    const data = posts.slice(0, limit);

    return {
      data: data.map((p) => this.formatPost(p)),
      nextCursor: hasMore ? data[data.length - 1].id : null,
      hasMore,
    };
  }

  private async getTrendingPosts(limit: number, page: number) {
    // 热门内容：加权热度分 + 时间衰减
    // score = (likeCount*3 + commentCount*2 + viewCount*0.1) * timeDecay
    const offset = (page - 1) * limit;

    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.mediaItems', 'mediaItems')
      .where('post.visibility = :vis', { vis: 'PUBLIC' })
      .addSelect(
        `(post.like_count * 3 + post.comment_count * 2 + post.view_count * 0.1) * GREATEST(0.1, 1 - TIMESTAMPDIFF(DAY, post.created_at, NOW()) / 30)`,
        'hot_score',
      )
      .orderBy('hot_score', 'DESC')
      .skip(offset)
      .take(limit + 1);

    const [posts, total] = await qb.getManyAndCount();
    const hasMore = posts.length > limit;
    const data = posts.slice(0, limit);

    return {
      data: data.map((p) => this.formatPost(p)),
      nextCursor: null,
      hasMore,
      page,
      total,
    };
  }

  private async getHotPosts(limit: number, page: number) {
    // 精选推荐：高互动量帖子（点赞 + 评论）
    const offset = (page - 1) * limit;

    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.mediaItems', 'mediaItems')
      .where('post.visibility = :vis', { vis: 'PUBLIC' })
      .addSelect('post.like_count + post.comment_count', 'engagement')
      .orderBy('engagement', 'DESC')
      .addOrderBy('post.view_count', 'DESC')
      .skip(offset)
      .take(limit + 1);

    const posts = await qb.getMany();
    const hasMore = posts.length > limit;
    const data = posts.slice(0, limit);

    return {
      data: data.map((p) => this.formatPost(p)),
      nextCursor: null,
      hasMore,
      page,
    };
  }

  async getPostById(id: string) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: { author: true, mediaItems: true },
    });
    if (!post) throw new NotFoundException('内容不存在');
    post.viewCount += 1;
    await this.postRepo.save(post);
    return this.formatPost(post);
  }

  async createPost(userId: string, dto: CreatePostDto) {
    const postId = uuidv4();
    const post = this.postRepo.create({
      id: postId,
      authorId: userId,
      content: dto.content || null,
      locationLat: dto.location?.lat || null,
      locationLng: dto.location?.lng || null,
      locationName: dto.location?.name || null,
      vrMetadata: dto.vrMetadata ? JSON.stringify(dto.vrMetadata) : null,
      visibility: dto.visibility || 'PUBLIC',
      likeCount: 0,
      commentCount: 0,
      viewCount: 0,
    });
    await this.postRepo.save(post);

    if (dto.mediaItems?.length) {
      const mediaItems = dto.mediaItems.map((m, i) =>
        this.mediaRepo.create({
          id: uuidv4(),
          postId,
          type: m.type,
          url: m.url,
          thumbnailUrl: m.thumbnailUrl || null,
          duration: m.duration || null,
          vrFormat: m.vrFormat || null,
          language: m.language || null,
          translatedText: m.translatedText || null,
          linkUrl: m.linkUrl || null,
          linkTitle: m.linkTitle || null,
          linkDescription: m.linkDescription || null,
          sortOrder: i,
        }),
      );
      await this.mediaRepo.save(mediaItems);
    }

    return this.getPostById(postId);
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('内容不存在');
    if (post.authorId !== userId) throw new NotFoundException('无权删除此内容');
    await this.postRepo.remove(post);
    return { message: '删除成功' };
  }

  async likePost(userId: string, postId: string) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('内容不存在');

    const existing = await this.likeRepo.findOne({ where: { userId, postId } });
    if (!existing) {
      const like = this.likeRepo.create({ id: uuidv4(), userId, postId });
      await this.likeRepo.save(like);

      post.likeCount += 1;
      await this.postRepo.save(post);

      if (post.authorId !== userId) {
        const notif = this.notifRepo.create({
          id: uuidv4(),
          recipientId: post.authorId,
          senderId: userId,
          type: 'LIKE',
          message: '有人赞了你的内容',
          postId,
        });
        await this.notifRepo.save(notif);
      }
    }

    return this.getPostById(postId);
  }

  async unlikePost(userId: string, postId: string) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('内容不存在');

    const existing = await this.likeRepo.findOne({ where: { userId, postId } });
    if (existing) {
      await this.likeRepo.remove(existing);
      if (post.likeCount > 0) {
        post.likeCount -= 1;
        await this.postRepo.save(post);
      }
    }

    return this.getPostById(postId);
  }

  async getComments(postId: string) {
    const comments = await this.commentRepo.find({
      where: { postId },
      relations: { author: true },
      order: { createdAt: 'DESC' },
    });
    return comments.map((c) => {
      const { passwordHash, ...author } = c.author;
      return {
        ...c,
        author: { ...author, vrDeviceInfo: null },
      };
    });
  }

  async createComment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('内容不存在');

    const comment = this.commentRepo.create({
      id: uuidv4(),
      content: dto.content,
      authorId: userId,
      postId,
      parentId: dto.parentId || null,
    });
    await this.commentRepo.save(comment);

    post.commentCount += 1;
    await this.postRepo.save(post);

    if (post.authorId !== userId) {
      const notif = this.notifRepo.create({
        id: uuidv4(),
        recipientId: post.authorId,
        senderId: userId,
        type: 'COMMENT',
        message: '有人评论了你的内容',
        postId,
      });
      await this.notifRepo.save(notif);
    }

    const commentAuthor = await this.userRepo.findOne({ where: { id: userId } });
    const { passwordHash: _, ...author } = commentAuthor || {} as any;
    return { ...comment, author: author || null };
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('评论不存在');
    if (comment.authorId !== userId) throw new NotFoundException('无权删除此评论');

    const post = await this.postRepo.findOne({ where: { id: comment.postId } });
    if (post && post.commentCount > 0) {
      post.commentCount -= 1;
      await this.postRepo.save(post);
    }

    await this.commentRepo.remove(comment);
    return { message: '删除成功' };
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

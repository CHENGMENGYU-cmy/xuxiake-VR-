import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Post } from '../../entities/post.entity.js';
import { MediaItem } from '../../entities/media-item.entity.js';
import { Comment } from '../../entities/comment.entity.js';
import { Like } from '../../entities/like.entity.js';
import { User } from '../../entities/user.entity.js';
import { InterestTag } from '../../entities/interest-tag.entity.js';
import { Topic } from '../../entities/topic.entity.js';
import { Journey } from '../../entities/journey.entity.js';
import { JourneyStop } from '../../entities/journey-stop.entity.js';
import { JourneyStopMedia } from '../../entities/journey-stop-media.entity.js';
import { Collection } from '../../entities/collection.entity.js';
import { CollectionPost } from '../../entities/collection-post.entity.js';
import { UserFollow } from '../../entities/user-follow.entity.js';
import { CreatePostDto, CreateCommentDto } from '../../common/interfaces.js';
import { NotificationsService } from '../notifications/notifications.service.js';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(MediaItem) private readonly mediaRepo: Repository<MediaItem>,
    @InjectRepository(Comment) private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Like) private readonly likeRepo: Repository<Like>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(InterestTag) private readonly tagRepo: Repository<InterestTag>,
    @InjectRepository(Topic) private readonly topicRepo: Repository<Topic>,
    @InjectRepository(Journey) private readonly journeyRepo: Repository<Journey>,
    @InjectRepository(JourneyStop) private readonly journeyStopRepo: Repository<JourneyStop>,
    @InjectRepository(JourneyStopMedia) private readonly journeyStopMediaRepo: Repository<JourneyStopMedia>,
    @InjectRepository(Collection) private readonly collectionRepo: Repository<Collection>,
    @InjectRepository(CollectionPost) private readonly collectionPostRepo: Repository<CollectionPost>,
    @InjectRepository(UserFollow) private readonly followRepo: Repository<UserFollow>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getPosts(options: { cursor?: string; limit?: number; sort?: string; page?: number; postType?: string; tagId?: string; userId?: string; followingOnly?: boolean; currentUserId?: string; excludeContentLevel?: string; contentLevel?: string; excludeContentLevels?: string[] } = {}) {
    const { cursor, limit = 10, sort = 'latest', page = 1, postType, tagId, userId, followingOnly, currentUserId, excludeContentLevel, contentLevel, excludeContentLevels } = options;

    // 关注动态模式：查询关注列表
    let followingIds: string[] | null = null;
    if (followingOnly && userId) {
      const follows = await this.followRepo.find({ where: { followerId: userId } });
      followingIds = follows.map((f) => f.followingId);
      // 如果没有关注任何人，返回空
      if (followingIds.length === 0) {
        return { data: [], nextCursor: null, hasMore: false };
      }
    }

    // trending 和 hot 使用 offset 分页（排名动态变化），latest 使用 cursor 分页
    if (sort === 'trending') {
      return this.getTrendingPosts(limit, page, postType, tagId, followingIds, currentUserId, excludeContentLevel);
    }
    if (sort === 'hot') {
      return this.getHotPosts(limit, page, postType, tagId, followingIds, currentUserId, excludeContentLevel);
    }

    // 默认 latest：按时间倒序，cursor 分页
    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.mediaItems', 'mediaItems')
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoinAndSelect('post.topics', 'topics')
      .orderBy('post.createdAt', 'DESC')
      .take(limit + 1);

    // 可见性过滤
    if (followingIds) {
      qb.where('post.authorId IN (:...followingIds)', { followingIds });
      qb.andWhere('post.visibility IN (:...visList)', { visList: ['PUBLIC', 'FOLLOWERS'] });
    } else {
      qb.where('post.visibility = :vis', { vis: 'PUBLIC' });
    }


    // 软删内容不展示
    qb.andWhere('post.deletedAt IS NULL');

    if (postType) {
      qb.andWhere('post.postType = :postType', { postType });
    }
    if (tagId) {
      qb.innerJoin('post.tags', 'filterTag', 'filterTag.id = :tagId', { tagId });
    }
    if (excludeContentLevel) {
      qb.andWhere('(post.contentLevel IS NULL OR post.contentLevel != :excludeLevel)', { excludeLevel: excludeContentLevel });
    }
    if (contentLevel) {
      qb.andWhere('post.contentLevel = :contentLevel', { contentLevel });
    }
    if (excludeContentLevels && excludeContentLevels.length > 0) {
      qb.andWhere('post.contentLevel NOT IN (:...excludeLevels)', { excludeLevels: excludeContentLevels });
    }

    if (cursor) {
      const cursorPost = await this.postRepo.findOne({ where: { id: cursor, deletedAt: IsNull() } });
      if (cursorPost) {
        qb.andWhere('post.createdAt < :cursorDate', { cursorDate: cursorPost.createdAt });
      }
    }

    const posts = await qb.getMany();
    const hasMore = posts.length > limit;
    const data = posts.slice(0, limit);

    // 查询当前用户的点赞状态
    let likedIds = new Set<string>();
    if (currentUserId && data.length > 0) {
      const likes = await this.likeRepo.find({
        where: { userId: currentUserId, postId: In(data.map((p) => p.id)) },
      });
      likedIds = new Set(likes.map((l) => l.postId));
    }

    return {
      data: data.map((p) => this.formatPost(p, likedIds.has(p.id))),
      nextCursor: hasMore ? data[data.length - 1].id : null,
      hasMore,
    };
  }

  private async getTrendingPosts(limit: number, page: number, postType?: string, tagId?: string, followingIds?: string[] | null, currentUserId?: string, excludeContentLevel?: string, contentLevel?: string, excludeContentLevels?: string[]) {
    // 热门内容：加权热度分 + 时间衰减
    // score = (likeCount*3 + commentCount*2 + viewCount*0.1) * timeDecay
    const offset = (page - 1) * limit;

    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.mediaItems', 'mediaItems')
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoinAndSelect('post.topics', 'topics');

    if (followingIds && followingIds.length > 0) {
      qb.where('post.authorId IN (:...followingIds)', { followingIds });
      qb.andWhere('post.visibility IN (:...visList)', { visList: ['PUBLIC', 'FOLLOWERS'] });
    } else {
      qb.where('post.visibility = :vis', { vis: 'PUBLIC' });
    }

    qb.andWhere('post.deletedAt IS NULL');

    qb.addSelect(
        `(post.like_count * 3 + post.comment_count * 2 + post.view_count * 0.1) * GREATEST(0.1, 1 - TIMESTAMPDIFF(DAY, post.created_at, NOW()) / 30)`,
        'hot_score',
      )
      .orderBy('hot_score', 'DESC')
      .skip(offset)
      .take(limit + 1);

    if (postType) {
      qb.andWhere('post.postType = :postType', { postType });
    }
    if (tagId) {
      qb.innerJoin('post.tags', 'filterTag', 'filterTag.id = :tagId', { tagId });
    }
    if (excludeContentLevel) {
      qb.andWhere('(post.contentLevel IS NULL OR post.contentLevel != :excludeLevel)', { excludeLevel: excludeContentLevel });
    }
    if (contentLevel) {
      qb.andWhere('post.contentLevel = :contentLevel', { contentLevel });
    }
    if (excludeContentLevels && excludeContentLevels.length > 0) {
      qb.andWhere('post.contentLevel NOT IN (:...excludeLevels)', { excludeLevels: excludeContentLevels });
    }

    const [posts, total] = await qb.getManyAndCount();
    const hasMore = posts.length > limit;
    const data = posts.slice(0, limit);

    let likedIds = new Set<string>();
    if (currentUserId && data.length > 0) {
      const likes = await this.likeRepo.find({ where: { userId: currentUserId, postId: In(data.map((p) => p.id)) } });
      likedIds = new Set(likes.map((l) => l.postId));
    }

    return {
      data: data.map((p) => this.formatPost(p, likedIds.has(p.id))),
      nextCursor: null,
      hasMore,
      page,
      total,
    };
  }

  private async getHotPosts(limit: number, page: number, postType?: string, tagId?: string, followingIds?: string[] | null, currentUserId?: string, excludeContentLevel?: string, contentLevel?: string, excludeContentLevels?: string[]) {
    // 精选推荐：高互动量帖子（点赞 + 评论）
    const offset = (page - 1) * limit;

    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.mediaItems', 'mediaItems')
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoinAndSelect('post.topics', 'topics');

    if (followingIds && followingIds.length > 0) {
      qb.where('post.authorId IN (:...followingIds)', { followingIds });
      qb.andWhere('post.visibility IN (:...visList)', { visList: ['PUBLIC', 'FOLLOWERS'] });
    } else {
      qb.where('post.visibility = :vis', { vis: 'PUBLIC' });
    }

    qb.andWhere('post.deletedAt IS NULL');

    qb.addSelect('post.like_count + post.comment_count', 'engagement')
      .orderBy('engagement', 'DESC')
      .addOrderBy('post.view_count', 'DESC')
      .skip(offset)
      .take(limit + 1);

    if (postType) {
      qb.andWhere('post.postType = :postType', { postType });
    }
    if (tagId) {
      qb.innerJoin('post.tags', 'filterTag', 'filterTag.id = :tagId', { tagId });
    }
    if (excludeContentLevel) {
      qb.andWhere('(post.contentLevel IS NULL OR post.contentLevel != :excludeLevel)', { excludeLevel: excludeContentLevel });
    }

    const posts = await qb.getMany();
    const hasMore = posts.length > limit;
    const data = posts.slice(0, limit);

    let likedIds = new Set<string>();
    if (currentUserId && data.length > 0) {
      const likes = await this.likeRepo.find({ where: { userId: currentUserId, postId: In(data.map((p) => p.id)) } });
      likedIds = new Set(likes.map((l) => l.postId));
    }

    return {
      data: data.map((p) => this.formatPost(p, likedIds.has(p.id))),
      nextCursor: null,
      hasMore,
      page,
    };
  }

  async incrementViewCount(id: string) {
    const post = await this.postRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!post) throw new NotFoundException('内容不存在');
    post.viewCount += 1;
    await this.postRepo.save(post);
    return { viewCount: post.viewCount };
  }

  async getPostById(id: string, currentUserId?: string) {
    const post = await this.postRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { author: true, mediaItems: true, tags: true, topics: true },
    });
    if (!post) throw new NotFoundException('内容不存在');

    // 非公开内容只有作者可查看
    if (post.visibility !== 'PUBLIC' && (!currentUserId || post.authorId !== currentUserId)) {
      throw new NotFoundException('内容不存在或已被下架');
    }

    post.viewCount += 1;
    await this.postRepo.save(post);

    // 查询当前用户是否已点赞
    let isLiked = false;
    if (currentUserId) {
      const like = await this.likeRepo.findOne({ where: { userId: currentUserId, postId: id } });
      isLiked = !!like;
    }

    // 加载旅程数据
    let journey: Journey | null = null;
    if (post.postType === 'JOURNEY') {
      journey = await this.journeyRepo.findOne({
        where: { postId: id },
        relations: { stops: { mediaItems: true } },
      });
    }

    return { ...this.formatPost(post, isLiked), journey };
  }

  async createPost(userId: string, dto: CreatePostDto) {
    const postId = uuidv4();
    const post = this.postRepo.create({
      id: postId,
      authorId: userId,
      communityId: dto.communityId || null,
      postType: dto.postType || 'NOTE',
      contentLevel: dto.contentLevel || 'SNAPSHOT',
      parentPostId: dto.parentPostId || null,
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

    // 处理标签关联
    if (dto.tagIds?.length) {
      const tags = await this.tagRepo.find({ where: { id: In(dto.tagIds) } });
      if (tags.length > 0) {
        post.tags = tags;
        await this.postRepo.save(post);
      }
    }

    // 处理话题关联（自动创建不存在的话题）
    if (dto.topicNames?.length) {
      const topics: Topic[] = [];
      for (const name of dto.topicNames) {
        let topic = await this.topicRepo.findOne({ where: { name } });
        if (!topic) {
          topic = this.topicRepo.create({ id: uuidv4(), name, postCount: 0 });
          await this.topicRepo.save(topic);
        }
        topic.postCount += 1;
        await this.topicRepo.save(topic);
        topics.push(topic);
      }
      if (topics.length > 0) {
        post.topics = topics;
        await this.postRepo.save(post);
      }
    }

    // 处理旅程记录（JOURNEY类型）
    if (dto.postType === 'JOURNEY' && dto.journey) {
      const journey = this.journeyRepo.create({
        postId,
        title: dto.journey.title,
        startDate: dto.journey.startDate || null,
        endDate: dto.journey.endDate || null,
        destination: dto.journey.destination || null,
        coverUrl: dto.journey.coverUrl || null,
        summary: dto.journey.summary || null,
        transport: dto.journey.transport || null,
        budget: dto.journey.budget || null,
        theme: dto.journey.theme || null,
        insight: dto.journey.insight || null,
        tips: dto.journey.tips || null,
        stopCount: dto.journey.stops?.length || 0,
      });
      await this.journeyRepo.save(journey);

      if (dto.journey.stops?.length) {
        for (let i = 0; i < dto.journey.stops.length; i++) {
          const s = dto.journey.stops[i];
          const stop = await this.journeyStopRepo.save(this.journeyStopRepo.create({
            journeyId: journey.id,
            dayNumber: s.dayNumber || null,
            dayDate: s.dayDate || null,
            locationName: s.locationName || null,
            locationLat: s.locationLat || null,
            locationLng: s.locationLng || null,
            description: s.description || null,
            highlights: s.highlights || null,
            tips: s.tips || null,
            mediaUrl: s.mediaUrl || null,
            sortOrder: i,
          }));
          if (s.mediaItems?.length) {
            await this.journeyStopMediaRepo.save(s.mediaItems.map((m, mi) =>
              this.journeyStopMediaRepo.create({
                stopId: stop.id,
                url: m.url,
                thumbnailUrl: m.thumbnailUrl || null,
                sortOrder: mi,
              }),
            ));
          }
        }
      }
    }

    return this.getPostById(postId, userId);
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('内容不存在');
    if (post.authorId !== userId) throw new NotFoundException('无权删除此内容');
    // 软删除：置 deleted_at，列表/统计/详情统一按 deleted_at IS NULL 过滤，数据可恢复
    await this.postRepo.update({ id: postId }, { deletedAt: new Date() });
    return { message: '删除成功' };
  }

  async updatePost(userId: string, postId: string, dto: { content?: string; journey?: CreatePostDto['journey'] }) {
    const post = await this.postRepo.findOne({
      where: { id: postId, deletedAt: IsNull() },
      relations: { author: true, mediaItems: true, tags: true, topics: true },
    });
    if (!post) throw new NotFoundException('内容不存在');
    if (post.authorId !== userId) throw new NotFoundException('无权编辑此内容');

    if (dto.content !== undefined) post.content = dto.content;
    await this.postRepo.save(post);

    // 更新游记结构：先删旧 stops/media，再按新结构重建
    if (dto.journey) {
      const old = await this.journeyRepo.findOne({ where: { postId } });
      if (old) {
        const oldStops = await this.journeyStopRepo.find({ where: { journeyId: old.id } });
        if (oldStops.length > 0) {
          await this.journeyStopMediaRepo.delete({ stopId: In(oldStops.map((s) => s.id)) });
          await this.journeyStopRepo.delete({ journeyId: old.id });
        }
        await this.journeyRepo.update(old.id, {
          title: dto.journey.title,
          startDate: dto.journey.startDate || null,
          endDate: dto.journey.endDate || null,
          destination: dto.journey.destination || null,
          coverUrl: dto.journey.coverUrl || null,
          summary: dto.journey.summary || null,
          transport: dto.journey.transport || null,
          budget: dto.journey.budget || null,
          theme: dto.journey.theme || null,
          insight: dto.journey.insight || null,
          tips: dto.journey.tips || null,
          stopCount: dto.journey.stops?.length || 0,
        });
        if (dto.journey.stops?.length) {
          for (let i = 0; i < dto.journey.stops.length; i++) {
            const s = dto.journey.stops[i];
            const stop = await this.journeyStopRepo.save(this.journeyStopRepo.create({
              journeyId: old.id,
              dayNumber: s.dayNumber || null,
              dayDate: s.dayDate || null,
              locationName: s.locationName || null,
              locationLat: s.locationLat || null,
              locationLng: s.locationLng || null,
              description: s.description || null,
              highlights: s.highlights || null,
              tips: s.tips || null,
              mediaUrl: s.mediaUrl || null,
              sortOrder: i,
            }));
            if (s.mediaItems?.length) {
              await this.journeyStopMediaRepo.save(s.mediaItems.map((m, mi) =>
                this.journeyStopMediaRepo.create({
                  stopId: stop.id,
                  url: m.url,
                  thumbnailUrl: m.thumbnailUrl || null,
                  sortOrder: mi,
                }),
              ));
            }
          }
        }
      }
    }

    const updated = { ...this.formatPost(post), journey: null as Journey | null };
    if (post.postType === 'JOURNEY') {
      updated.journey = await this.journeyRepo.findOne({
        where: { postId },
        relations: { stops: { mediaItems: true } },
      });
    }
    return updated;
  }

  async likePost(userId: string, postId: string) {
    const post = await this.postRepo.findOne({ where: { id: postId, deletedAt: IsNull() } });
    if (!post) throw new NotFoundException('内容不存在');

    const existing = await this.likeRepo.findOne({ where: { userId, postId } });
    if (!existing) {
      const like = this.likeRepo.create({ id: uuidv4(), userId, postId });
      await this.likeRepo.save(like);

      post.likeCount += 1;
      await this.postRepo.save(post);

      if (post.authorId !== userId) {
        await this.notificationsService.create(post.authorId, userId, 'LIKE', '有人赞了你的内容', postId);
      }
    }

    return this.getPostById(postId, userId);
  }

  async unlikePost(userId: string, postId: string) {
    const post = await this.postRepo.findOne({ where: { id: postId, deletedAt: IsNull() } });
    if (!post) throw new NotFoundException('内容不存在');

    const existing = await this.likeRepo.findOne({ where: { userId, postId } });
    if (existing) {
      await this.likeRepo.remove(existing);
      if (post.likeCount > 0) {
        post.likeCount -= 1;
        await this.postRepo.save(post);
      }
    }

    return this.getPostById(postId, userId);
  }

  async getComments(postId: string, options: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    // 查询顶级评论（分页）
    const [topLevel, total] = await this.commentRepo.findAndCount({
      where: { postId, parentId: IsNull() },
      relations: { author: true },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    // 查询这些顶级评论的回复
    const commentIds = topLevel.map((c) => c.id);
    let replies: Comment[] = [];
    if (commentIds.length > 0) {
      replies = await this.commentRepo.find({
        where: { postId, parentId: In(commentIds) },
        relations: { author: true },
        order: { createdAt: 'ASC' },
      });
    }

    // 构建树形结构
    const replyMap = new Map<string, Comment[]>();
    for (const reply of replies) {
      const list = replyMap.get(reply.parentId!) || [];
      list.push(reply);
      replyMap.set(reply.parentId!, list);
    }

    const data = topLevel.map((c) => ({
      ...this.formatComment(c),
      replies: (replyMap.get(c.id) || []).map((r) => this.formatComment(r)),
    }));

    return { data, total, page, hasMore: offset + limit < total };
  }

  private formatComment(comment: Comment) {
    const { passwordHash, ...author } = comment.author || ({} as any);
    return {
      id: comment.id,
      content: comment.content,
      postId: comment.postId,
      parentId: comment.parentId,
      createdAt: comment.createdAt,
      author: {
        ...author,
        vrDeviceInfo: author?.vrDeviceModel
          ? { model: author.vrDeviceModel, version: author.vrDeviceVersion || '' }
          : null,
      },
    };
  }

  async createComment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.postRepo.findOne({ where: { id: postId, deletedAt: IsNull() } });
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

    // 通知帖子作者
    if (post.authorId !== userId) {
      await this.notificationsService.create(post.authorId, userId, 'COMMENT', '有人评论了你的内容', postId);
    }

    // 如果是回复评论，通知被回复的用户
    if (dto.parentId) {
      const parentComment = await this.commentRepo.findOne({ where: { id: dto.parentId } });
      if (parentComment && parentComment.authorId !== userId && parentComment.authorId !== post.authorId) {
        await this.notificationsService.create(parentComment.authorId, userId, 'COMMENT', '有人回复了你的评论', postId);
      }
    }

    const commentAuthor = await this.userRepo.findOne({ where: { id: userId } });
    return this.formatComment({ ...comment, author: commentAuthor } as Comment);
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('评论不存在');
    if (comment.authorId !== userId) throw new NotFoundException('无权删除此评论');

    // 递归获取所有子评论 ID
    const allIds = await this.getDescendantCommentIds(commentId);
    allIds.push(commentId);

    const post = await this.postRepo.findOne({ where: { id: comment.postId } });
    if (post) {
      post.commentCount = Math.max(0, post.commentCount - allIds.length);
      await this.postRepo.save(post);
    }

    await this.commentRepo.delete(allIds);
    return { message: '删除成功' };
  }

  private async getDescendantCommentIds(parentId: string): Promise<string[]> {
    const children = await this.commentRepo.find({ where: { parentId } });
    const ids: string[] = [];
    for (const child of children) {
      ids.push(child.id);
      const subIds = await this.getDescendantCommentIds(child.id);
      ids.push(...subIds);
    }
    return ids;
  }

  formatPost(post: Post, isLiked = false) {
    const { passwordHash, ...author } = post.author || ({} as any);
    return {
      ...post,
      author: {
        ...author,
        vrDeviceInfo: author?.vrDeviceModel
          ? { model: author.vrDeviceModel, version: author.vrDeviceVersion || '' }
          : null,
      },
      location: post.locationLat
        ? { lat: Number(post.locationLat), lng: Number(post.locationLng), name: post.locationName || '' }
        : null,
      vrMetadata: post.vrMetadata ? JSON.parse(post.vrMetadata) : null,
      tags: post.tags || [],
      topics: post.topics || [],
      isLiked,
    };
  }

  // ===== 内容层级查询 =====
  async getContentHierarchy(options: {
    level?: string; userId?: string; cursor?: string; limit?: number;
    parentId?: string; location?: string; mediaType?: string; month?: string;
    currentUserId?: string;
  } = {}) {
    const { level, userId, cursor, limit = 12, parentId, location, mediaType, month, currentUserId } = options;

    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.mediaItems', 'mediaItems')
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoinAndSelect('post.topics', 'topics')
      .leftJoinAndSelect('post.parentPost', 'parentPost')
      .orderBy('post.createdAt', 'DESC')
      .take(limit + 1);

    // 可见性：有认证用户时可查看自己的私密内容，否则只看公开
    if (currentUserId) {
      qb.where('(post.visibility = :vis OR (post.authorId = :currentUserId AND post.visibility = :priv))', {
        vis: 'PUBLIC', currentUserId, priv: 'PRIVATE',
      });
    } else {
      qb.where('post.visibility = :vis', { vis: 'PUBLIC' });
    }

    // 软删内容不展示
    qb.andWhere('post.deletedAt IS NULL');

    if (level) {
      if (level === 'TRAVELOGUE') {
        // 游记层级兼容 ESSAY（手写章节式游记统一为 TRAVELOGUE，兼容旧数据）
        qb.andWhere('post.contentLevel IN (:...levels)', { levels: ['TRAVELOGUE', 'ESSAY'] });
      } else {
        qb.andWhere('post.contentLevel = :level', { level });
      }
    }
    if (userId) {
      qb.andWhere('post.authorId = :userId', { userId });
    }
    if (parentId) {
      qb.andWhere('post.parentPostId = :parentId', { parentId });
    }
    // 按地点过滤
    if (location) {
      qb.andWhere('post.locationName = :location', { location });
    }
    // 按媒体类型过滤
    if (mediaType) {
      qb.innerJoin('post.mediaItems', 'filterMedia', 'filterMedia.type = :mediaType', { mediaType });
    }
    // 按月份过滤
    if (month) {
      qb.andWhere("DATE_FORMAT(post.createdAt, '%Y-%m') = :month", { month });
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

  async getClassifiedDimensions(userId?: string) {
    const buildBase = (qb: any) => {
      qb.where('post.contentLevel IN (:...levels)', { levels: ['SNAPSHOT'] });
      if (userId) {
        qb.andWhere('post.authorId = :userId', { userId });
      }
      qb.andWhere('post.deletedAt IS NULL');
    };

    const byLocationQb = this.postRepo.createQueryBuilder('post')
      .select('post.locationName', 'location')
      .addSelect('COUNT(post.id)', 'count');
    buildBase(byLocationQb);

    const byLocation = await byLocationQb
      .groupBy('post.locationName')
      .having('post.locationName IS NOT NULL')
      .orderBy('count', 'DESC')
      .take(10)
      .getRawMany();

    const byTypeQb = this.postRepo.createQueryBuilder('post')
      .select('post.postType', 'type')
      .addSelect('COUNT(post.id)', 'count');
    buildBase(byTypeQb);

    const byType = await byTypeQb
      .groupBy('post.postType')
      .getRawMany();

    const byTimeQb = this.postRepo.createQueryBuilder('post')
      .select("DATE_FORMAT(post.createdAt, '%Y-%m')", 'month')
      .addSelect('COUNT(post.id)', 'count');
    buildBase(byTimeQb);

    const byTime = await byTimeQb
      .groupBy('month')
      .orderBy('month', 'DESC')
      .take(12)
      .getRawMany();

    const byTripQb = this.postRepo.createQueryBuilder('post')
      .select('post.tripId', 'tripId')
      .addSelect('post.tripTitle', 'tripTitle')
      .addSelect('COUNT(post.id)', 'count');
    buildBase(byTripQb);

    const byTrip = await byTripQb
      .andWhere('post.tripId IS NOT NULL')
      .groupBy('post.tripId, post.tripTitle')
      .orderBy('count', 'DESC')
      .getRawMany();

    return {
      byLocation: byLocation.map((r) => ({ name: r.location, count: Number(r.count) })),
      byType: byType.map((r) => ({ type: r.type, count: Number(r.count) })),
      byTime: byTime.map((r) => ({ month: r.month, count: Number(r.count) })),
      byTrip: byTrip.map((r) => ({ tripId: r.tripId, name: r.tripTitle || '未命名行程', count: Number(r.count) })),
    };
  }

  // ===== 行程 =====

  /** 当前用户的行程列表（按 tripId 分组 SNAPSHOT） */
  async getUserTrips(userId: string) {
    const rows = await this.postRepo.createQueryBuilder('post')
      .select('post.tripId', 'tripId')
      .addSelect('post.tripTitle', 'tripTitle')
      .addSelect('COUNT(post.id)', 'count')
      .addSelect('MIN(post.createdAt)', 'startTime')
      .addSelect('MAX(post.createdAt)', 'endTime')
      .where('post.contentLevel = :lv', { lv: 'SNAPSHOT' })
      .andWhere('post.authorId = :uid', { uid: userId })
      .andWhere('post.tripId IS NOT NULL')
      .andWhere('post.deletedAt IS NULL')
      .groupBy('post.tripId, post.tripTitle')
      .orderBy('endTime', 'DESC')
      .getRawMany();

    const tripIds = rows.map((r) => r.tripId);
    const coverMap = new Map<string, string>();
    if (tripIds.length > 0) {
      const media = await this.mediaRepo.createQueryBuilder('m')
        .innerJoin('m.post', 'post')
        .select('post.tripId', 'tripId')
        .addSelect('COALESCE(m.thumbnail_url, m.url)', 'thumb')
        .where('post.tripId IN (:...tripIds)', { tripIds })
        .andWhere('m.type = :mt', { mt: 'IMAGE' })
        .orderBy('m.sort_order', 'ASC')
        .getRawMany();
      for (const row of media) {
        if (!coverMap.has(row.tripId)) coverMap.set(row.tripId, row.thumb);
      }
    }

    return rows.map((r) => ({
      tripId: r.tripId,
      tripTitle: r.tripTitle || '未命名行程',
      count: Number(r.count),
      startTime: r.startTime,
      endTime: r.endTime,
      cover: coverMap.get(r.tripId) || null,
    }));
  }

  /** 行程下所有 SNAPSHOT 的 id（供 AI 生成游记） */
  async getTripSnapshotIds(userId: string, tripId: string): Promise<string[]> {
    const posts = await this.postRepo.find({
      where: { authorId: userId, contentLevel: 'SNAPSHOT', tripId, deletedAt: IsNull() },
      select: { id: true },
    });
    return posts.map((p) => p.id);
  }

  // ===== 发布/撤回 =====
  async publishPost(userId: string, postId: string, dto?: { locationPrecision?: 'hidden' | 'city' | 'exact'; visibility?: 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE' }) {
    const post = await this.postRepo.findOne({
      where: { id: postId, deletedAt: IsNull() },
      relations: { author: true, mediaItems: true, tags: true, topics: true },
    });
    if (!post) throw new NotFoundException('内容不存在');
    if (post.authorId !== userId) throw new NotFoundException('无权发布此内容');

    // 地点精度处理
    if (dto?.locationPrecision === 'hidden') {
      post.locationName = null;
      post.locationLat = null;
      post.locationLng = null;
    } else if (dto?.locationPrecision === 'city' && post.locationName) {
      // 只保留城市级别（取第一个逗号前的部分）
      const parts = post.locationName.split(/[,，]/);
      post.locationName = parts[0];
      post.locationLat = null;
      post.locationLng = null;
    }

    post.visibility = dto?.visibility || 'PUBLIC';
    post.updatedAt = new Date();
    await this.postRepo.save(post);
    return this.formatPost(post);
  }

  async unpublishPost(userId: string, postId: string) {
    const post = await this.postRepo.findOne({
      where: { id: postId, deletedAt: IsNull() },
      relations: { author: true, mediaItems: true, tags: true, topics: true },
    });
    if (!post) throw new NotFoundException('内容不存在');
    if (post.authorId !== userId) throw new NotFoundException('无权撤回此内容');

    post.visibility = 'PRIVATE';
    post.updatedAt = new Date();
    await this.postRepo.save(post);
    return this.formatPost(post);
  }

  async promoteContent(userId: string, postId: string, dto: { targetLevel: string; content?: string; title?: string }) {
    const post = await this.postRepo.findOne({ where: { id: postId, authorId: userId, deletedAt: IsNull() } });
    if (!post) throw new NotFoundException('内容不存在');

    const validLevels = ['SNAPSHOT', 'DIARY', 'TRAVELOGUE', 'ESSAY'];
    if (!validLevels.includes(dto.targetLevel)) throw new NotFoundException('无效的目标层级');

    const newPost = this.postRepo.create({
      id: uuidv4(),
      authorId: userId,
      postType: post.postType,
      contentLevel: dto.targetLevel as Post['contentLevel'],
      parentPostId: post.id,
      content: dto.content || post.content,
      locationLat: post.locationLat,
      locationLng: post.locationLng,
      locationName: post.locationName,
      vrMetadata: post.vrMetadata,
      visibility: 'PRIVATE',
      likeCount: 0,
      commentCount: 0,
      viewCount: 0,
    });

    await this.postRepo.save(newPost);

    // 如果升级到 ESSAY，关联 journey
    if (dto.targetLevel === 'ESSAY') {
      const journey = this.journeyRepo.create({
        postId: newPost.id,
        title: dto.title || post.locationName || '未命名游记',
        destination: post.locationName,
        stopCount: 0,
      });
      await this.journeyRepo.save(journey);
    }

    return this.formatPost(newPost);
  }

  // ===== 标签查询 =====
  async getAllTags() {
    return this.tagRepo.find({ order: { sortOrder: 'DESC', name: 'ASC' } });
  }

  async getHotTopics(limit = 10) {
    return this.topicRepo.find({
      where: { isHot: true },
      order: { postCount: 'DESC' },
      take: limit,
    });
  }

  async searchTopics(keyword: string) {
    return this.topicRepo
      .createQueryBuilder('topic')
      .where('topic.name LIKE :kw', { kw: `%${keyword}%` })
      .orderBy('topic.postCount', 'DESC')
      .take(20)
      .getMany();
  }

  async getTopicById(id: string) {
    const topic = await this.topicRepo.findOne({ where: { id } });
    if (!topic) throw new NotFoundException('话题不存在');
    return topic;
  }

  async getTopicPosts(topicId: string, options: { page?: number; limit?: number; sort?: string } = {}) {
    const { page = 1, limit = 10, sort = 'latest' } = options;
    const offset = (page - 1) * limit;

    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.mediaItems', 'mediaItems')
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoinAndSelect('post.topics', 'topics')
      .innerJoin('post.topics', 'topic', 'topic.id = :topicId', { topicId })
      .where('post.visibility = :vis', { vis: 'PUBLIC' });

    if (sort === 'hot') {
      qb.addSelect('post.like_count + post.comment_count', 'engagement')
        .orderBy('engagement', 'DESC')
        .addOrderBy('post.view_count', 'DESC');
    } else {
      qb.orderBy('post.createdAt', 'DESC');
    }

    qb.skip(offset).take(limit + 1);
    const posts = await qb.getMany();
    const hasMore = posts.length > limit;
    const data = posts.slice(0, limit);

    return {
      data: data.map((p) => this.formatPost(p)),
      hasMore,
      page,
    };
  }

  // ===== 素材查询 =====

  /** 获取用户的闪拍记录列表（仅私人素材） */
  async getUserSnaps(userId: string, limit = 500) {
    const snaps = await this.postRepo.find({
      where: { authorId: userId, contentLevel: 'SNAPSHOT', visibility: 'PRIVATE', deletedAt: IsNull() },
      relations: { mediaItems: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return snaps.map((p) => this.formatPost(p));
  }


  /** 获取用户的日记列表（本人可查看自己的私密日记，他人只能看公开的） */
  async getUserDiaries(userId: string, viewerId?: string) {
    const isOwner = viewerId === userId;
    const diaries = await this.postRepo.find({
      where: {
        authorId: userId,
        contentLevel: 'DIARY',
        deletedAt: IsNull(),
        ...(isOwner ? {} : { visibility: 'PUBLIC' as const }),
      },
      relations: { mediaItems: true },
      order: { createdAt: 'DESC' },
      take: 50,
    });
    return diaries.map((p) => this.formatPost(p));
  }

  /** 获取用户的游记列表 */
  async getUserTravelogues(userId: string, viewerId?: string) {
    const isOwner = viewerId === userId;
    const travelogues = await this.postRepo.find({
      where: {
        authorId: userId,
        contentLevel: 'TRAVELOGUE',
        deletedAt: IsNull(),
        ...(isOwner ? {} : { visibility: 'PUBLIC' as const }),
      },
      relations: { mediaItems: true },
      order: { createdAt: 'DESC' },
      take: 50,
    });
    return travelogues.map((p) => this.formatPost(p));
  }

  // ===== 日记功能 =====

  /** 获取日记广场（所有公开日记） */
  async getDiarySquare(limit = 20, cursor?: string) {
    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.mediaItems', 'mediaItems')
      .leftJoinAndSelect('post.tags', 'tags')
      .where('post.contentLevel = :level', { level: 'DIARY' })
      .andWhere('post.visibility = :vis', { vis: 'PUBLIC' })
      .andWhere('post.deletedAt IS NULL')
      .orderBy('post.createdAt', 'DESC')
      .take(limit + 1);

    if (cursor) {
      const cursorPost = await this.postRepo.findOne({ where: { id: cursor, deletedAt: IsNull() } });
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

  /** 查询指定素材的已有日记草稿（仅查草稿状态的） */
  async getDiaryDraft(userId: string, snapId: string) {
    const draft = await this.postRepo.findOne({
      where: {
        authorId: userId,
        parentPostId: snapId,
        contentLevel: 'DIARY',
        visibility: 'PRIVATE',
        deletedAt: IsNull(),
      },
      relations: { mediaItems: true },
      order: { updatedAt: 'DESC' },
    });
    if (!draft) return null;

    // 只有 vrMetadata.status 为 draft 的才算草稿
    try {
      const meta = typeof draft.vrMetadata === 'string' ? JSON.parse(draft.vrMetadata) : (draft.vrMetadata || {});
      if (meta.status !== 'draft') return null;
      // 批量草稿（多张素材合成）不在此单张入口恢复，避免单张生成页误加载
      if (Array.isArray(meta.sourceSnapIds) && meta.sourceSnapIds.length > 1) return null;
    } catch {
      return null;
    }

    return this.formatPost(draft);
  }

  /** 保存/发布日记（支持新建和更新已有草稿） */
  async saveDiary(userId: string, dto: {
    diaryId?: string;
    snapId?: string;
    title: string;
    content: string;
    insight?: string;
    style?: string;
    tags?: string[];
    visibility?: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS';
    status?: 'draft' | 'private' | 'public';
    image?: string;
    mood?: string;
    weather?: string;
  }) {
    // 状态映射：public→PUBLIC, draft/private→PRIVATE
    const visibility = dto.status === 'public'
      ? 'PUBLIC'
      : (dto.visibility || 'PRIVATE');

    const vrMetadata: Record<string, unknown> = {
      insight: dto.insight || '',
      style: dto.style || '',
      generatorTags: dto.tags || [],
      status: dto.status || 'private',
    };

    // mood/weather 仅显式提供时写入（undefined 则保留编辑时的旧值）
    if (dto.mood !== undefined) vrMetadata.mood = dto.mood;
    if (dto.weather !== undefined) vrMetadata.weather = dto.weather;

    if (dto.image) {
      vrMetadata.coverImage = dto.image;
    }

    let post: any;
    let isUpdate = false;

    // 如果提供了 diaryId，更新已有帖子
    if (dto.diaryId) {
      post = await this.postRepo.findOne({
        where: { id: dto.diaryId, authorId: userId, contentLevel: 'DIARY' },
        relations: { mediaItems: true },
      });
      if (post) {
        isUpdate = true;
        let oldMeta: Record<string, unknown> = {};
        try {
          oldMeta = typeof post.vrMetadata === 'string' ? JSON.parse(post.vrMetadata) : (post.vrMetadata || {});
        } catch {}
        post.title = dto.title;
        post.content = dto.content;
        post.visibility = visibility;
        // 合并旧元数据，保留 sourceSnapIds / aiGenerated / keywords 等 AI 溯源字段
        post.vrMetadata = JSON.stringify({ ...oldMeta, ...vrMetadata });
        post.updatedAt = new Date();
      }
    }

    // 如果没有找到已有帖子，创建新的
    if (!post) {
      post = this.postRepo.create({
        id: uuidv4(),
        authorId: userId,
        postType: 'NOTE',
        contentLevel: 'DIARY',
        parentPostId: dto.snapId || null,
        title: dto.title,
        content: dto.content,
        vrMetadata: JSON.stringify(vrMetadata),
        visibility,
        likeCount: 0,
        commentCount: 0,
        viewCount: 0,
      });
    }

    await this.postRepo.save(post);

    // 仅首次创建时复制闪拍媒体和位置
    if (!isUpdate && dto.snapId) {
      const snap = await this.postRepo.findOne({
        where: { id: dto.snapId },
        relations: { mediaItems: true },
      });
      if (snap) {
        post.locationLat = snap.locationLat;
        post.locationLng = snap.locationLng;
        post.locationName = snap.locationName;
        await this.postRepo.save(post);

        if (snap.mediaItems?.length) {
          const copiedMedia = snap.mediaItems.map((m) =>
            this.mediaRepo.create({
              id: uuidv4(),
              postId: post.id,
              type: m.type,
              url: m.url,
              thumbnailUrl: m.thumbnailUrl,
              duration: m.duration,
              width: m.width,
              height: m.height,
              vrFormat: m.vrFormat,
              sortOrder: m.sortOrder,
            }),
          );
          await this.mediaRepo.save(copiedMedia);
        }

        // 标记闪拍已生成过日记
        try {
          const snapMeta = snap.vrMetadata ? JSON.parse(snap.vrMetadata) : {};
          snapMeta.hasDiary = true;
          snapMeta.diaryId = post.id;
          snap.vrMetadata = JSON.stringify(snapMeta);
          await this.postRepo.save(snap);
        } catch { /* ignore */ }
      }
    }

    return this.getPostById(post.id, userId);
  }

  async getAllTopics(limit = 50) {
    return this.topicRepo.find({
      order: { postCount: 'DESC' },
      take: limit,
    });
  }

  // ===== 合集管理 =====
  async createCollection(userId: string, dto: { name: string; description?: string; isPublic?: boolean }) {
    const collection = this.collectionRepo.create({
      id: uuidv4(),
      creatorId: userId,
      name: dto.name,
      description: dto.description || null,
      isPublic: dto.isPublic !== false,
      postCount: 0,
    });
    await this.collectionRepo.save(collection);
    return collection;
  }

  async updateCollection(userId: string, collectionId: string, dto: { name?: string; description?: string; isPublic?: boolean }) {
    const collection = await this.collectionRepo.findOne({ where: { id: collectionId } });
    if (!collection) throw new NotFoundException('收藏夹不存在');
    if (collection.creatorId !== userId) throw new NotFoundException('无权操作此收藏夹');
    if (dto.name !== undefined) collection.name = dto.name;
    if (dto.description !== undefined) collection.description = dto.description;
    if (dto.isPublic !== undefined) collection.isPublic = dto.isPublic;
    await this.collectionRepo.save(collection);
    return collection;
  }

  async deleteCollection(userId: string, collectionId: string) {
    const collection = await this.collectionRepo.findOne({ where: { id: collectionId } });
    if (!collection) throw new NotFoundException('收藏夹不存在');
    if (collection.creatorId !== userId) throw new NotFoundException('无权操作此收藏夹');
    await this.collectionPostRepo.delete({ collectionId });
    await this.collectionRepo.remove(collection);
  }

  async getCollections(options: { userId?: string; onlyMine?: boolean; page?: number; limit?: number } = {}) {
    const { userId, onlyMine, page = 1, limit = 20 } = options;
    const qb = this.collectionRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.creator', 'creator')
      .orderBy('c.postCount', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (onlyMine && userId) {
      qb.where('c.creatorId = :userId', { userId });
    } else {
      qb.where('c.isPublic = :pub', { pub: true });
      if (userId) {
        qb.orWhere('c.creatorId = :userId', { userId });
      }
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page };
  }

  async getCollectionById(id: string) {
    const collection = await this.collectionRepo.findOne({
      where: { id },
      relations: { creator: true },
    });
    if (!collection) throw new NotFoundException('合集不存在');
    return collection;
  }

  async getCollectionPosts(collectionId: string, userId?: string, page = 1, limit = 20) {
    const collection = await this.collectionRepo.findOne({ where: { id: collectionId } });
    if (!collection) throw new NotFoundException('合集不存在');
    // 私有收藏夹仅创建者可查看内容
    if (!collection.isPublic && collection.creatorId !== userId) {
      throw new NotFoundException('合集不存在');
    }

    const qb = this.collectionPostRepo
      .createQueryBuilder('cp')
      .leftJoinAndSelect('cp.post', 'post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.mediaItems', 'mediaItems')
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoinAndSelect('post.topics', 'topics')
      .where('cp.collectionId = :cid', { cid: collectionId })
      .andWhere('post.deletedAt IS NULL')
      .orderBy('cp.sortOrder', 'ASC')
      .skip((page - 1) * limit)
      .take(limit + 1);

    const items = await qb.getMany();
    const hasMore = items.length > limit;
    return {
      data: items.slice(0, limit).map((cp) => this.formatPost(cp.post)),
      page,
      hasMore,
    };
  }

  async addPostToCollection(userId: string, collectionId: string, postId: string) {
    const collection = await this.collectionRepo.findOne({ where: { id: collectionId } });
    if (!collection) throw new NotFoundException('合集不存在');
    if (collection.creatorId !== userId) throw new NotFoundException('无权操作此合集');
    const post = await this.postRepo.findOne({ where: { id: postId, deletedAt: IsNull() } });
    if (!post) throw new NotFoundException('内容不存在');

    const existing = await this.collectionPostRepo.findOne({ where: { collectionId, postId } });
    if (existing) return { message: '已在合集中' };

    const cp = this.collectionPostRepo.create({ collectionId, postId });
    await this.collectionPostRepo.save(cp);
    collection.postCount += 1;
    await this.collectionRepo.save(collection);
    return { message: '已添加到合集' };
  }

  async removePostFromCollection(userId: string, collectionId: string, postId: string) {
    const collection = await this.collectionRepo.findOne({ where: { id: collectionId } });
    if (!collection) throw new NotFoundException('合集不存在');
    if (collection.creatorId !== userId) throw new NotFoundException('无权操作此合集');

    const cp = await this.collectionPostRepo.findOne({ where: { collectionId, postId } });
    if (!cp) return { message: '不在合集中' };

    await this.collectionPostRepo.remove(cp);
    if (collection.postCount > 0) collection.postCount -= 1;
    await this.collectionRepo.save(collection);
    return { message: '已从合集移除' };
  }
}

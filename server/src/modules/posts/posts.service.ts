import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Post } from '../../entities/post.entity.js';
import { MediaItem } from '../../entities/media-item.entity.js';
import { Comment } from '../../entities/comment.entity.js';
import { Like } from '../../entities/like.entity.js';
import { User } from '../../entities/user.entity.js';
import { InterestTag } from '../../entities/interest-tag.entity.js';
import { Topic } from '../../entities/topic.entity.js';
import { RouteDetail } from '../../entities/route-detail.entity.js';
import { Journey } from '../../entities/journey.entity.js';
import { JourneyStop } from '../../entities/journey-stop.entity.js';
import { GuideDetail } from '../../entities/guide-detail.entity.js';
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
    @InjectRepository(RouteDetail) private readonly routeRepo: Repository<RouteDetail>,
    @InjectRepository(Journey) private readonly journeyRepo: Repository<Journey>,
    @InjectRepository(JourneyStop) private readonly journeyStopRepo: Repository<JourneyStop>,
    @InjectRepository(GuideDetail) private readonly guideRepo: Repository<GuideDetail>,
    @InjectRepository(Collection) private readonly collectionRepo: Repository<Collection>,
    @InjectRepository(CollectionPost) private readonly collectionPostRepo: Repository<CollectionPost>,
    @InjectRepository(UserFollow) private readonly followRepo: Repository<UserFollow>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getPosts(options: { cursor?: string; limit?: number; sort?: string; page?: number; postType?: string; tagId?: string; userId?: string; followingOnly?: boolean } = {}) {
    const { cursor, limit = 10, sort = 'latest', page = 1, postType, tagId, userId, followingOnly } = options;

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
      return this.getTrendingPosts(limit, page, postType, tagId, followingIds);
    }
    if (sort === 'hot') {
      return this.getHotPosts(limit, page, postType, tagId, followingIds);
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

    if (postType) {
      qb.andWhere('post.postType = :postType', { postType });
    }
    if (tagId) {
      qb.innerJoin('post.tags', 'filterTag', 'filterTag.id = :tagId', { tagId });
    }

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

  private async getTrendingPosts(limit: number, page: number, postType?: string, tagId?: string, followingIds?: string[] | null) {
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

  private async getHotPosts(limit: number, page: number, postType?: string, tagId?: string, followingIds?: string[] | null) {
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
      relations: { author: true, mediaItems: true, tags: true, topics: true },
    });
    if (!post) throw new NotFoundException('内容不存在');
    post.viewCount += 1;
    await this.postRepo.save(post);

    // 加载路线详情
    let routeDetail: RouteDetail | null = null;
    if (post.postType === 'ROUTE') {
      routeDetail = await this.routeRepo.findOne({ where: { postId: id } });
    }

    // 加载旅程数据
    let journey: Journey | null = null;
    if (post.postType === 'JOURNEY') {
      journey = await this.journeyRepo.findOne({
        where: { postId: id },
        relations: { stops: true },
      });
    }

    // 加载攻略详情
    let guideDetail: GuideDetail | null = null;
    if (post.postType === 'GUIDE') {
      guideDetail = await this.guideRepo.findOne({ where: { postId: id } });
    }

    return { ...this.formatPost(post), routeDetail, journey, guideDetail };
  }

  async createPost(userId: string, dto: CreatePostDto) {
    const postId = uuidv4();
    const post = this.postRepo.create({
      id: postId,
      authorId: userId,
      communityId: dto.communityId || null,
      postType: dto.postType || 'NOTE',
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

    // 处理路线详情（ROUTE类型）
    if (dto.postType === 'ROUTE' && dto.routeDetail) {
      const route = this.routeRepo.create({
        postId,
        distanceKm: dto.routeDetail.distanceKm || null,
        durationMinutes: dto.routeDetail.durationMinutes || null,
        elevationGainM: dto.routeDetail.elevationGainM || null,
        difficulty: dto.routeDetail.difficulty || 'MODERATE',
        routeType: dto.routeDetail.routeType || 'HIKE',
        gpxData: dto.routeDetail.gpxData || null,
        waypoints: dto.routeDetail.waypoints || null,
      });
      await this.routeRepo.save(route);
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
        stopCount: dto.journey.stops?.length || 0,
      });
      await this.journeyRepo.save(journey);

      if (dto.journey.stops?.length) {
        const stops = dto.journey.stops.map((s, i) =>
          this.journeyStopRepo.create({
            journeyId: journey.id,
            dayNumber: s.dayNumber || null,
            locationName: s.locationName || null,
            locationLat: s.locationLat || null,
            locationLng: s.locationLng || null,
            description: s.description || null,
            mediaUrl: s.mediaUrl || null,
            sortOrder: i,
          }),
        );
        await this.journeyStopRepo.save(stops);
      }
    }

    // 处理攻略详情（GUIDE类型）
    if (dto.postType === 'GUIDE' && dto.guideDetail) {
      const guide = this.guideRepo.create({
        postId,
        destination: dto.guideDetail.destination || null,
        category: dto.guideDetail.category || 'TIPS',
        bestSeason: dto.guideDetail.bestSeason || null,
        budgetLevel: dto.guideDetail.budgetLevel || 'MID',
        richContent: dto.guideDetail.richContent || null,
      });
      await this.guideRepo.save(guide);
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

  async updatePost(userId: string, postId: string, dto: { content: string }) {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: { author: true, mediaItems: true, tags: true, topics: true },
    });
    if (!post) throw new NotFoundException('内容不存在');
    if (post.authorId !== userId) throw new NotFoundException('无权编辑此内容');

    post.content = dto.content;
    await this.postRepo.save(post);
    return this.formatPost(post);
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
        await this.notificationsService.create(post.authorId, userId, 'LIKE', '有人赞了你的内容', postId);
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
      await this.notificationsService.create(post.authorId, userId, 'COMMENT', '有人评论了你的内容', postId);
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

  async getCollections(options: { userId?: string; page?: number; limit?: number } = {}) {
    const { userId, page = 1, limit = 20 } = options;
    const qb = this.collectionRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.creator', 'creator')
      .where('c.isPublic = :pub', { pub: true })
      .orderBy('c.postCount', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (userId) {
      qb.orWhere('c.creatorId = :userId', { userId });
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

  async getCollectionPosts(collectionId: string, page = 1, limit = 20) {
    const qb = this.collectionPostRepo
      .createQueryBuilder('cp')
      .leftJoinAndSelect('cp.post', 'post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.mediaItems', 'mediaItems')
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoinAndSelect('post.topics', 'topics')
      .where('cp.collectionId = :cid', { cid: collectionId })
      .orderBy('cp.sortOrder', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const items = await qb.getMany();
    return {
      data: items.map((cp) => this.formatPost(cp.post)),
      page,
    };
  }

  async addPostToCollection(userId: string, collectionId: string, postId: string) {
    const collection = await this.collectionRepo.findOne({ where: { id: collectionId } });
    if (!collection) throw new NotFoundException('合集不存在');
    if (collection.creatorId !== userId) throw new NotFoundException('无权操作此合集');

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

import { Controller, Get, Post, Put, Delete, Param, Query, Headers, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../entities/user.entity.js';
import { UserFollow } from '../../entities/user-follow.entity.js';
import { Post as PostEntity } from '../../entities/post.entity.js';
import { MediaItem } from '../../entities/media-item.entity.js';
import { Like } from '../../entities/like.entity.js';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from '../notifications/notifications.service.js';

@Controller('api/users')
export class UsersController {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(UserFollow) private readonly followRepo: Repository<UserFollow>,
    @InjectRepository(PostEntity) private readonly postRepo: Repository<PostEntity>,
    @InjectRepository(MediaItem) private readonly mediaRepo: Repository<MediaItem>,
    @InjectRepository(Like) private readonly likeRepo: Repository<Like>,
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private getUserId(auth?: string): string | null {
    const token = auth?.replace('Bearer ', '') || null;
    if (!token) return null;
    try {
      return this.jwtService.verify(token).sub;
    } catch {
      return null;
    }
  }

  @Get('profile')
  async getProfile(@Headers('authorization') auth: string) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('用户不存在');

    const { passwordHash, ...userDto } = user;
    return {
      success: true,
      data: {
        ...userDto,
        vrDeviceInfo: user.vrDeviceModel
          ? { model: user.vrDeviceModel, version: user.vrDeviceVersion || '' }
          : null,
      },
    };
  }

  // ===== 管理员：用户列表 + 角色管理 =====

  @Get('list')
  async listUsers(
    @Headers('authorization') auth: string,
    @Query('limit') limit?: string,
  ) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');
    const admin = await this.userRepo.findOne({ where: { id: userId } });
    if (!admin || admin.role !== 'ADMIN') throw new UnauthorizedException('需要管理员权限');

    const users = await this.userRepo.find({
      order: { createdAt: 'DESC' },
      take: limit ? parseInt(limit) : 100,
    });
    return {
      success: true,
      data: users.map(u => {
        const { passwordHash, ...dto } = u;
        return dto;
      }),
    };
  }

  @Put(':id/role')
  async updateUserRole(
    @Headers('authorization') auth: string,
    @Param('id') targetId: string,
    @Body() body: { role: 'USER' | 'MODERATOR' | 'ADMIN' },
  ) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');
    const admin = await this.userRepo.findOne({ where: { id: userId } });
    if (!admin || admin.role !== 'ADMIN') throw new UnauthorizedException('需要管理员权限');

    const user = await this.userRepo.findOne({ where: { id: targetId } });
    if (!user) throw new NotFoundException('用户不存在');
    if (!['USER', 'MODERATOR', 'ADMIN'].includes(body.role)) throw new NotFoundException('无效角色');

    user.role = body.role;
    await this.userRepo.save(user);
    return { success: true, message: '角色已更新' };
  }

  @Put(':id/ban')
  async banUser(
    @Headers('authorization') auth: string,
    @Param('id') targetId: string,
  ) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');
    const admin = await this.userRepo.findOne({ where: { id: userId } });
    if (!admin || admin.role !== 'ADMIN') throw new UnauthorizedException('需要管理员权限');

    const user = await this.userRepo.findOne({ where: { id: targetId } });
    if (!user) throw new NotFoundException('用户不存在');
    if (user.role === 'ADMIN') throw new UnauthorizedException('不能封禁管理员');

    user.status = 'BANNED';
    await this.userRepo.save(user);
    return { success: true, message: '用户已封禁' };
  }

  @Put(':id/unban')
  async unbanUser(
    @Headers('authorization') auth: string,
    @Param('id') targetId: string,
  ) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');
    const admin = await this.userRepo.findOne({ where: { id: userId } });
    if (!admin || admin.role !== 'ADMIN') throw new UnauthorizedException('需要管理员权限');

    const user = await this.userRepo.findOne({ where: { id: targetId } });
    if (!user) throw new NotFoundException('用户不存在');
    user.status = 'ACTIVE';
    await this.userRepo.save(user);
    return { success: true, message: '用户已解封' };
  }

  @Get('suggested/list')
  async getSuggestedUsers(@Headers('authorization') auth: string) {
    const userId = this.getUserId(auth);

    const query = this.userRepo.createQueryBuilder('user');
    if (userId) {
      query.where('user.id != :userId', { userId });
    }
    query.orderBy('user.created_at', 'DESC').limit(5);
    const users = await query.getMany();

    let followingIds: string[] = [];
    if (userId && users.length > 0) {
      const follows = await this.followRepo.find({
        where: { followerId: userId, followingId: In(users.map((u) => u.id)) },
      });
      followingIds = follows.map((f) => f.followingId);
    }

    return {
      success: true,
      data: users.map((u) => {
        const { passwordHash, ...uDto } = u;
        return {
          ...uDto,
          isFollowing: followingIds.includes(u.id),
          vrDeviceInfo: u.vrDeviceModel
            ? { model: u.vrDeviceModel, version: u.vrDeviceVersion || '' }
            : null,
        };
      }),
    };
  }

  @Get(':username')
  async getUser(@Param('username') username: string) {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('用户不存在');
    const { passwordHash, ...userDto } = user;
    return {
      success: true,
      data: {
        ...userDto,
        vrDeviceInfo: user.vrDeviceModel
          ? { model: user.vrDeviceModel, version: user.vrDeviceVersion || '' }
          : null,
      },
    };
  }

  @Get(':username/follow-status')
  async getFollowStatus(
    @Param('username') username: string,
    @Headers('authorization') auth?: string,
  ) {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('用户不存在');

    const currentUserId = this.getUserId(auth || '');

    const [followerCount, followingCount] = await Promise.all([
      this.followRepo.count({ where: { followingId: user.id } }),
      this.followRepo.count({ where: { followerId: user.id } }),
    ]);

    let isFollowing = false;
    let isFollowedBy = false;
    if (currentUserId) {
      const [iFollow, followMe] = await Promise.all([
        this.followRepo.findOne({ where: { followerId: currentUserId, followingId: user.id } }),
        this.followRepo.findOne({ where: { followerId: user.id, followingId: currentUserId } }),
      ]);
      isFollowing = !!iFollow;
      isFollowedBy = !!followMe;
    }

    return {
      success: true,
      data: { followerCount, followingCount, isFollowing, isFollowedBy },
    };
  }

  @Get(':username/followers')
  async getFollowers(
    @Param('username') username: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('用户不存在');

    const pageNum = page ? Math.max(1, parseInt(page)) : 1;
    const limitNum = limit ? Math.min(Math.max(1, parseInt(limit)), 100) : 50;

    const [follows, total] = await this.followRepo.findAndCount({
      where: { followingId: user.id },
      order: { createdAt: 'DESC' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });
    const followerIds = follows.map((f) => f.followerId);
    const users = followerIds.length
      ? await this.userRepo.findBy({ id: In(followerIds) })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u] as const));
    const data = followerIds.map((id) => userMap.get(id)).filter((u): u is User => !!u);

    return {
      success: true,
      data: data.map((u) => {
        const { passwordHash, ...uDto } = u;
        return uDto;
      }),
      total,
      page: pageNum,
      hasMore: pageNum * limitNum < total,
    };
  }

  @Get(':username/following')
  async getFollowing(
    @Param('username') username: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('用户不存在');

    const pageNum = page ? Math.max(1, parseInt(page)) : 1;
    const limitNum = limit ? Math.min(Math.max(1, parseInt(limit)), 100) : 50;

    const [follows, total] = await this.followRepo.findAndCount({
      where: { followerId: user.id },
      order: { createdAt: 'DESC' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    });
    const followingIds = follows.map((f) => f.followingId);
    const users = followingIds.length
      ? await this.userRepo.findBy({ id: In(followingIds) })
      : [];
    const userMap = new Map(users.map((u) => [u.id, u] as const));
    const data = followingIds.map((id) => userMap.get(id)).filter((u): u is User => !!u);

    return {
      success: true,
      data: data.map((u) => {
        const { passwordHash, ...uDto } = u;
        return uDto;
      }),
      total,
      page: pageNum,
      hasMore: pageNum * limitNum < total,
    };
  }

  @Put('profile')
  async updateProfile(
    @Headers('authorization') auth: string,
    @Body() body: { displayName?: string; bio?: string; website?: string; avatarUrl?: string; gender?: string; birthday?: string; region?: string; occupation?: string },
  ) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('用户不存在');

    if (body.displayName !== undefined) user.displayName = body.displayName;
    if (body.bio !== undefined) user.bio = body.bio;
    if (body.website !== undefined) user.website = body.website;
    if (body.avatarUrl !== undefined) user.avatarUrl = body.avatarUrl;
    if (body.gender !== undefined) user.gender = body.gender;
    if (body.birthday !== undefined) user.birthday = body.birthday;
    if (body.region !== undefined) user.region = body.region;
    if (body.occupation !== undefined) user.occupation = body.occupation;
    user.updatedAt = new Date();

    await this.userRepo.save(user);

    const { passwordHash, ...userDto } = user;
    return {
      success: true,
      data: {
        ...userDto,
        vrDeviceInfo: user.vrDeviceModel
          ? { model: user.vrDeviceModel, version: user.vrDeviceVersion || '' }
          : null,
      },
    };
  }

  @Post(':id/follow')
  async followUser(@Headers('authorization') auth: string, @Param('id') targetId: string) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');
    if (userId === targetId) throw new NotFoundException('不能关注自己');

    const existing = await this.followRepo.findOne({
      where: { followerId: userId, followingId: targetId },
    });
    if (!existing) {
      const follow = this.followRepo.create({ id: uuidv4(), followerId: userId, followingId: targetId });
      await this.followRepo.save(follow);

      const follower = await this.userRepo.findOne({ where: { id: userId } });
      await this.notificationsService.create(
        targetId,
        userId,
        'FOLLOW',
        `${follower?.displayName || '有人'}关注了你`,
      );
    }
    return { success: true, message: '关注成功' };
  }

  @Delete(':id/follow')
  async unfollowUser(@Headers('authorization') auth: string, @Param('id') targetId: string) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    await this.followRepo.delete({ followerId: userId, followingId: targetId });
    return { success: true, message: '已取消关注' };
  }

  // ===== 用户帖子列表 =====
  @Get(':username/posts')
  async getUserPosts(
    @Param('username') username: string,
    @Query('type') postType?: string,
    @Query('contentLevel') contentLevel?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Headers('authorization') auth?: string,
  ) {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('用户不存在');

    // 携带了 Authorization 但 token 无效（过期/篡改）时抛 401，触发前端自动刷新
    const currentUserId = this.getUserId(auth || '');
    if (auth && !currentUserId) {
      throw new UnauthorizedException('登录已过期，请重新登录');
    }
    const isOwner = currentUserId === user.id;
    const take = limit ? parseInt(limit) : 20;

    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.mediaItems', 'mediaItems')
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoinAndSelect('post.topics', 'topics')
      .where('post.authorId = :userId', { userId: user.id })
      .orderBy('post.createdAt', 'DESC')
      .take(take + 1);

    // 排除素材库专属层级（SNAPSHOT/LOG 是素材，不是发布内容，已在素材库展示）
    qb.andWhere('post.contentLevel NOT IN (:...excludeLevels)', { excludeLevels: ['SNAPSHOT', 'LOG'] });

    // 统计/列表口径：排除草稿（vrMetadata.status=draft 的未发布内容，不计入帖子数与作品列表）
    qb.andWhere("(post.vrMetadata IS NULL OR post.vrMetadata NOT LIKE '%\"status\":\"draft\"%')");

    // 软删内容不展示
    qb.andWhere('post.deletedAt IS NULL');

    // 非本人只能看到公开内容
    if (!isOwner) {
      qb.andWhere('post.visibility = :vis', { vis: 'PUBLIC' });
    }

    if (postType) {
      qb.andWhere('post.postType = :postType', { postType });
    }

    if (contentLevel) {
      // 支持逗号分隔多值（如 TRAVELOGUE,ESSAY 同属游记）
      const levels = contentLevel.split(',').filter(Boolean);
      if (levels.length) {
        qb.andWhere('post.contentLevel IN (:...levels)', { levels });
      }
    }

    if (cursor) {
      const cursorPost = await this.postRepo.findOne({ where: { id: cursor } });
      if (cursorPost) {
        qb.andWhere('post.createdAt < :cursorDate', { cursorDate: cursorPost.createdAt });
      }
    }

    console.log('[DEBUG getUserPosts] SQL=', qb.getSql());
    const posts = await qb.getMany();
    console.log('[DEBUG getUserPosts] 列表条数=', posts.length);
    const hasMore = posts.length > take;
    const data = posts.slice(0, take);

    // 查询总数（与列表查询保持一致的过滤条件）
    const countQb = this.postRepo.createQueryBuilder('post')
      .where('post.authorId = :userId', { userId: user.id })
      .andWhere('post.contentLevel NOT IN (:...excludeLevels)', { excludeLevels: ['SNAPSHOT', 'LOG'] })
      .andWhere("(post.vrMetadata IS NULL OR post.vrMetadata NOT LIKE '%\"status\":\"draft\"%')")
      .andWhere('post.deletedAt IS NULL');
    if (!isOwner) {
      countQb.andWhere('post.visibility = :vis', { vis: 'PUBLIC' });
    }
    if (contentLevel) {
      const levels = contentLevel.split(',').filter(Boolean);
      if (levels.length) {
        countQb.andWhere('post.contentLevel IN (:...levels)', { levels });
      }
    }
    const total = await countQb.getCount();

    // 查询当前用户的点赞状态
    let likedIds = new Set<string>();
    if (currentUserId && data.length > 0) {
      const likes = await this.likeRepo.find({
        where: { userId: currentUserId, postId: In(data.map((p) => p.id)) },
      });
      likedIds = new Set(likes.map((l) => l.postId));
    }

    return {
      success: true,
      data: data.map((p) => this.formatPost(p, likedIds.has(p.id))),
      nextCursor: hasMore ? data[data.length - 1].id : null,
      hasMore,
      total,
    };
  }

  // ===== 用户媒体库 =====
  @Get(':username/media')
  async getUserMedia(
    @Param('username') username: string,
    @Query('type') mediaType?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Headers('authorization') auth?: string,
  ) {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('用户不存在');

    const currentUserId = this.getUserId(auth || '');
    const isOwner = currentUserId === user.id;
    const take = limit ? parseInt(limit) : 30;

    const qb = this.mediaRepo
      .createQueryBuilder('media')
      .leftJoinAndSelect('media.post', 'post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.authorId = :userId', { userId: user.id })
      .andWhere('media.type IN (:...types)', { types: ['IMAGE', 'VIDEO'] })
      // 与「在路上」保持一致：排除素材库专属层级（SNAPSHOT/LOG）
      .andWhere('post.contentLevel NOT IN (:...excludeLevels)', { excludeLevels: ['SNAPSHOT', 'LOG'] })
      // 排序字段与游标字段必须一致，否则翻页会重复/遗漏
      .orderBy('media.createdAt', 'DESC')
      .take(take + 1);

    if (!isOwner) {
      qb.andWhere('post.visibility = :vis', { vis: 'PUBLIC' });
    }

    if (mediaType && (mediaType === 'IMAGE' || mediaType === 'VIDEO')) {
      qb.andWhere('media.type = :mediaType', { mediaType });
    }

    if (cursor) {
      const cursorMedia = await this.mediaRepo.findOne({ where: { id: cursor } });
      if (cursorMedia) {
        qb.andWhere('media.createdAt < :cursorDate', { cursorDate: cursorMedia.createdAt });
      }
    }

    const items = await qb.getMany();
    const hasMore = items.length > take;
    const data = items.slice(0, take);

    return {
      success: true,
      data: data.map((m) => ({
        id: m.id,
        type: m.type,
        url: m.url,
        thumbnailUrl: m.thumbnailUrl,
        vrFormat: m.vrFormat,
        width: m.width,
        height: m.height,
        duration: m.duration,
        post: m.post
          ? {
              id: m.post.id,
              content: m.post.content?.slice(0, 100) || null,
              likeCount: m.post.likeCount,
              commentCount: m.post.commentCount,
            }
          : null,
      })),
      nextCursor: hasMore ? data[data.length - 1].id : null,
      hasMore,
    };
  }

  // ===== 用户点赞列表 =====
  @Get(':username/likes')
  async getUserLikes(
    @Param('username') username: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Headers('authorization') auth?: string,
  ) {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('用户不存在');

    const currentUserId = this.getUserId(auth || '');
    const isOwner = currentUserId === user.id;
    const take = limit ? parseInt(limit) : 20;

    // 非本人不能查看点赞列表（借鉴 Twitter 隐私策略）
    if (!isOwner) {
      return {
        success: true,
        data: [],
        nextCursor: null,
        hasMore: false,
        visible: false,
      };
    }

    const qb = this.likeRepo
      .createQueryBuilder('like')
      .leftJoinAndSelect('like.post', 'post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.mediaItems', 'mediaItems')
      .leftJoinAndSelect('post.tags', 'tags')
      .leftJoinAndSelect('post.topics', 'topics')
      .where('like.userId = :userId', { userId: user.id })
      // 与「在路上」保持一致：排除素材库专属层级（SNAPSHOT/LOG）
      .andWhere('post.contentLevel NOT IN (:...excludeLevels)', { excludeLevels: ['SNAPSHOT', 'LOG'] })
      .orderBy('like.createdAt', 'DESC')
      .take(take + 1);

    if (cursor) {
      const cursorLike = await this.likeRepo.findOne({ where: { id: cursor } });
      if (cursorLike) {
        qb.andWhere('like.createdAt < :cursorDate', { cursorDate: cursorLike.createdAt });
      }
    }

    const likes = await qb.getMany();
    const hasMore = likes.length > take;
    const data = likes.slice(0, take);

    return {
      success: true,
      data: data.map((like) => ({
        likeId: like.id,
        likedAt: like.createdAt,
        post: like.post ? this.formatPost(like.post, true) : null,
      })),
      nextCursor: hasMore ? data[data.length - 1].id : null,
      hasMore,
      visible: true,
    };
  }

  private formatPost(post: PostEntity, isLiked = false) {
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
}

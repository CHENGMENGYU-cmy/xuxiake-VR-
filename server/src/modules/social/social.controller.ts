import {
  Controller, Get, Post, Put, Delete, Param, Body, Headers, Query,
  UnauthorizedException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, Like as TypeOrmLike } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../entities/user.entity.js';
import { InterestTag } from '../../entities/interest-tag.entity.js';
import { UserInterest } from '../../entities/user-interest.entity.js';
import { UserFollow } from '../../entities/user-follow.entity.js';
import { Community } from '../../entities/community.entity.js';
import { CommunityTag } from '../../entities/community-tag.entity.js';
import { Conversation } from '../../entities/conversation.entity.js';
import { ConversationParticipant } from '../../entities/conversation-participant.entity.js';
import { Post as PostEntity } from '../../entities/post.entity.js';
import { MediaItem } from '../../entities/media-item.entity.js';
import { SocialService } from './social.service.js';

@Controller('api/social')
export class SocialController {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(InterestTag) private readonly tagRepo: Repository<InterestTag>,
    @InjectRepository(UserInterest) private readonly userInterestRepo: Repository<UserInterest>,
    @InjectRepository(UserFollow) private readonly followRepo: Repository<UserFollow>,
    @InjectRepository(Community) private readonly communityRepo: Repository<Community>,
    @InjectRepository(CommunityTag) private readonly communityTagRepo: Repository<CommunityTag>,
    @InjectRepository(Conversation) private readonly convRepo: Repository<Conversation>,
    @InjectRepository(ConversationParticipant) private readonly partRepo: Repository<ConversationParticipant>,
    @InjectRepository(PostEntity) private readonly postRepo: Repository<PostEntity>,
    @InjectRepository(MediaItem) private readonly mediaRepo: Repository<MediaItem>,
    private readonly jwtService: JwtService,
    private readonly socialService: SocialService,
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

  // ==================== 兴趣标签相关 ====================

  @Get('tags')
  async getAllTags() {
    const tags = await this.tagRepo.find({
      order: { category: 'ASC', sortOrder: 'DESC' },
    });

    // 按分类分组
    const grouped = tags.reduce((acc, tag) => {
      if (!acc[tag.category]) acc[tag.category] = [];
      acc[tag.category].push(tag);
      return acc;
    }, {} as Record<string, InterestTag[]>);

    return { success: true, data: grouped };
  }

  @Get('tags/hot')
  async getHotTags() {
    const tags = await this.tagRepo.find({
      where: { isHot: true },
      order: { sortOrder: 'DESC' },
      take: 10,
    });
    return { success: true, data: tags };
  }

  @Get('hot-topics')
  async getHotTopics() {
    // 基于热门标签和热门帖子位置生成热门话题
    const hotTags = await this.tagRepo.find({
      where: { isHot: true },
      order: { sortOrder: 'DESC' },
      take: 5,
    });

    // 获取浏览量最高的公开帖子的位置信息
    const hotPosts = await this.postRepo.find({
      where: { visibility: 'PUBLIC' as any },
      order: { viewCount: 'DESC' },
      take: 10,
    });

    // 从热门帖子中提取位置名称作为话题
    const locationTopics = hotPosts
      .filter((p) => p.locationName)
      .map((p) => ({
        tag: p.locationName!,
        count: p.viewCount,
      }));

    // 合并热门标签和位置话题，去重
    const tagTopics = hotTags.map((t) => ({
      tag: t.name,
      count: 0,
    }));

    // 合并并取前5个
    const allTopics = [...tagTopics, ...locationTopics];
    const seen = new Set<string>();
    const uniqueTopics = allTopics.filter((t) => {
      if (seen.has(t.tag)) return false;
      seen.add(t.tag);
      return true;
    }).slice(0, 5);

    return { success: true, data: uniqueTopics };
  }

  @Get('user/interests')
  async getUserInterests(@Headers('authorization') auth: string) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    const userInterests = await this.userInterestRepo.find({
      where: { userId },
      relations: { tag: true },
    });

    return {
      success: true,
      data: userInterests.map((ui) => ui.tag),
    };
  }

  @Post('user/interests')
  async setUserInterests(
    @Headers('authorization') auth: string,
    @Body() body: { tagIds: string[] },
  ) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    // 验证标签是否存在
    const tags = await this.tagRepo.findBy({ id: In(body.tagIds) });
    if (tags.length !== body.tagIds.length) {
      throw new BadRequestException('部分标签不存在');
    }

    // 删除现有兴趣
    await this.userInterestRepo.delete({ userId });

    // 添加新兴趣
    const userInterests = body.tagIds.map((tagId) =>
      this.userInterestRepo.create({ id: uuidv4(), userId, tagId }),
    );
    await this.userInterestRepo.save(userInterests);

    return { success: true, message: '兴趣标签已更新' };
  }

  // ==================== 智能推荐 ====================

  @Get('recommended/users')
  async getRecommendedUsers(
    @Headers('authorization') auth: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '20');

    // 获取当前用户信息和兴趣
    const currentUser = await this.userRepo.findOne({ where: { id: userId } });
    if (!currentUser) throw new UnauthorizedException('用户不存在');

    const userInterests = await this.userInterestRepo.find({ where: { userId } });
    const myTagIds = userInterests.map((ui) => ui.tagId);

    // 获取已关注的用户ID
    const following = await this.followRepo.find({ where: { followerId: userId } });
    const followingIds = following.map((f) => f.followingId);
    const followingIdSet = new Set(followingIds);

    // 基础查询：排除自己和已关注的用户
    const query = this.userRepo.createQueryBuilder('user');
    query.where('user.id != :userId', { userId });
    if (followingIds.length > 0) {
      query.andWhere('user.id NOT IN (:...followingIds)', { followingIds });
    }

    // 扩大候选池：取更多用户以便后续排序
    const candidateLimit = limitNum * 5;
    query.orderBy('user.created_at', 'DESC');
    query.limit(candidateLimit);

    const candidates = await query.getMany();
    if (candidates.length === 0) {
      return { success: true, data: [], page: pageNum };
    }

    const candidateIds = candidates.map((u) => u.id);

    // ===== 并行获取所有需要的数据 =====

    // 1. 兴趣标签匹配
    const userInterestsAll = await this.userInterestRepo.find({
      where: { userId: In(candidateIds) },
      relations: { tag: true },
    });
    const userTagMap = new Map<string, InterestTag[]>();
    userInterestsAll.forEach((ui) => {
      if (!userTagMap.has(ui.userId)) userTagMap.set(ui.userId, []);
      userTagMap.get(ui.userId)!.push(ui.tag);
    });

    // 2. 二度好友（共同关注）：我关注的人也关注了谁
    let mutualFriendMap = new Map<string, { count: number; names: string[] }>();
    if (followingIds.length > 0) {
      const theirFollows = await this.followRepo.find({
        where: { followerId: In(followingIds), followingId: In(candidateIds) },
      });
      // 获取我关注的人的名字映射
      const myFollowingUsers = await this.userRepo.findBy({ id: In(followingIds) });
      const myFollowingNameMap = new Map(myFollowingUsers.map((u) => [u.id, u.displayName]));

      const mutualMap = new Map<string, { ids: Set<string>; names: string[] }>();
      theirFollows.forEach((f) => {
        if (!mutualMap.has(f.followingId)) mutualMap.set(f.followingId, { ids: new Set(), names: [] });
        const entry = mutualMap.get(f.followingId)!;
        if (!entry.ids.has(f.followerId)) {
          entry.ids.add(f.followerId);
          const name = myFollowingNameMap.get(f.followerId);
          if (name) entry.names.push(name);
        }
      });
      mutualMap.forEach((val, key) => {
        mutualFriendMap.set(key, { count: val.ids.size, names: val.names });
      });
    }

    // 3. 帖子统计（活跃创作者 + 总获赞）
    const postStats = await this.postRepo
      .createQueryBuilder('post')
      .select('post.author_id', 'authorId')
      .addSelect('COUNT(*)', 'postCount')
      .addSelect('COALESCE(SUM(post.like_count), 0)', 'totalLikes')
      .where('post.author_id IN (:...candidateIds)', { candidateIds })
      .andWhere('post.visibility = :vis', { vis: 'PUBLIC' })
      .groupBy('post.author_id')
      .getRawMany();
    const postStatsMap = new Map(postStats.map((s) => [s.authorId, {
      postCount: parseInt(s.postCount),
      totalLikes: parseInt(s.totalLikes),
    }]));

    // 4. 代表帖子（每人最新2条带媒体的公开帖子）
    const recentPosts = await this.postRepo
      .createQueryBuilder('post')
      .where('post.author_id IN (:...candidateIds)', { candidateIds })
      .andWhere('post.visibility = :vis', { vis: 'PUBLIC' })
      .orderBy('post.created_at', 'DESC')
      .limit(candidateIds.length * 2)
      .getMany();
    // 按用户分组取最新2条
    const userPostsMap = new Map<string, PostEntity[]>();
    recentPosts.forEach((p) => {
      if (!userPostsMap.has(p.authorId)) userPostsMap.set(p.authorId, []);
      const arr = userPostsMap.get(p.authorId)!;
      if (arr.length < 2) arr.push(p);
    });
    // 获取这些帖子的媒体
    const recentPostIds = recentPosts.map((p) => p.id);
    const mediaItems = recentPostIds.length > 0
      ? await this.mediaRepo.find({
          where: { postId: In(recentPostIds) },
          order: { sortOrder: 'ASC' },
        })
      : [];
    const postMediaMap = new Map<string, MediaItem[]>();
    mediaItems.forEach((m) => {
      if (!postMediaMap.has(m.postId)) postMediaMap.set(m.postId, []);
      postMediaMap.get(m.postId)!.push(m);
    });

    // 5. 关注状态
    const followStatus = await this.followRepo.find({
      where: { followerId: userId, followingId: In(candidateIds) },
    });
    const followedIds = new Set(followStatus.map((f) => f.followingId));

    // ===== 计算综合得分并排序 =====
    const myTagIdSet = new Set(myTagIds);

    const scoredUsers = candidates.map((u) => {
      const { passwordHash, ...userDto } = u;
      const userTags = userTagMap.get(u.id) || [];
      const commonTagCount = userTags.filter((t) => myTagIdSet.has(t.id)).length;
      const mutual = mutualFriendMap.get(u.id);
      const stats = postStatsMap.get(u.id);
      const userPosts = userPostsMap.get(u.id) || [];

      // 计算综合得分
      let matchScore = 0;
      const matchReasons: string[] = [];

      // 共同兴趣（基础分）
      if (commonTagCount > 0) {
        matchScore += commonTagCount;
        matchReasons.push(`${commonTagCount}个共同兴趣`);
      }

      // 同城
      if (currentUser.region && u.region === currentUser.region) {
        matchScore += 5;
        matchReasons.push('同城');
      }

      // 二度好友（共同关注）
      if (mutual && mutual.count > 0) {
        const bonus = Math.min(mutual.count * 3, 15);
        matchScore += bonus;
        if (mutual.names.length <= 2) {
          matchReasons.push(`${mutual.names.join('、')}也关注了TA`);
        } else {
          matchReasons.push(`${mutual.names[0]}等${mutual.count}位好友也关注了TA`);
        }
      }

      // 活跃创作者
      if (stats && stats.postCount >= 3) {
        matchScore += 2;
        matchReasons.push('活跃创作者');
      }

      // VR 设备同好
      if (currentUser.vrDeviceModel && u.vrDeviceModel === currentUser.vrDeviceModel) {
        matchScore += 2;
        matchReasons.push('同款VR设备');
      }

      // 构建代表帖子数据
      const representativePosts = userPosts.map((p) => ({
        id: p.id,
        content: p.content ? p.content.slice(0, 80) : null,
        thumbnailUrl: postMediaMap.get(p.id)?.[0]?.thumbnailUrl || postMediaMap.get(p.id)?.[0]?.url || null,
        locationName: p.locationName,
      }));

      return {
        ...userDto,
        vrDeviceInfo: u.vrDeviceModel
          ? { model: u.vrDeviceModel, version: u.vrDeviceVersion || '' }
          : null,
        interests: userTags,
        matchReasons,
        matchScore,
        isFollowing: followedIds.has(u.id),
        postCount: stats?.postCount || 0,
        totalLikes: stats?.totalLikes || 0,
        representativePosts,
        mutualFriends: mutual ? { count: mutual.count, names: mutual.names.slice(0, 3) } : null,
      };
    });

    // 按综合得分降序，得分相同按创建时间降序
    scoredUsers.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // 分页截取
    const skip = (pageNum - 1) * limitNum;
    const paged = scoredUsers.slice(skip, skip + limitNum);

    return { success: true, data: paged, page: pageNum };
  }

  // 内存存储推荐反馈（后续可持久化到数据库）
  private recommendationFeedback = new Map<string, Set<string>>();

  @Get('recommended/communities')
  async getRecommendedCommunities(
    @Headers('authorization') auth: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '20');

    // 获取当前用户信息
    const currentUser = await this.userRepo.findOne({ where: { id: userId } });
    if (!currentUser) throw new UnauthorizedException('用户不存在');

    // 获取用户兴趣标签
    const userInterests = await this.userInterestRepo.find({ where: { userId } });
    const myTagIds = userInterests.map((ui) => ui.tagId);
    const myTagIdSet = new Set(myTagIds);

    // 获取用户已加入的社群
    const myParts = await this.partRepo.find({ where: { userId } });
    const myConvIds = myParts.map((p) => p.conversationId);
    const myCommunities = myConvIds.length > 0
      ? await this.communityRepo.find({ where: { conversationId: In(myConvIds) } })
      : [];
    const myCommunityIds = myCommunities.map((c) => c.id);

    // 获取用户不感兴趣的社区ID
    const notInterested = this.recommendationFeedback.get(userId);
    const notInterestedIds = notInterested ? [...notInterested] : [];

    // 获取用户关注的人
    const following = await this.followRepo.find({ where: { followerId: userId } });
    const followingIds = following.map((f) => f.followingId);

    // 候选社区池：公开、活跃、未加入、未标记不感兴趣
    const candidateLimit = limitNum * 5;
    const query = this.communityRepo.createQueryBuilder('community');
    query.where('community.is_public = :isPublic', { isPublic: true });
    query.andWhere('community.status = :status', { status: 'ACTIVE' });
    if (myCommunityIds.length > 0) {
      query.andWhere('community.id NOT IN (:...myCommunityIds)', { myCommunityIds });
    }
    if (notInterestedIds.length > 0) {
      query.andWhere('community.id NOT IN (:...notInterestedIds)', { notInterestedIds });
    }
    query.orderBy('community.member_count', 'DESC');
    query.addOrderBy('community.created_at', 'DESC');
    query.limit(candidateLimit);

    const candidates = await query.getMany();
    if (candidates.length === 0) {
      return { success: true, data: [], page: pageNum };
    }
    const candidateIds = candidates.map((c) => c.id);

    // ===== 并行获取所有需要的数据 =====

    // 1. 社区标签映射
    const communityTags = await this.communityTagRepo.find({
      where: { communityId: In(candidateIds) },
      relations: { tag: true },
    });
    const communityTagMap = new Map<string, InterestTag[]>();
    communityTags.forEach((ct) => {
      if (!communityTagMap.has(ct.communityId)) communityTagMap.set(ct.communityId, []);
      communityTagMap.get(ct.communityId)!.push(ct.tag);
    });

    // 2. 社区成员（通过 conversation_participants）
    const convIds = candidates.map((c) => c.conversationId);
    const allParticipants = await this.partRepo.find({
      where: { conversationId: In(convIds) },
    });
    // 社区conversationId → 成员userId列表
    const communityMembersMap = new Map<string, string[]>();
    allParticipants.forEach((p) => {
      if (!communityMembersMap.has(p.conversationId)) communityMembersMap.set(p.conversationId, []);
      communityMembersMap.get(p.conversationId)!.push(p.userId);
    });

    // 3. 好友在社区内的映射（社交关系信号）
    const followingIdSet = new Set(followingIds);
    const friendsInCommunityMap = new Map<string, { id: string; displayName: string; avatarUrl: string | null }[]>();
    if (followingIds.length > 0) {
      // 获取所有社区成员中我关注的人
      const allMemberIds = [...new Set(allParticipants.map((p) => p.userId))];
      const myFriendsInMembers = allMemberIds.filter((id) => followingIdSet.has(id));
      if (myFriendsInMembers.length > 0) {
        const friendUsers = await this.userRepo.findBy({ id: In(myFriendsInMembers) });
        const friendMap = new Map(friendUsers.map((u) => [u.id, u]));
        candidates.forEach((c) => {
          const members = communityMembersMap.get(c.conversationId) || [];
          const friends = members
            .filter((mid) => followingIdSet.has(mid) && mid !== userId)
            .map((mid) => {
              const u = friendMap.get(mid);
              return u ? { id: u.id, displayName: u.displayName, avatarUrl: u.avatarUrl } : null;
            })
            .filter(Boolean) as { id: string; displayName: string; avatarUrl: string | null }[];
          if (friends.length > 0) {
            friendsInCommunityMap.set(c.id, friends);
          }
        });
      }
    }

    // 4. 地理匹配：社区成员中与用户同 region 的比例
    const regionScoreMap = new Map<string, number>();
    if (currentUser.region) {
      const allMemberIds = [...new Set(allParticipants.map((p) => p.userId))];
      if (allMemberIds.length > 0) {
        const memberUsers = await this.userRepo.find({
          where: { id: In(allMemberIds) },
          select: { id: true, region: true },
        });
        const memberRegionMap = new Map(memberUsers.map((u) => [u.id, u.region]));
        candidates.forEach((c) => {
          const members = communityMembersMap.get(c.conversationId) || [];
          if (members.length === 0) return;
          const sameRegion = members.filter((mid) => memberRegionMap.get(mid) === currentUser.region).length;
          regionScoreMap.set(c.id, sameRegion / members.length);
        });
      }
    }

    // 5. 活跃度：社区成员近7天发帖数
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const allMemberIds = [...new Set(allParticipants.map((p) => p.userId))];
    let recentPostCountMap = new Map<string, number>();
    if (allMemberIds.length > 0) {
      const recentPosts = await this.postRepo
        .createQueryBuilder('post')
        .select('post.author_id', 'authorId')
        .addSelect('COUNT(*)', 'postCount')
        .where('post.author_id IN (:...allMemberIds)', { allMemberIds })
        .andWhere('post.created_at >= :sevenDaysAgo', { sevenDaysAgo })
        .andWhere('post.visibility = :vis', { vis: 'PUBLIC' })
        .groupBy('post.author_id')
        .getRawMany();
      const authorPostCountMap = new Map(recentPosts.map((r) => [r.authorId, parseInt(r.postCount)]));
      candidates.forEach((c) => {
        const members = communityMembersMap.get(c.conversationId) || [];
        const total = members.reduce((sum, mid) => sum + (authorPostCountMap.get(mid) || 0), 0);
        recentPostCountMap.set(c.id, total);
      });
    }

    // 6. 创建者信息
    const creatorIds = [...new Set(candidates.map((c) => c.creatorId))];
    const creators = await this.userRepo.findBy({ id: In(creatorIds) });
    const creatorMap = new Map(creators.map((u) => [u.id, u]));

    // ===== 计算综合得分并排序 =====
    const scoredCommunities = candidates.map((c) => {
      const creator = creatorMap.get(c.creatorId);
      const tags = communityTagMap.get(c.id) || [];
      const friends = friendsInCommunityMap.get(c.id) || [];
      const regionRatio = regionScoreMap.get(c.id) || 0;
      const recentPosts = recentPostCountMap.get(c.id) || 0;

      let matchScore = 0;
      const matchReasons: { type: string; text: string }[] = [];

      // 1. 兴趣标签匹配（25分）
      const communityTagIds = tags.map((t) => t.id);
      const sharedTagCount = communityTagIds.filter((tid) => myTagIdSet.has(tid)).length;
      if (sharedTagCount > 0 && myTagIds.length > 0) {
        const tagScore = (sharedTagCount / myTagIds.length) * 25;
        matchScore += tagScore;
        matchReasons.push({ type: 'INTEREST', text: `与你的${sharedTagCount}个兴趣标签匹配` });
      }

      // 2. 社交关系（20分）
      if (friends.length > 0 && followingIds.length > 0) {
        const socialScore = Math.min((friends.length / followingIds.length) * 40, 20);
        matchScore += socialScore;
        if (friends.length <= 2) {
          matchReasons.push({
            type: 'FRIENDS',
            text: `${friends.map((f) => f.displayName).join('、')}在这里`,
          });
        } else {
          matchReasons.push({
            type: 'FRIENDS',
            text: `${friends[0].displayName}等${friends.length}位好友在这里`,
          });
        }
      }

      // 3. 地理匹配（10分）
      if (regionRatio > 0) {
        matchScore += regionRatio * 10;
        const percent = Math.round(regionRatio * 100);
        if (percent >= 10) {
          matchReasons.push({ type: 'REGION', text: `${currentUser.region}用户占比${percent}%` });
        }
      }

      // 4. 活跃度（5分）
      if (recentPosts > 0) {
        const activityScore = Math.min(recentPosts / 5 * 5, 5);
        matchScore += activityScore;
        matchReasons.push({ type: 'ACTIVITY', text: `近7天有${recentPosts}条新动态` });
      }

      return {
        id: c.id,
        name: c.name,
        description: c.description,
        avatarUrl: c.avatarUrl,
        memberCount: c.memberCount,
        maxMembers: c.maxMembers,
        isPublic: c.isPublic,
        creator: creator
          ? { id: creator.id, username: creator.username, displayName: creator.displayName, avatarUrl: creator.avatarUrl }
          : null,
        tags,
        createdAt: c.createdAt,
        matchScore: Math.round(matchScore * 10) / 10,
        matchReasons,
        friendsInCommunity: friends.length > 0 ? friends.slice(0, 5) : undefined,
        recentPostCount: recentPosts > 0 ? recentPosts : undefined,
      };
    });

    // 按综合得分降序，得分相同按成员数降序
    scoredCommunities.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return b.memberCount - a.memberCount;
    });

    // 分页截取
    const skip = (pageNum - 1) * limitNum;
    const paged = scoredCommunities.slice(skip, skip + limitNum);

    return { success: true, data: paged, page: pageNum };
  }

  @Post('recommended/communities/:id/feedback')
  async submitCommunityFeedback(
    @Headers('authorization') auth: string,
    @Param('id') communityId: string,
    @Body() body: { type: 'NOT_INTERESTED' | 'INTERESTED' },
  ) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    if (!this.recommendationFeedback.has(userId)) {
      this.recommendationFeedback.set(userId, new Set());
    }
    const userFeedback = this.recommendationFeedback.get(userId)!;

    if (body.type === 'NOT_INTERESTED') {
      userFeedback.add(communityId);
    } else {
      userFeedback.delete(communityId);
    }

    return { success: true, message: '反馈已记录' };
  }

  // ==================== 社群相关 ====================

  @Post('communities')
  async createCommunity(
    @Headers('authorization') auth: string,
    @Body() body: { name: string; description?: string; tagIds?: string[]; isPublic?: boolean },
  ) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    if (!body.name || body.name.trim().length === 0) {
      throw new BadRequestException('社群名称不能为空');
    }

    if (body.name.length > 100) {
      throw new BadRequestException('社群名称不能超过100个字符');
    }

    // 创建关联的群聊会话
    const convId = uuidv4();
    const conv = this.convRepo.create({
      id: convId,
      type: 'GROUP',
      title: body.name.trim(),
      updatedAt: new Date(),
    });
    await this.convRepo.save(conv);

    // 创建社群
    const communityId = uuidv4();
    const community = this.communityRepo.create({
      id: communityId,
      conversationId: convId,
      name: body.name.trim(),
      description: body.description || null,
      creatorId: userId,
      memberCount: 1,
      isPublic: body.isPublic !== false,
    });
    await this.communityRepo.save(community);

    // 添加创建者为参与者
    const participant = this.partRepo.create({
      id: uuidv4(),
      conversationId: convId,
      userId,
    });
    await this.partRepo.save(participant);

    // 添加标签
    if (body.tagIds && body.tagIds.length > 0) {
      const tags = await this.tagRepo.findBy({ id: In(body.tagIds) });
      const communityTags = tags.map((tag) =>
        this.communityTagRepo.create({ id: uuidv4(), communityId, tagId: tag.id }),
      );
      await this.communityTagRepo.save(communityTags);
    }

    return {
      success: true,
      data: {
        id: communityId,
        conversationId: convId,
        name: community.name,
        description: community.description,
        memberCount: 1,
        isPublic: community.isPublic,
      },
    };
  }

  @Post('communities/:id/join')
  async joinCommunity(
    @Headers('authorization') auth: string,
    @Param('id') communityId: string,
  ) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    const community = await this.communityRepo.findOne({ where: { id: communityId } });
    if (!community) throw new NotFoundException('社群不存在');
    if (community.status !== 'ACTIVE') throw new BadRequestException('社群已解散');

    // 检查是否已是成员
    const existing = await this.partRepo.findOne({
      where: { conversationId: community.conversationId, userId },
    });
    if (existing) throw new BadRequestException('已经是社群成员');

    // 检查人数限制
    if (community.memberCount >= community.maxMembers) {
      throw new BadRequestException('社群人数已满');
    }

    // 添加为参与者
    const participant = this.partRepo.create({
      id: uuidv4(),
      conversationId: community.conversationId,
      userId,
    });
    await this.partRepo.save(participant);

    // 更新成员数量
    community.memberCount += 1;
    await this.communityRepo.save(community);

    return { success: true, message: '已加入社群' };
  }

  @Post('communities/:id/leave')
  async leaveCommunity(
    @Headers('authorization') auth: string,
    @Param('id') communityId: string,
  ) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    const community = await this.communityRepo.findOne({ where: { id: communityId } });
    if (!community) throw new NotFoundException('社群不存在');

    // 创建者不能退出，只能解散
    if (community.creatorId === userId) {
      throw new BadRequestException('创建者不能退出社群，请使用解散功能');
    }

    // 删除参与者记录
    const result = await this.partRepo.delete({
      conversationId: community.conversationId,
      userId,
    });

    if (result.affected && result.affected > 0) {
      // 更新成员数量
      community.memberCount = Math.max(0, community.memberCount - 1);
      await this.communityRepo.save(community);
    }

    return { success: true, message: '已退出社群' };
  }

  @Get('communities/:id')
  async getCommunity(
    @Headers('authorization') auth: string,
    @Param('id') communityId: string,
  ) {
    const userId = this.getUserId(auth);

    const community = await this.communityRepo.findOne({ where: { id: communityId } });
    if (!community) throw new NotFoundException('社群不存在');

    // 获取标签
    const communityTags = await this.communityTagRepo.find({
      where: { communityId },
      relations: { tag: true },
    });

    // 获取创建者
    const creator = await this.userRepo.findOne({ where: { id: community.creatorId } });

    // 获取成员列表
    const participants = await this.partRepo.find({
      where: { conversationId: community.conversationId },
    });
    const memberIds = participants.map((p) => p.userId);
    const members = memberIds.length > 0
      ? await this.userRepo.findBy({ id: In(memberIds) })
      : [];

    // 检查当前用户是否是成员
    const isMember = userId ? memberIds.includes(userId) : false;
    const isCreator = userId ? community.creatorId === userId : false;

    return {
      success: true,
      data: {
        id: community.id,
        name: community.name,
        description: community.description,
        avatarUrl: community.avatarUrl,
        coverUrl: community.coverUrl,
        rules: community.rules,
        category: community.category,
        locationName: community.locationName,
        memberCount: community.memberCount,
        maxMembers: community.maxMembers,
        isPublic: community.isPublic,
        status: community.status,
        creator: creator
          ? { id: creator.id, username: creator.username, displayName: creator.displayName, avatarUrl: creator.avatarUrl }
          : null,
        tags: communityTags.map((ct) => ct.tag),
        members: members.map((m) => {
          const { passwordHash, ...memberDto } = m;
          return memberDto;
        }),
        isMember,
        isCreator,
        createdAt: community.createdAt,
      },
    };
  }

  @Get('communities')
  async listCommunities(
    @Headers('authorization') auth: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('tagId') tagId?: string,
  ) {
    const userId = this.getUserId(auth);

    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '20');
    const skip = (pageNum - 1) * limitNum;

    const query = this.communityRepo.createQueryBuilder('community')
      .where('community.is_public = :isPublic', { isPublic: true })
      .andWhere('community.status = :status', { status: 'ACTIVE' });

    // 按标签筛选
    if (tagId) {
      query.innerJoin(CommunityTag, 'ct', 'ct.community_id = community.id')
        .andWhere('ct.tag_id = :tagId', { tagId });
    }

    query.orderBy('community.member_count', 'DESC')
      .addOrderBy('community.created_at', 'DESC');

    const total = await query.getCount();
    query.skip(skip).take(limitNum);

    const communities = await query.getMany();

    // 获取标签和创建者
    const communityIds = communities.map((c) => c.id);
    const communityTags = communityIds.length > 0
      ? await this.communityTagRepo.find({
          where: { communityId: In(communityIds) },
          relations: { tag: true },
        })
      : [];
    const communityTagMap = new Map<string, InterestTag[]>();
    communityTags.forEach((ct) => {
      if (!communityTagMap.has(ct.communityId)) communityTagMap.set(ct.communityId, []);
      communityTagMap.get(ct.communityId)!.push(ct.tag);
    });

    const creatorIds = [...new Set(communities.map((c) => c.creatorId))];
    const creators = creatorIds.length > 0
      ? await this.userRepo.findBy({ id: In(creatorIds) })
      : [];
    const creatorMap = new Map(creators.map((u) => [u.id, u]));

    // 检查用户是否已加入
    let joinedCommunityIds: Set<string> = new Set();
    if (userId) {
      const myParts = await this.partRepo.find({ where: { userId } });
      const myConvIds = myParts.map((p) => p.conversationId);
      const myCommunities = myConvIds.length > 0
        ? await this.communityRepo.find({ where: { conversationId: In(myConvIds) } })
        : [];
      joinedCommunityIds = new Set(myCommunities.map((c) => c.id));
    }

    return {
      success: true,
      data: communities.map((c) => {
        const creator = creatorMap.get(c.creatorId);
        return {
          id: c.id,
          name: c.name,
          description: c.description,
          avatarUrl: c.avatarUrl,
          memberCount: c.memberCount,
          maxMembers: c.maxMembers,
          isPublic: c.isPublic,
          creator: creator
            ? { id: creator.id, username: creator.username, displayName: creator.displayName, avatarUrl: creator.avatarUrl }
            : null,
          tags: communityTagMap.get(c.id) || [],
          isMember: joinedCommunityIds.has(c.id),
          createdAt: c.createdAt,
        };
      }),
      total,
      page: pageNum,
    };
  }

  @Get('user/communities')
  async getUserCommunities(@Headers('authorization') auth: string) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    // 获取用户参与的群聊会话
    const participations = await this.partRepo.find({ where: { userId } });
    const convIds = participations.map((p) => p.conversationId);

    if (convIds.length === 0) {
      return { success: true, data: [] };
    }

    // 获取关联的社群
    const communities = await this.communityRepo.find({
      where: { conversationId: In(convIds), status: 'ACTIVE' },
    });

    // 获取标签
    const communityIds = communities.map((c) => c.id);
    const communityTags = communityIds.length > 0
      ? await this.communityTagRepo.find({
          where: { communityId: In(communityIds) },
          relations: { tag: true },
        })
      : [];
    const communityTagMap = new Map<string, InterestTag[]>();
    communityTags.forEach((ct) => {
      if (!communityTagMap.has(ct.communityId)) communityTagMap.set(ct.communityId, []);
      communityTagMap.get(ct.communityId)!.push(ct.tag);
    });

    return {
      success: true,
      data: communities.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        avatarUrl: c.avatarUrl,
        memberCount: c.memberCount,
        conversationId: c.conversationId,
        tags: communityTagMap.get(c.id) || [],
        isCreator: c.creatorId === userId,
        createdAt: c.createdAt,
      })),
    };
  }

  // ==================== 社群编辑 ====================

  @Put('communities/:id')
  async updateCommunity(
    @Headers('authorization') auth: string,
    @Param('id') communityId: string,
    @Body() body: {
      name?: string;
      description?: string;
      coverUrl?: string;
      avatarUrl?: string;
      rules?: string;
      category?: string;
      locationName?: string;
      isPublic?: boolean;
      maxMembers?: number;
    },
  ) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    const community = await this.socialService.updateCommunity(communityId, userId, body);
    return { success: true, data: community };
  }

  // ==================== 社群解散 ====================

  @Post('communities/:id/dissolve')
  async dissolveCommunity(
    @Headers('authorization') auth: string,
    @Param('id') communityId: string,
  ) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    await this.socialService.dissolveCommunity(communityId, userId);
    return { success: true, message: '社群已解散' };
  }

  // ==================== 社群搜索 ====================

  @Get('communities/search')
  async searchCommunities(
    @Headers('authorization') auth: string,
    @Query('q') keyword: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!keyword?.trim()) throw new BadRequestException('搜索关键词不能为空');

    const userId = this.getUserId(auth);
    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '20');

    return this.socialService.searchCommunities(keyword.trim(), userId || undefined, pageNum, limitNum);
  }

  // ==================== 社群公告 ====================

  @Get('communities/:id/announcements')
  async getAnnouncements(
    @Param('id') communityId: string,
  ) {
    const announcements = await this.socialService.getAnnouncements(communityId);
    return {
      success: true,
      data: announcements.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        isPinned: a.isPinned,
        author: a.author
          ? { id: a.author.id, username: a.author.username, displayName: a.author.displayName, avatarUrl: a.author.avatarUrl }
          : null,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
    };
  }

  @Post('communities/:id/announcements')
  async createAnnouncement(
    @Headers('authorization') auth: string,
    @Param('id') communityId: string,
    @Body() body: { title: string; content: string; isPinned?: boolean },
  ) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    const announcement = await this.socialService.createAnnouncement(communityId, userId, body);
    return { success: true, data: announcement };
  }

  @Delete('communities/:communityId/announcements/:announcementId')
  async deleteAnnouncement(
    @Headers('authorization') auth: string,
    @Param('communityId') communityId: string,
    @Param('announcementId') announcementId: string,
  ) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    await this.socialService.deleteAnnouncement(announcementId, userId);
    return { success: true, message: '公告已删除' };
  }

  // ==================== 社群角色 ====================

  @Get('communities/:id/roles')
  async getRoles(@Param('id') communityId: string) {
    const roles = await this.socialService.getRoles(communityId);
    return { success: true, data: roles };
  }

  @Post('communities/:id/roles')
  async assignRole(
    @Headers('authorization') auth: string,
    @Param('id') communityId: string,
    @Body() body: { userId: string; role: 'ADMIN' | 'MODERATOR' },
  ) {
    const operatorId = this.getUserId(auth);
    if (!operatorId) throw new UnauthorizedException('请先登录');

    await this.socialService.assignRole(communityId, operatorId, body.userId, body.role);
    return { success: true, message: '角色已分配' };
  }

  @Delete('communities/:id/roles/:userId')
  async removeRole(
    @Headers('authorization') auth: string,
    @Param('id') communityId: string,
    @Param('userId') targetUserId: string,
  ) {
    const operatorId = this.getUserId(auth);
    if (!operatorId) throw new UnauthorizedException('请先登录');

    await this.socialService.removeRole(communityId, operatorId, targetUserId);
    return { success: true, message: '角色已移除' };
  }

  // ==================== 社群挑战 ====================

  @Get('communities/:id/challenges')
  async getChallenges(
    @Param('id') communityId: string,
    @Query('status') status?: string,
  ) {
    const challenges = await this.socialService.getChallenges(communityId, status);
    return {
      success: true,
      data: challenges.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        type: c.type,
        startDate: c.startDate,
        endDate: c.endDate,
        maxParticipants: c.maxParticipants,
        participantCount: c.participantCount,
        status: c.status,
        creator: c.creator
          ? { id: c.creator.id, username: c.creator.username, displayName: c.creator.displayName, avatarUrl: c.creator.avatarUrl }
          : null,
        createdAt: c.createdAt,
      })),
    };
  }

  @Post('communities/:id/challenges')
  async createChallenge(
    @Headers('authorization') auth: string,
    @Param('id') communityId: string,
    @Body() body: {
      title: string;
      description?: string;
      type?: 'PHOTO' | 'ROUTE' | 'CHECKIN' | 'DISTANCE';
      startDate: string;
      endDate: string;
      maxParticipants?: number;
    },
  ) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    const challenge = await this.socialService.createChallenge(communityId, userId, body);
    return { success: true, data: challenge };
  }

  // ==================== 社群动态 ====================

  @Get('communities/:id/posts')
  async getCommunityPosts(
    @Headers('authorization') auth: string,
    @Param('id') communityId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = this.getUserId(auth);
    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '20');

    return this.socialService.getCommunityPosts(communityId, userId || undefined, pageNum, limitNum);
  }
}

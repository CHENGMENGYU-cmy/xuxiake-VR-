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
    const skip = (pageNum - 1) * limitNum;

    // 获取用户兴趣
    const userInterests = await this.userInterestRepo.find({ where: { userId } });
    const myTagIds = userInterests.map((ui) => ui.tagId);

    // 获取用户已加入的社群
    const myParts = await this.partRepo.find({ where: { userId } });
    const myConvIds = myParts.map((p) => p.conversationId);
    const myCommunities = myConvIds.length > 0
      ? await this.communityRepo.find({ where: { conversationId: In(myConvIds) } })
      : [];
    const myCommunityIds = myCommunities.map((c) => c.id);

    // 查询公开且活跃的社群
    const query = this.communityRepo.createQueryBuilder('community');
    query.where('community.is_public = :isPublic', { isPublic: true });
    query.andWhere('community.status = :status', { status: 'ACTIVE' });

    // 排除已加入的社群
    if (myCommunityIds.length > 0) {
      query.andWhere('community.id NOT IN (:...myCommunityIds)', { myCommunityIds });
    }

    // 如果用户有标签，优先推荐匹配的社群
    if (myTagIds.length > 0) {
      const matchedCommunityIds = await this.communityTagRepo
        .createQueryBuilder('ct')
        .select('ct.community_id', 'communityId')
        .addSelect('COUNT(*)', 'matchCount')
        .where('ct.tag_id IN (:...myTagIds)', { myTagIds })
        .groupBy('ct.community_id')
        .orderBy('matchCount', 'DESC')
        .limit(limitNum * 2)
        .getRawMany();

      const matchedIds = matchedCommunityIds.map((r) => r.communityId);
      if (matchedIds.length > 0) {
        query.andWhere('community.id IN (:...matchedIds)', { matchedIds });
      }
    }

    // 按成员数量和创建时间排序
    query.orderBy('community.member_count', 'DESC');
    query.addOrderBy('community.created_at', 'DESC');

    query.skip(skip).take(limitNum);

    const communities = await query.getMany();

    // 获取社群标签
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

    // 获取创建者信息
    const creatorIds = [...new Set(communities.map((c) => c.creatorId))];
    const creators = creatorIds.length > 0
      ? await this.userRepo.findBy({ id: In(creatorIds) })
      : [];
    const creatorMap = new Map(creators.map((u) => [u.id, u]));

    return {
      success: true,
      data: communities.map((c) => {
        const creator = creatorMap.get(c.creatorId);
        const tags = communityTagMap.get(c.id) || [];

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
        };
      }),
      page: pageNum,
    };
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
}

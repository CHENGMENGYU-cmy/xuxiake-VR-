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
    const skip = (pageNum - 1) * limitNum;

    // 获取当前用户信息和兴趣
    const currentUser = await this.userRepo.findOne({ where: { id: userId } });
    if (!currentUser) throw new UnauthorizedException('用户不存在');

    const userInterests = await this.userInterestRepo.find({
      where: { userId },
    });
    const myTagIds = userInterests.map((ui) => ui.tagId);

    // 获取已关注的用户ID
    const following = await this.followRepo.find({ where: { followerId: userId } });
    const followingIds = following.map((f) => f.followingId);

    // 构建推荐查询
    const query = this.userRepo.createQueryBuilder('user');

    // 排除自己和已关注的用户
    query.where('user.id != :userId', { userId });
    if (followingIds.length > 0) {
      query.andWhere('user.id NOT IN (:...followingIds)', { followingIds });
    }

    // 计算匹配分数（基于共同兴趣、同龄、同地区）
    // 使用子查询计算共同兴趣数量
    if (myTagIds.length > 0) {
      query.addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)')
          .from(UserInterest, 'ui')
          .where('ui.user_id = user.id')
          .andWhere('ui.tag_id IN (:...myTagIds)', { myTagIds });
      }, 'common_interests');
    }

    // 同龄人加分（±5岁）
    if (currentUser.birthday) {
      const birthDate = new Date(currentUser.birthday);
      const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      const minBirth = new Date();
      minBirth.setFullYear(minBirth.getFullYear() - (age + 5));
      const maxBirth = new Date();
      maxBirth.setFullYear(maxBirth.getFullYear() - (age - 5));

      query.addSelect(
        `CASE WHEN user.birthday BETWEEN :minBirth AND :maxBirth THEN 10 ELSE 0 END`,
        'age_score',
      );
      query.setParameter('minBirth', minBirth.toISOString().split('T')[0]);
      query.setParameter('maxBirth', maxBirth.toISOString().split('T')[0]);
    }

    // 同地区加分
    if (currentUser.region) {
      query.addSelect(
        `CASE WHEN user.region = :region THEN 5 ELSE 0 END`,
        'region_score',
      );
      query.setParameter('region', currentUser.region);
    }

    // 计算总分并排序
    const interestScore = myTagIds.length > 0 ? 'common_interests' : '0';
    query.orderBy(`(${interestScore} + COALESCE(age_score, 0) + COALESCE(region_score, 0))`, 'DESC');
    query.addOrderBy('user.created_at', 'DESC');

    query.skip(skip).take(limitNum);

    const { entities: users, raw } = await query.getRawAndEntities();

    // 获取推荐用户的兴趣标签
    const userIds = users.map((u) => u.id);
    const userInterestsAll = userIds.length > 0
      ? await this.userInterestRepo.find({
          where: { userId: In(userIds) },
          relations: { tag: true },
        })
      : [];

    const userTagMap = new Map<string, InterestTag[]>();
    userInterestsAll.forEach((ui) => {
      if (!userTagMap.has(ui.userId)) userTagMap.set(ui.userId, []);
      userTagMap.get(ui.userId)!.push(ui.tag);
    });

    // 获取关注状态
    const followStatus = await this.followRepo.find({
      where: { followerId: userId, followingId: In(userIds) },
    });
    const followedIds = new Set(followStatus.map((f) => f.followingId));

    return {
      success: true,
      data: users.map((u, index) => {
        const { passwordHash, ...userDto } = u;
        const rawRow = raw[index];
        const commonCount = parseInt(rawRow?.common_interests || '0');
        const matchReasons: string[] = [];

        if (commonCount > 0) matchReasons.push(`${commonCount}个共同兴趣`);
        if (rawRow?.age_score > 0) matchReasons.push('同龄人');
        if (rawRow?.region_score > 0) matchReasons.push('同城');

        return {
          ...userDto,
          vrDeviceInfo: u.vrDeviceModel
            ? { model: u.vrDeviceModel, version: u.vrDeviceVersion || '' }
            : null,
          interests: userTagMap.get(u.id) || [],
          matchReasons,
          isFollowing: followedIds.has(u.id),
          matchScore: (parseInt(rawRow?.common_interests || '0')) +
            (parseInt(rawRow?.age_score || '0')) +
            (parseInt(rawRow?.region_score || '0')),
        };
      }),
      page: pageNum,
    };
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
    const query = this.communityRepo.createQueryBuilder('community')
      .where('community.is_public = :isPublic', { isPublic: true })
      .andWhere('community.status = :status', { status: 'ACTIVE' });

    // 排除已加入的社群
    if (myCommunityIds.length > 0) {
      query.andWhere('community.id NOT IN (:...myCommunityIds)', { myCommunityIds });
    }

    // 按兴趣匹配度排序
    if (myTagIds.length > 0) {
      query.addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)')
          .from(CommunityTag, 'ct')
          .where('ct.community_id = community.id')
          .andWhere('ct.tag_id IN (:...myTagIds)', { myTagIds });
      }, 'tag_match');
    }

    const tagMatchExpr = myTagIds.length > 0 ? 'tag_match' : '0';
    query.orderBy(`(${tagMatchExpr})`, 'DESC');
    query.addOrderBy('community.member_count', 'DESC');
    query.addOrderBy('community.created_at', 'DESC');

    query.skip(skip).take(limitNum);

    const { entities: communities, raw } = await query.getRawAndEntities();

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
      data: communities.map((c, index) => {
        const creator = creatorMap.get(c.creatorId);
        const tags = communityTagMap.get(c.id) || [];
        const matchCount = parseInt(raw[index]?.tag_match || '0');

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
          matchCount,
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

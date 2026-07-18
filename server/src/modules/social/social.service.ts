import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Community } from '../../entities/community.entity.js';
import { CommunityAnnouncement } from '../../entities/community-announcement.entity.js';
import { CommunityRole } from '../../entities/community-role.entity.js';
import { CommunityChallenge } from '../../entities/community-challenge.entity.js';
import { CommunityChallengeEntry } from '../../entities/community-challenge-entry.entity.js';
import { CommunityTag } from '../../entities/community-tag.entity.js';
import { ConversationParticipant } from '../../entities/conversation-participant.entity.js';
import { Post as PostEntity } from '../../entities/post.entity.js';
import { User } from '../../entities/user.entity.js';
import { InterestTag } from '../../entities/interest-tag.entity.js';

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(Community) private readonly communityRepo: Repository<Community>,
    @InjectRepository(CommunityAnnouncement) private readonly announcementRepo: Repository<CommunityAnnouncement>,
    @InjectRepository(CommunityRole) private readonly roleRepo: Repository<CommunityRole>,
    @InjectRepository(CommunityChallenge) private readonly challengeRepo: Repository<CommunityChallenge>,
    @InjectRepository(CommunityChallengeEntry) private readonly entryRepo: Repository<CommunityChallengeEntry>,
    @InjectRepository(CommunityTag) private readonly communityTagRepo: Repository<CommunityTag>,
    @InjectRepository(ConversationParticipant) private readonly partRepo: Repository<ConversationParticipant>,
    @InjectRepository(PostEntity) private readonly postRepo: Repository<PostEntity>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(InterestTag) private readonly tagRepo: Repository<InterestTag>,
  ) {}

  // ==================== 权限检查 ====================

  async checkCommunityPermission(communityId: string, userId: string): Promise<{
    community: Community;
    isMember: boolean;
    isCreator: boolean;
    isAdmin: boolean;
    isModerator: boolean;
  }> {
    const community = await this.communityRepo.findOne({ where: { id: communityId } });
    if (!community) throw new NotFoundException('社群不存在');

    const participant = await this.partRepo.findOne({
      where: { conversationId: community.conversationId, userId },
    });
    const isMember = !!participant;
    const isCreator = community.creatorId === userId;

    const role = await this.roleRepo.findOne({
      where: { communityId, userId },
    });
    const isAdmin = isCreator || role?.role === 'ADMIN';
    const isModerator = isAdmin || role?.role === 'MODERATOR';

    return { community, isMember, isCreator, isAdmin, isModerator };
  }

  // ==================== 社群编辑 ====================

  async updateCommunity(communityId: string, userId: string, body: {
    name?: string;
    description?: string;
    coverUrl?: string;
    avatarUrl?: string;
    rules?: string;
    category?: string;
    locationName?: string;
    isPublic?: boolean;
    maxMembers?: number;
  }): Promise<Community> {
    const { community, isAdmin } = await this.checkCommunityPermission(communityId, userId);
    if (!isAdmin) throw new ForbiddenException('仅管理员可编辑社群');

    if (body.name !== undefined) {
      if (!body.name.trim()) throw new BadRequestException('社群名称不能为空');
      if (body.name.length > 100) throw new BadRequestException('社群名称不能超过100个字符');
      community.name = body.name.trim();
    }
    if (body.description !== undefined) community.description = body.description || null;
    if (body.coverUrl !== undefined) community.coverUrl = body.coverUrl || null;
    if (body.avatarUrl !== undefined) community.avatarUrl = body.avatarUrl || null;
    if (body.rules !== undefined) community.rules = body.rules || null;
    if (body.category !== undefined) community.category = body.category || null;
    if (body.locationName !== undefined) community.locationName = body.locationName || null;
    if (body.isPublic !== undefined) community.isPublic = body.isPublic;
    if (body.maxMembers !== undefined) {
      if (body.maxMembers < community.memberCount) {
        throw new BadRequestException('最大成员数不能小于当前成员数');
      }
      community.maxMembers = body.maxMembers;
    }

    return this.communityRepo.save(community);
  }

  // ==================== 社群解散 ====================

  async dissolveCommunity(communityId: string, userId: string): Promise<void> {
    const { community, isCreator } = await this.checkCommunityPermission(communityId, userId);
    if (!isCreator) throw new ForbiddenException('仅创建者可解散社群');

    community.status = 'DISSOLVED';
    await this.communityRepo.save(community);
  }

  // ==================== 社群搜索 ====================

  async searchCommunities(keyword: string, userId?: string, page = 1, limit = 20): Promise<{
    data: any[];
    total: number;
    page: number;
  }> {
    const skip = (page - 1) * limit;

    const query = this.communityRepo.createQueryBuilder('community')
      .where('community.is_public = :isPublic', { isPublic: true })
      .andWhere('community.status = :status', { status: 'ACTIVE' })
      .andWhere('(community.name LIKE :kw OR community.description LIKE :kw)', { kw: `%${keyword}%` })
      .orderBy('community.member_count', 'DESC')
      .skip(skip)
      .take(limit);

    const [communities, total] = await query.getManyAndCount();

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

    // 获取创建者
    const creatorIds = [...new Set(communities.map((c) => c.creatorId))];
    const creators = creatorIds.length > 0
      ? await this.userRepo.findBy({ id: In(creatorIds) })
      : [];
    const creatorMap = new Map(creators.map((u) => [u.id, u]));

    return {
      data: communities.map((c) => {
        const creator = creatorMap.get(c.creatorId);
        return {
          id: c.id,
          name: c.name,
          description: c.description,
          avatarUrl: c.avatarUrl,
          coverUrl: c.coverUrl,
          memberCount: c.memberCount,
          maxMembers: c.maxMembers,
          isPublic: c.isPublic,
          category: c.category,
          locationName: c.locationName,
          creator: creator
            ? { id: creator.id, username: creator.username, displayName: creator.displayName, avatarUrl: creator.avatarUrl }
            : null,
          tags: communityTagMap.get(c.id) || [],
          createdAt: c.createdAt,
        };
      }),
      total,
      page,
    };
  }

  // ==================== 社群公告 ====================

  async getAnnouncements(communityId: string): Promise<CommunityAnnouncement[]> {
    return this.announcementRepo.find({
      where: { communityId },
      relations: { author: true },
      order: { isPinned: 'DESC', createdAt: 'DESC' },
    });
  }

  async createAnnouncement(communityId: string, userId: string, body: {
    title: string;
    content: string;
    isPinned?: boolean;
  }): Promise<CommunityAnnouncement> {
    const { isModerator } = await this.checkCommunityPermission(communityId, userId);
    if (!isModerator) throw new ForbiddenException('仅管理员可发布公告');

    if (!body.title?.trim()) throw new BadRequestException('公告标题不能为空');
    if (!body.content?.trim()) throw new BadRequestException('公告内容不能为空');

    const announcement = this.announcementRepo.create({
      id: uuidv4(),
      communityId,
      authorId: userId,
      title: body.title.trim(),
      content: body.content.trim(),
      isPinned: body.isPinned || false,
    });

    return this.announcementRepo.save(announcement);
  }

  async deleteAnnouncement(announcementId: string, userId: string): Promise<void> {
    const announcement = await this.announcementRepo.findOne({
      where: { id: announcementId },
    });
    if (!announcement) throw new NotFoundException('公告不存在');

    const { isModerator } = await this.checkCommunityPermission(announcement.communityId, userId);
    if (!isModerator) throw new ForbiddenException('仅管理员可删除公告');

    await this.announcementRepo.delete(announcementId);
  }

  // ==================== 社群角色 ====================

  async getRoles(communityId: string): Promise<any[]> {
    const roles = await this.roleRepo.find({
      where: { communityId },
      relations: { user: true },
    });

    return roles.map((r) => ({
      id: r.id,
      userId: r.userId,
      role: r.role,
      user: {
        id: r.user.id,
        username: r.user.username,
        displayName: r.user.displayName,
        avatarUrl: r.user.avatarUrl,
      },
      createdAt: r.createdAt,
    }));
  }

  async assignRole(communityId: string, operatorId: string, targetUserId: string, role: 'ADMIN' | 'MODERATOR'): Promise<void> {
    const { isCreator } = await this.checkCommunityPermission(communityId, operatorId);
    if (!isCreator) throw new ForbiddenException('仅创建者可分配角色');

    // 检查目标用户是否是成员
    const community = await this.communityRepo.findOne({ where: { id: communityId } });
    if (!community) throw new NotFoundException('社群不存在');

    const participant = await this.partRepo.findOne({
      where: { conversationId: community.conversationId, userId: targetUserId },
    });
    if (!participant) throw new BadRequestException('目标用户不是社群成员');

    // 更新或创建角色
    const existing = await this.roleRepo.findOne({
      where: { communityId, userId: targetUserId },
    });

    if (existing) {
      existing.role = role;
      await this.roleRepo.save(existing);
    } else {
      const newRole = this.roleRepo.create({
        id: uuidv4(),
        communityId,
        userId: targetUserId,
        role,
      });
      await this.roleRepo.save(newRole);
    }
  }

  async removeRole(communityId: string, operatorId: string, targetUserId: string): Promise<void> {
    const { isCreator } = await this.checkCommunityPermission(communityId, operatorId);
    if (!isCreator) throw new ForbiddenException('仅创建者可移除角色');

    await this.roleRepo.delete({ communityId, userId: targetUserId });
  }

  // ==================== 社群挑战 ====================

  async getChallenges(communityId: string, status?: string): Promise<any[]> {
    const where: any = { communityId };
    if (status) where.status = status;

    return this.challengeRepo.find({
      where,
      relations: { creator: true },
      order: { startDate: 'DESC' },
    });
  }

  async createChallenge(communityId: string, userId: string, body: {
    title: string;
    description?: string;
    type?: 'PHOTO' | 'ROUTE' | 'CHECKIN' | 'DISTANCE';
    startDate: string;
    endDate: string;
    maxParticipants?: number;
  }): Promise<CommunityChallenge> {
    const { isModerator } = await this.checkCommunityPermission(communityId, userId);
    if (!isModerator) throw new ForbiddenException('仅管理员可创建挑战');

    if (!body.title?.trim()) throw new BadRequestException('挑战标题不能为空');

    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('日期格式无效');
    }
    if (endDate <= startDate) {
      throw new BadRequestException('结束时间必须晚于开始时间');
    }

    const now = new Date();
    let status: 'UPCOMING' | 'ACTIVE' | 'ENDED' = 'UPCOMING';
    if (now >= startDate && now <= endDate) status = 'ACTIVE';
    if (now > endDate) status = 'ENDED';

    const challenge = this.challengeRepo.create({
      id: uuidv4(),
      communityId,
      creatorId: userId,
      title: body.title.trim(),
      description: body.description || null,
      type: body.type || 'PHOTO',
      startDate,
      endDate,
      maxParticipants: body.maxParticipants || 0,
      status,
    });

    return this.challengeRepo.save(challenge);
  }

  // ==================== 社群动态 ====================

  async getCommunityPosts(communityId: string, userId?: string, page = 1, limit = 20): Promise<{
    data: any[];
    total: number;
    page: number;
  }> {
    const skip = (page - 1) * limit;

    const [posts, total] = await this.postRepo.findAndCount({
      where: { communityId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // 获取作者信息
    const authorIds = [...new Set(posts.map((p) => p.authorId))];
    const authors = authorIds.length > 0
      ? await this.userRepo.findBy({ id: In(authorIds) })
      : [];
    const authorMap = new Map(authors.map((u) => [u.id, u]));

    return {
      data: posts.map((p) => {
        const author = authorMap.get(p.authorId);
        const { ...postDto } = p;
        return {
          ...postDto,
          author: author
            ? { id: author.id, username: author.username, displayName: author.displayName, avatarUrl: author.avatarUrl }
            : null,
        };
      }),
      total,
      page,
    };
  }

  // ==================== 挑战参与 ====================

  async joinChallenge(challengeId: string, userId: string, body?: { note?: string; postId?: string }): Promise<CommunityChallengeEntry> {
    const challenge = await this.challengeRepo.findOne({ where: { id: challengeId } });
    if (!challenge) throw new NotFoundException('挑战不存在');

    // 检查用户是否是社群成员
    const { isMember } = await this.checkCommunityPermission(challenge.communityId, userId);
    if (!isMember) throw new ForbiddenException('请先加入社群');

    // 检查是否已参与
    const existing = await this.entryRepo.findOne({ where: { challengeId, userId } });
    if (existing) throw new BadRequestException('你已经参与了此挑战');

    // 检查人数限制
    if (challenge.maxParticipants > 0 && challenge.participantCount >= challenge.maxParticipants) {
      throw new BadRequestException('参与人数已满');
    }

    const entry = this.entryRepo.create({
      id: uuidv4(),
      challengeId,
      userId,
      postId: body?.postId || null,
      note: body?.note || null,
    });
    await this.entryRepo.save(entry);

    // 更新参与人数
    challenge.participantCount += 1;
    await this.challengeRepo.save(challenge);

    return entry;
  }

  async getChallengeLeaderboard(challengeId: string): Promise<any[]> {
    const entries = await this.entryRepo.find({
      where: { challengeId },
      relations: { user: true },
      order: { score: 'DESC', createdAt: 'ASC' },
    });

    return entries.map((e, index) => ({
      rank: index + 1,
      userId: e.userId,
      user: e.user
        ? { id: e.user.id, username: e.user.username, displayName: e.user.displayName, avatarUrl: e.user.avatarUrl }
        : null,
      note: e.note,
      score: e.score,
      postId: e.postId,
      joinedAt: e.createdAt,
    }));
  }

  async getChallengeParticipationStatus(challengeId: string, userId: string): Promise<{
    isParticipating: boolean;
    entry: CommunityChallengeEntry | null;
  }> {
    const entry = await this.entryRepo.findOne({ where: { challengeId, userId } });
    return { isParticipating: !!entry, entry };
  }
}

import {
  Controller, Get, Post, Delete, Param, Body, Headers, Query, UnauthorizedException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { Conversation } from '../../entities/conversation.entity.js';
import { ConversationParticipant } from '../../entities/conversation-participant.entity.js';
import { Message } from '../../entities/message.entity.js';
import { User } from '../../entities/user.entity.js';
import { UserFollow } from '../../entities/user-follow.entity.js';
import { MessageReaction } from '../../entities/message-reaction.entity.js';
import { LocationShare } from '../../entities/location-share.entity.js';

@Controller('api/conversations')
export class ConversationsController {
  constructor(
    @InjectRepository(Conversation) private readonly convRepo: Repository<Conversation>,
    @InjectRepository(ConversationParticipant) private readonly partRepo: Repository<ConversationParticipant>,
    @InjectRepository(Message) private readonly msgRepo: Repository<Message>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(UserFollow) private readonly followRepo: Repository<UserFollow>,
    @InjectRepository(MessageReaction) private readonly reactionRepo: Repository<MessageReaction>,
    private readonly jwtService: JwtService,
  ) {}

  private getUserId(auth?: string): string {
    const token = auth?.replace('Bearer ', '') || null;
    if (!token) throw new UnauthorizedException('请先登录');
    try {
      return this.jwtService.verify(token).sub;
    } catch {
      throw new UnauthorizedException('Token 已过期或无效');
    }
  }

  // ==================== 会话列表 ====================

  @Get()
  async getConversations(
    @Headers('authorization') auth: string,
    @Query('status') status?: string,
  ) {
    const userId = this.getUserId(auth);

    // 构建查询条件：支持按状态过滤
    const whereCondition: any = { userId };
    if (status === 'REQUEST' || status === 'NORMAL') {
      whereCondition.status = status;
    } else if (!status) {
      whereCondition.status = 'NORMAL';
    }

    const participations = await this.partRepo.find({
      where: whereCondition,
      order: { joinedAt: 'DESC' },
    });

    if (participations.length === 0) {
      return { success: true, data: [] };
    }

    const convIds = participations.map((p) => p.conversationId);
    const conversations = await this.convRepo.find({
      where: { id: In(convIds) },
      relations: { messages: true },
      order: { updatedAt: 'DESC' },
    });

    // 获取所有参与者
    const allParts = await this.partRepo.find({
      where: { conversationId: In(convIds) },
    });
    const allUserIds = [...new Set(allParts.map((p) => p.userId))];
    const users = allUserIds.length ? await this.userRepo.findBy({ id: In(allUserIds) }) : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    const result = conversations.map((conv) => {
      const parts = allParts.filter((p) => p.conversationId === conv.id);
      const otherParts = parts.filter((p) => p.userId !== userId);
      const members = otherParts.map((p) => {
        const u = userMap.get(p.userId);
        return u
          ? { id: u.id, username: u.username, displayName: u.displayName, avatarUrl: u.avatarUrl }
          : null;
      }).filter(Boolean);

      const lastMsg = conv.messages?.length
        ? conv.messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        : null;

      const lastMsgSender = lastMsg ? userMap.get(lastMsg.senderId) : null;

      // 计算未读数
      const myPart = parts.find((p) => p.userId === userId);
      const unreadCount = lastMsg && myPart?.lastReadAt
        ? conv.messages.filter((m) => new Date(m.createdAt) > new Date(myPart.lastReadAt!)).length
        : lastMsg ? 1 : 0;

      return {
        id: conv.id,
        type: conv.type,
        title: conv.title,
        members: conv.type === 'GROUP' ? members : members.slice(0, 1),
        lastMessage: lastMsg
          ? {
              id: lastMsg.id,
              content: lastMsg.content,
              mediaUrl: lastMsg.mediaUrl,
              mediaType: lastMsg.mediaType,
              sender: lastMsgSender
                ? { id: lastMsgSender.id, username: lastMsgSender.username, displayName: lastMsgSender.displayName, avatarUrl: lastMsgSender.avatarUrl }
                : null,
              createdAt: lastMsg.createdAt,
            }
          : null,
        unreadCount,
        myStatus: myPart?.status || 'NORMAL',
        updatedAt: conv.updatedAt || conv.createdAt,
      };
    });

    return { success: true, data: result };
  }

  // ==================== 获取消息（游标分页） ====================

  @Get(':id/messages')
  async getMessages(
    @Headers('authorization') auth: string,
    @Param('id') convId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = this.getUserId(auth);

    // 验证用户是否是会话参与者
    const part = await this.partRepo.findOne({
      where: { conversationId: convId, userId },
    });
    if (!part) throw new NotFoundException('会话不存在');

    const limitNum = Math.min(parseInt(limit || '30'), 100);

    const qb = this.msgRepo
      .createQueryBuilder('msg')
      .leftJoinAndSelect('msg.sender', 'sender')
      .where('msg.conversationId = :convId', { convId })
      .orderBy('msg.createdAt', 'DESC')
      .take(limitNum + 1);

    if (cursor) {
      qb.andWhere('msg.id < :cursor', { cursor });
    }

    const msgs = await qb.getMany();
    const hasMore = msgs.length > limitNum;
    const data = msgs.slice(0, limitNum);

    // 更新最后阅读时间
    part.lastReadAt = new Date();
    await this.partRepo.save(part);

    return {
      success: true,
      data: data.map((m) => {
        const { passwordHash, ...sender } = m.sender;
        return { ...m, sender };
      }),
      nextCursor: hasMore ? data[data.length - 1].id : null,
      hasMore,
    };
  }

  // ==================== 发送消息 ====================

  @Post(':id/messages')
  async sendMessage(
    @Headers('authorization') auth: string,
    @Param('id') convId: string,
    @Body() body: { content?: string; mediaUrl?: string; mediaType?: string },
  ) {
    const userId = this.getUserId(auth);

    const part = await this.partRepo.findOne({
      where: { conversationId: convId, userId },
    });
    if (!part) throw new NotFoundException('会话不存在');

    const message = this.msgRepo.create({
      id: uuidv4(),
      conversationId: convId,
      senderId: userId,
      content: body.content || null,
      mediaUrl: body.mediaUrl || null,
      mediaType: (body.mediaType as any) || null,
    });
    await this.msgRepo.save(message);

    // 更新会话时间
    await this.convRepo.update(convId, { updatedAt: new Date() });

    const sender = await this.userRepo.findOne({ where: { id: userId } });

    return {
      success: true,
      data: {
        id: message.id,
        content: message.content,
        mediaUrl: message.mediaUrl,
        mediaType: message.mediaType,
        createdAt: message.createdAt,
        sender: sender
          ? { id: sender.id, username: sender.username, displayName: sender.displayName, avatarUrl: sender.avatarUrl }
          : null,
      },
    };
  }

  // ==================== 创建/获取私聊 ====================

  @Post('direct/:userId')
  async getOrCreateDirectConversation(
    @Headers('authorization') auth: string,
    @Param('userId') targetId: string,
  ) {
    const userId = this.getUserId(auth);
    if (userId === targetId) throw new NotFoundException('不能和自己聊天');

    // 查找是否已存在私聊会话
    const myParts = await this.partRepo.find({ where: { userId } });
    const targetParts = await this.partRepo.find({ where: { userId: targetId } });

    const myConvIds = myParts.map((p) => p.conversationId);
    const commonConvIds = targetParts.filter((p) => myConvIds.includes(p.conversationId)).map((p) => p.conversationId);

    if (commonConvIds.length > 0) {
      const conv = await this.convRepo.findOne({ where: { id: In(commonConvIds), type: 'DIRECT' } });
      if (conv) return { success: true, data: { id: conv.id } };
    }

    // 检查是否互相关注
    const iFollowTarget = await this.followRepo.findOne({ where: { followerId: userId, followingId: targetId } });
    const targetFollowsMe = await this.followRepo.findOne({ where: { followerId: targetId, followingId: userId } });
    const isMutual = iFollowTarget && targetFollowsMe;

    // 创建新的私聊会话
    const convId = uuidv4();
    const conv = this.convRepo.create({
      id: convId,
      type: 'DIRECT',
      updatedAt: new Date(),
    });
    await this.convRepo.save(conv);

    const parts = [
      this.partRepo.create({ id: uuidv4(), conversationId: convId, userId, status: 'NORMAL' }),
      this.partRepo.create({ id: uuidv4(), conversationId: convId, userId: targetId, status: isMutual ? 'NORMAL' : 'REQUEST' }),
    ];
    await this.partRepo.save(parts);

    return { success: true, data: { id: convId, isRequest: !isMutual } };
  }

  // ==================== 消息请求操作 ====================

  @Post(':id/accept')
  async acceptMessageRequest(
    @Headers('authorization') auth: string,
    @Param('id') convId: string,
  ) {
    const userId = this.getUserId(auth);

    const part = await this.partRepo.findOne({
      where: { conversationId: convId, userId, status: 'REQUEST' },
    });
    if (!part) throw new NotFoundException('消息请求不存在');

    part.status = 'NORMAL';
    await this.partRepo.save(part);

    return { success: true, message: '已接受消息请求' };
  }

  @Post(':id/reject')
  async rejectMessageRequest(
    @Headers('authorization') auth: string,
    @Param('id') convId: string,
  ) {
    const userId = this.getUserId(auth);

    const part = await this.partRepo.findOne({
      where: { conversationId: convId, userId, status: 'REQUEST' },
    });
    if (!part) throw new NotFoundException('消息请求不存在');

    part.status = 'HIDDEN';
    await this.partRepo.save(part);

    return { success: true, message: '已拒绝消息请求' };
  }

  // ==================== 消息反应 ====================

  @Post('messages/:messageId/reactions')
  async addReaction(
    @Headers('authorization') auth: string,
    @Param('messageId') messageId: string,
    @Body() body: { emoji: string },
  ) {
    const userId = this.getUserId(auth);
    if (!body.emoji) throw new NotFoundException('emoji不能为空');

    // 验证消息存在
    const msg = await this.msgRepo.findOne({ where: { id: messageId } });
    if (!msg) throw new NotFoundException('消息不存在');

    // 检查是否已有相同反应
    const existing = await this.reactionRepo.findOne({
      where: { messageId, userId, emoji: body.emoji },
    });
    if (existing) {
      return { success: true, data: existing };
    }

    const reaction = this.reactionRepo.create({
      id: uuidv4(),
      messageId,
      userId,
      emoji: body.emoji,
    });
    await this.reactionRepo.save(reaction);

    return { success: true, data: reaction };
  }

  @Delete('messages/:messageId/reactions/:emoji')
  async removeReaction(
    @Headers('authorization') auth: string,
    @Param('messageId') messageId: string,
    @Param('emoji') emoji: string,
  ) {
    const userId = this.getUserId(auth);

    const reaction = await this.reactionRepo.findOne({
      where: { messageId, userId, emoji },
    });
    if (!reaction) throw new NotFoundException('反应不存在');

    await this.reactionRepo.remove(reaction);
    return { success: true, message: '已取消反应' };
  }

  @Get('messages/:messageId/reactions')
  async getReactions(
    @Param('messageId') messageId: string,
  ) {
    const reactions = await this.reactionRepo.find({
      where: { messageId },
      relations: { user: true },
      order: { createdAt: 'ASC' },
    });

    // 按emoji分组
    const grouped: Record<string, { emoji: string; count: number; users: any[] }> = {};
    for (const r of reactions) {
      if (!grouped[r.emoji]) {
        grouped[r.emoji] = { emoji: r.emoji, count: 0, users: [] };
      }
      grouped[r.emoji].count++;
      grouped[r.emoji].users.push({
        id: r.user.id,
        username: r.user.username,
        displayName: r.user.displayName,
        avatarUrl: r.user.avatarUrl,
      });
    }

    return { success: true, data: Object.values(grouped) };
  }
}

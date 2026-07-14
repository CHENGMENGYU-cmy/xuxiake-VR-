import {
  Controller, Get, Post, Param, Body, Headers, Query, UnauthorizedException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { Conversation } from '../../entities/conversation.entity.js';
import { ConversationParticipant } from '../../entities/conversation-participant.entity.js';
import { Message } from '../../entities/message.entity.js';
import { User } from '../../entities/user.entity.js';

@Controller('api/conversations')
export class ConversationsController {
  constructor(
    @InjectRepository(Conversation) private readonly convRepo: Repository<Conversation>,
    @InjectRepository(ConversationParticipant) private readonly partRepo: Repository<ConversationParticipant>,
    @InjectRepository(Message) private readonly msgRepo: Repository<Message>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
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

  @Get()
  async getConversations(@Headers('authorization') auth: string) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    // 获取用户参与的会话
    const participations = await this.partRepo.find({
      where: { userId },
      order: { joinedAt: 'DESC' },
    });

    if (participations.length === 0) {
      return { success: true, data: [] };
    }

    const convIds = participations.map((p) => p.conversationId);
    const conversations = await this.convRepo.find({
      where: { id: In(convIds) },
      relations: ['messages'],
      order: { updatedAt: 'DESC' },
    });

    // 获取所有参与者
    const allParts = await this.partRepo.find({
      where: { conversationId: In(convIds) },
    });
    const allUserIds = [...new Set(allParts.map((p) => p.userId))];
    const users = allUserIds.length ? await this.userRepo.findBy({ id: In(allUserIds) }) : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    // 构建会话列表
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
              sender: lastMsgSender
                ? { id: lastMsgSender.id, username: lastMsgSender.username, displayName: lastMsgSender.displayName, avatarUrl: lastMsgSender.avatarUrl }
                : null,
              createdAt: lastMsg.createdAt,
            }
          : null,
        unreadCount,
        updatedAt: conv.updatedAt || conv.createdAt,
      };
    });

    return { success: true, data: result };
  }

  @Get(':id/messages')
  async getMessages(
    @Headers('authorization') auth: string,
    @Param('id') convId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '50');
    const skip = (pageNum - 1) * limitNum;

    // 验证用户是否是会话参与者
    const part = await this.partRepo.findOne({
      where: { conversationId: convId, userId },
    });
    if (!part) throw new NotFoundException('会话不存在');

    const [messages, total] = await this.msgRepo.findAndCount({
      where: { conversationId: convId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
      skip,
      take: limitNum,
    });

    // 更新最后阅读时间
    part.lastReadAt = new Date();
    await this.partRepo.save(part);

    return {
      success: true,
      data: messages.map((m) => ({
        id: m.id,
        content: m.content,
        mediaUrl: m.mediaUrl,
        mediaType: m.mediaType,
        createdAt: m.createdAt,
        sender: m.sender
          ? {
              id: m.sender.id,
              username: m.sender.username,
              displayName: m.sender.displayName,
              avatarUrl: m.sender.avatarUrl,
            }
          : null,
      })),
      total,
      page: pageNum,
    };
  }

  @Post(':id/messages')
  async sendMessage(
    @Headers('authorization') auth: string,
    @Param('id') convId: string,
    @Body() body: { content?: string; mediaUrl?: string; mediaType?: string },
  ) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');

    // 验证用户是否是会话参与者
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

  @Post('direct/:userId')
  async getOrCreateDirectConversation(
    @Headers('authorization') auth: string,
    @Param('userId') targetId: string,
  ) {
    const userId = this.getUserId(auth);
    if (!userId) throw new UnauthorizedException('请先登录');
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

    // 创建新的私聊会话
    const convId = uuidv4();
    const conv = this.convRepo.create({
      id: convId,
      type: 'DIRECT',
      updatedAt: new Date(),
    });
    await this.convRepo.save(conv);

    const parts = [
      this.partRepo.create({ id: uuidv4(), conversationId: convId, userId }),
      this.partRepo.create({ id: uuidv4(), conversationId: convId, userId: targetId }),
    ];
    await this.partRepo.save(parts);

    return { success: true, data: { id: convId } };
  }
}

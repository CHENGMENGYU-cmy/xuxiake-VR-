import { Controller, Get, Param, Query, Headers, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Conversation } from '../../entities/conversation.entity.js';
import { ConversationParticipant } from '../../entities/conversation-participant.entity.js';
import { Message } from '../../entities/message.entity.js';
import { User } from '../../entities/user.entity.js';

@Controller('api/conversations')
export class ChatController {
  constructor(
    @InjectRepository(Conversation)
    private readonly convRepo: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private readonly partRepo: Repository<ConversationParticipant>,
    @InjectRepository(Message)
    private readonly msgRepo: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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

  @Get()
  async getConversations(@Headers('authorization') auth: string) {
    const userId = this.getUserId(auth);

    const parts = await this.partRepo.find({ where: { userId } });
    const convIds = parts.map((p) => p.conversationId);
    if (!convIds.length) return { success: true, data: [] };

    const convs = await this.convRepo.find({
      where: { id: In(convIds) },
      order: { updatedAt: 'DESC' },
    });

    const data = await Promise.all(
      convs.map(async (conv) => {
        const memberships = await this.partRepo.find({ where: { conversationId: conv.id } });
        const memberIds = memberships.map((m) => m.userId);
        const members = await this.userRepo.findBy({ id: In(memberIds) });

        const lastMsg = await this.msgRepo.findOne({
          where: { conversationId: conv.id },
          order: { createdAt: 'DESC' },
        });

        return {
          ...conv,
          memberIds,
          members: members.map((u) => {
            const { passwordHash, ...uDto } = u;
            return uDto;
          }),
          lastMessage: lastMsg ? {
            ...lastMsg,
            sender: members.find((u) => u.id === lastMsg.senderId) ? (() => {
              const { passwordHash, ...s } = members.find((u) => u.id === lastMsg.senderId)!;
              return s;
            })() : null,
          } : null,
          unreadCount: 0,
        };
      }),
    );

    return { success: true, data };
  }

  @Get(':id/messages')
  async getMessages(
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
  ) {
    const qb = this.msgRepo
      .createQueryBuilder('msg')
      .leftJoinAndSelect('msg.sender', 'sender')
      .where('msg.conversationId = :convId', { convId: id })
      .orderBy('msg.createdAt', 'DESC')
      .take(31);

    if (cursor) {
      qb.andWhere('msg.id != :cursor', { cursor });
    }

    const msgs = await qb.getMany();
    const hasMore = msgs.length > 30;
    const data = msgs.slice(0, 30);

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
}

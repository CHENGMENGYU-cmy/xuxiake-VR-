import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../../entities/message.entity.js';
import { Conversation } from '../../entities/conversation.entity.js';
import { ConversationParticipant } from '../../entities/conversation-participant.entity.js';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<string, Set<string>>();

  constructor(
    @InjectRepository(Message) private readonly msgRepo: Repository<Message>,
    @InjectRepository(Conversation) private readonly convRepo: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private readonly partRepo: Repository<ConversationParticipant>,
  ) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      if (!this.onlineUsers.has(userId)) {
        this.onlineUsers.set(userId, new Set());
      }
      this.onlineUsers.get(userId)!.add(client.id);
      this.server.emit('presence:online', { userId });
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      const sockets = this.onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.onlineUsers.delete(userId);
          this.server.emit('presence:offline', { userId });
        }
      }
    }
  }

  @SubscribeMessage('chat:message:send')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    const userId = client.handshake.query.userId as string;
    if (!userId || !data.conversationId) return;

    const msg = this.msgRepo.create({
      id: uuidv4(),
      conversationId: data.conversationId,
      senderId: userId,
      content: data.content,
    });
    await this.msgRepo.save(msg);

    await this.convRepo.update(data.conversationId, { updatedAt: new Date() });

    const memberships = await this.partRepo.find({
      where: { conversationId: data.conversationId },
    });

    memberships.forEach((m) => {
      const sockets = this.onlineUsers.get(m.userId);
      if (sockets) {
        sockets.forEach((socketId) => {
          this.server.to(socketId).emit('chat:message:new', msg);
        });
      }
    });
  }

  @SubscribeMessage('chat:typing:start')
  async handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.handshake.query.userId as string;
    const memberships = await this.partRepo.find({
      where: { conversationId: data.conversationId },
    });
    memberships.forEach((m) => {
      if (m.userId !== userId) {
        const sockets = this.onlineUsers.get(m.userId);
        sockets?.forEach((sid) => {
          this.server.to(sid).emit('chat:typing', { conversationId: data.conversationId, userId });
        });
      }
    });
  }

  @SubscribeMessage('chat:message:read')
  handleRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    console.log(`[Chat] 用户标记会话 ${data.conversationId} 已读`);
  }

  @SubscribeMessage('presence:get')
  handleGetPresence() {
    return Array.from(this.onlineUsers.keys());
  }
}

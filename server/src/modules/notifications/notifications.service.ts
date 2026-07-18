import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Notification, NotificationType } from '../../entities/notification.entity.js';
import { User } from '../../entities/user.entity.js';
import { ChatGateway } from '../chat/chat.gateway.js';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private readonly notifRepo: Repository<Notification>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly chatGateway: ChatGateway,
  ) {}

  async create(
    recipientId: string,
    senderId: string | null,
    type: NotificationType,
    message: string,
    postId?: string,
  ): Promise<Notification> {
    const notif = this.notifRepo.create({
      id: uuidv4(),
      recipientId,
      senderId,
      type,
      message,
      postId: postId || null,
    });
    await this.notifRepo.save(notif);

    // 推送实时通知
    const unreadCount = await this.notifRepo.count({ where: { recipientId, isRead: false } });
    const sender = senderId ? await this.userRepo.findOne({ where: { id: senderId } }) : null;
    const senderData = sender
      ? { id: sender.id, username: sender.username, displayName: sender.displayName, avatarUrl: sender.avatarUrl }
      : null;

    this.chatGateway.emitNotification(recipientId, {
      notification: { ...notif, sender: senderData },
      unreadCount,
    });

    return notif;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifRepo.count({ where: { recipientId: userId, isRead: false } });
  }
}

import {
  Controller, Get, Post, Patch, Param, Sse, Headers, UnauthorizedException, Query,
} from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Notification } from '../../entities/notification.entity.js';
import { User } from '../../entities/user.entity.js';

const notificationSubjects = new Map<string, Subject<any>>();

@Controller('api')
export class NotificationsController {
  constructor(
    @InjectRepository(Notification) private readonly notifRepo: Repository<Notification>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
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

  @Get('notifications')
  async getNotifications(@Headers('authorization') auth: string) {
    const userId = this.getUserId(auth);
    const notifs = await this.notifRepo.find({
      where: { recipientId: userId },
      order: { createdAt: 'DESC' },
    });

    const senderIds = [...new Set(notifs.filter((n) => n.senderId).map((n) => n.senderId!))];
    const senders = senderIds.length ? await this.userRepo.findBy({ id: In(senderIds) }) : [];
    const senderMap = new Map(senders.map((s) => [s.id, s]));

    return {
      success: true,
      data: notifs.map((n) => {
        const senderUser = n.senderId ? senderMap.get(n.senderId) || null : null;
        if (!senderUser) return { ...n, sender: null };
        const { passwordHash, ...sender } = senderUser;
        return { ...n, sender };
      }),
    };
  }

  @Get('notifications/unread-count')
  async getUnreadCount(@Headers('authorization') auth: string) {
    const userId = this.getUserId(auth);
    const count = await this.notifRepo.count({ where: { recipientId: userId, isRead: false } });
    return { success: true, data: { count } };
  }

  @Post('notifications/read-all')
  async readAll(@Headers('authorization') auth: string) {
    const userId = this.getUserId(auth);
    await this.notifRepo.update({ recipientId: userId }, { isRead: true });
    return { success: true, message: '已全部标为已读' };
  }

  @Patch('notifications/:id/read')
  async readOne(@Headers('authorization') auth: string, @Param('id') id: string) {
    const userId = this.getUserId(auth);
    const notif = await this.notifRepo.findOne({ where: { id, recipientId: userId } });
    if (notif) {
      notif.isRead = true;
      await this.notifRepo.save(notif);
    }
    return { success: true, data: notif };
  }

  @Sse('sse/notifications')
  sseNotifications(@Query('token') token: string): Observable<MessageEvent> {
    let userId: string;
    try {
      userId = this.jwtService.verify(token || '').sub;
    } catch {
      throw new UnauthorizedException('无效 token');
    }

    if (!notificationSubjects.has(userId)) {
      notificationSubjects.set(userId, new Subject());
    }
    const subject = notificationSubjects.get(userId)!;

    const interval = setInterval(() => {
      subject.next({ data: JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }) } as any);
    }, 30000);

    subject.subscribe({
      complete: () => clearInterval(interval),
      error: () => clearInterval(interval),
    });

    return subject.asObservable();
  }
}

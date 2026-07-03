import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity.js';

@Entity('notifications')
export class Notification {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'recipient_id', type: 'varchar', length: 36 })
  recipientId: string;

  @Column({ name: 'sender_id', type: 'varchar', length: 36, nullable: true })
  senderId: string | null;

  @Column({ type: 'enum', enum: ['COMMENT', 'FOLLOW', 'LIKE', 'MESSAGE', 'SYSTEM'] })
  type: 'COMMENT' | 'FOLLOW' | 'LIKE' | 'MESSAGE' | 'SYSTEM';

  @Column({ type: 'varchar', length: 500 })
  message: string;

  @Column({ name: 'post_id', type: 'varchar', length: 36, nullable: true })
  postId: string | null;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.receivedNotifications)
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @ManyToOne(() => User, (user) => user.sentNotifications)
  @JoinColumn({ name: 'sender_id' })
  sender: User | null;
}

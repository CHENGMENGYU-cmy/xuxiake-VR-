import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity.js';
import { Message } from './message.entity.js';

@Entity('message_reactions')
@Unique(['messageId', 'userId', 'emoji'])
export class MessageReaction {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'message_id', type: 'varchar', length: 36 })
  messageId: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Column({ type: 'varchar', length: 10 })
  emoji: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Message)
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

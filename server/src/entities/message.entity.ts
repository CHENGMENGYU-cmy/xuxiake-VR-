import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity.js';
import { Conversation } from './conversation.entity.js';

@Entity('messages')
export class Message {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'conversation_id', type: 'varchar', length: 36 })
  conversationId: string;

  @Column({ name: 'sender_id', type: 'varchar', length: 36 })
  senderId: string;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ name: 'media_url', type: 'varchar', length: 500, nullable: true })
  mediaUrl: string | null;

  @Column({ name: 'media_type', type: 'enum', enum: ['IMAGE', 'FILE', 'AUDIO', 'CARD'], nullable: true })
  mediaType: 'IMAGE' | 'FILE' | 'AUDIO' | 'CARD' | null;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Conversation, (conv) => conv.messages)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn({ name: 'sender_id' })
  sender: User;
}

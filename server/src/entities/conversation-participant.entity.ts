import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('conversation_participants')
export class ConversationParticipant {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'conversation_id', type: 'varchar', length: 36 })
  conversationId: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Column({ type: 'enum', enum: ['NORMAL', 'REQUEST', 'HIDDEN'], default: 'NORMAL' })
  status: 'NORMAL' | 'REQUEST' | 'HIDDEN';

  @Column({ name: 'last_read_at', type: 'timestamp', nullable: true })
  lastReadAt: Date | null;

  @Column({ name: 'joined_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;
}

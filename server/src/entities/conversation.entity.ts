import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Message } from './message.entity.js';

@Entity('conversations')
export class Conversation {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'enum', enum: ['DIRECT', 'GROUP'] })
  type: 'DIRECT' | 'GROUP';

  @Column({ type: 'varchar', length: 200, nullable: true })
  title: string | null;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @OneToMany(() => Message, (msg) => msg.conversation)
  messages: Message[];
}

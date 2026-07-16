import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity.js';
import { InterestTag } from './interest-tag.entity.js';

@Entity('user_interests')
export class UserInterest {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Column({ name: 'tag_id', type: 'varchar', length: 36 })
  tagId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => InterestTag, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  tag: InterestTag;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

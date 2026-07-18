import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Community } from './community.entity.js';
import { User } from './user.entity.js';

@Entity('community_roles')
export class CommunityRole {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'community_id', type: 'varchar', length: 36 })
  communityId: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Column({ type: 'enum', enum: ['ADMIN', 'MODERATOR'], default: 'ADMIN' })
  role: 'ADMIN' | 'MODERATOR';

  @ManyToOne(() => Community, (c) => c.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'community_id' })
  community: Community;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

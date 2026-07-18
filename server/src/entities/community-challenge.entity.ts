import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Community } from './community.entity.js';
import { User } from './user.entity.js';

@Entity('community_challenges')
export class CommunityChallenge {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'community_id', type: 'varchar', length: 36 })
  communityId: string;

  @Column({ name: 'creator_id', type: 'varchar', length: 36 })
  creatorId: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50, default: 'PHOTO' })
  type: 'PHOTO' | 'ROUTE' | 'CHECKIN' | 'DISTANCE';

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  endDate: Date;

  @Column({ name: 'max_participants', type: 'int', default: 0 })
  maxParticipants: number;

  @Column({ name: 'participant_count', type: 'int', default: 0 })
  participantCount: number;

  @Column({ type: 'enum', enum: ['UPCOMING', 'ACTIVE', 'ENDED'], default: 'UPCOMING' })
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED';

  @ManyToOne(() => Community, (c) => c.challenges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'community_id' })
  community: Community;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

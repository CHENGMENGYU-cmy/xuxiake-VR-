import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { CommunityChallenge } from './community-challenge.entity.js';
import { User } from './user.entity.js';
import { Post } from './post.entity.js';

@Entity('community_challenge_entries')
export class CommunityChallengeEntry {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'challenge_id', type: 'varchar', length: 36 })
  challengeId: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Column({ name: 'post_id', type: 'varchar', length: 36, nullable: true })
  postId: string | null;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ name: 'score', type: 'int', default: 0 })
  score: number;

  @ManyToOne(() => CommunityChallenge, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'challenge_id' })
  challenge: CommunityChallenge;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'post_id' })
  post: Post | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Post } from './post.entity.js';

@Entity('guide_details')
export class GuideDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'post_id', type: 'varchar', length: 36, unique: true })
  postId: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  destination: string | null;

  @Column({ type: 'enum', enum: ['FOOD', 'STAY', 'TRANSPORT', 'TICKET', 'TIPS'], default: 'TIPS' })
  category: 'FOOD' | 'STAY' | 'TRANSPORT' | 'TICKET' | 'TIPS';

  @Column({ name: 'best_season', type: 'varchar', length: 50, nullable: true })
  bestSeason: string | null;

  @Column({ name: 'budget_level', type: 'enum', enum: ['BUDGET', 'MID', 'LUXURY'], default: 'MID' })
  budgetLevel: 'BUDGET' | 'MID' | 'LUXURY';

  @Column({ name: 'rich_content', type: 'longtext', nullable: true })
  richContent: string | null;

  @OneToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;
}

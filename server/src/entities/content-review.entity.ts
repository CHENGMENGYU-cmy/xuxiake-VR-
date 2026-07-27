import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity.js';
import { Post } from './post.entity.js';

@Entity('content_reviews')
export class ContentReview {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'post_id', type: 'varchar', length: 36 })
  postId: string;

  @Column({ name: 'reviewer_id', type: 'varchar', length: 36, nullable: true })
  reviewerId: string | null;

  @Column({ type: 'enum', enum: ['PENDING', 'APPROVED', 'REJECTED', 'FLAGGED'], default: 'PENDING' })
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';

  @Column({ name: 'risk_type', type: 'varchar', length: 50, nullable: true, comment: '敏感词/违规图片/隐私信息/其他' })
  riskType: string | null;

  @Column({ name: 'risk_detail', type: 'text', nullable: true })
  riskDetail: string | null;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User | null;
}

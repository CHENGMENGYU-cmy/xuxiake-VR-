import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity.js';
import { Post } from './post.entity.js';

@Entity('reports')
export class Report {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'reporter_id', type: 'varchar', length: 36 })
  reporterId: string;

  @Column({ name: 'post_id', type: 'varchar', length: 36 })
  postId: string;

  @Column({ type: 'varchar', length: 100 })
  reason: string;

  @Column({ type: 'text', nullable: true })
  detail: string | null;

  @Column({ type: 'enum', enum: ['PENDING', 'RESOLVED', 'DISMISSED'], default: 'PENDING' })
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';

  @Column({ name: 'resolved_by', type: 'varchar', length: 36, nullable: true })
  resolvedBy: string | null;

  @Column({ name: 'resolution', type: 'text', nullable: true })
  resolution: string | null;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'resolved_by' })
  resolver: User | null;
}

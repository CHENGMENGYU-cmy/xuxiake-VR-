import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity.js';
import { Post } from './post.entity.js';

@Entity('video_comments')
export class VideoComment {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'post_id', type: 'varchar', length: 36 })
  postId: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'time_offset', type: 'decimal', precision: 10, scale: 3, default: 0, comment: '视频时间位置(秒)' })
  timeOffset: number;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '弹幕颜色' })
  color: string | null;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

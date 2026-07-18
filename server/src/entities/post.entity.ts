import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity.js';
import { MediaItem } from './media-item.entity.js';
import { Comment } from './comment.entity.js';
import { Like } from './like.entity.js';
import { Community } from './community.entity.js';

@Entity('posts')
export class Post {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'author_id', type: 'varchar', length: 36 })
  authorId: string;

  @Column({ name: 'community_id', type: 'varchar', length: 36, nullable: true })
  communityId: string | null;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ name: 'location_lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
  locationLat: number | null;

  @Column({ name: 'location_lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
  locationLng: number | null;

  @Column({ name: 'location_name', type: 'varchar', length: 200, nullable: true })
  locationName: string | null;

  @Column({ name: 'vr_metadata', type: 'text', nullable: true })
  vrMetadata: string | null;

  @Column({ type: 'enum', enum: ['PUBLIC', 'PRIVATE', 'FOLLOWERS'], default: 'PUBLIC', enumName: 'posts_visibility_enum' })
  visibility: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS';

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount: number;

  @Column({ name: 'comment_count', type: 'int', default: 0 })
  commentCount: number;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @OneToMany(() => MediaItem, (media) => media.post)
  mediaItems: MediaItem[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];
}

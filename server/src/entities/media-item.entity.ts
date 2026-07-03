import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Post } from './post.entity.js';

@Entity('media_items')
export class MediaItem {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'post_id', type: 'varchar', length: 36 })
  postId: string;

  @Column({ type: 'enum', enum: ['AUDIO', 'IMAGE', 'LINK', 'TRANSLATION', 'VIDEO'] })
  type: 'AUDIO' | 'IMAGE' | 'LINK' | 'TRANSLATION' | 'VIDEO';

  @Column({ type: 'varchar', length: 500, nullable: true })
  url: string | null;

  @Column({ name: 'thumbnail_url', type: 'varchar', length: 500, nullable: true })
  thumbnailUrl: string | null;

  @Column({ name: 'hls_url', type: 'varchar', length: 500, nullable: true })
  hlsUrl: string | null;

  @Column({ type: 'int', nullable: true })
  duration: number | null;

  @Column({ type: 'int', nullable: true })
  width: number | null;

  @Column({ type: 'int', nullable: true })
  height: number | null;

  @Column({ name: 'vr_format', type: 'enum', enum: ['SPATIAL', 'STANDARD', 'VR180', 'VR360'], nullable: true })
  vrFormat: 'SPATIAL' | 'STANDARD' | 'VR180' | 'VR360' | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  language: string | null;

  @Column({ name: 'translated_text', type: 'text', nullable: true })
  translatedText: string | null;

  @Column({ name: 'link_url', type: 'varchar', length: 500, nullable: true })
  linkUrl: string | null;

  @Column({ name: 'link_title', type: 'varchar', length: 500, nullable: true })
  linkTitle: string | null;

  @Column({ name: 'link_description', type: 'text', nullable: true })
  linkDescription: string | null;

  @Column({ name: 'link_favicon', type: 'varchar', length: 500, nullable: true })
  linkFavicon: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Post, (post) => post.mediaItems)
  @JoinColumn({ name: 'post_id' })
  post: Post;
}

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Collection } from './collection.entity.js';
import { Post } from './post.entity.js';

@Entity('collection_posts')
export class CollectionPost {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'collection_id', type: 'varchar', length: 36 })
  collectionId: string;

  @Column({ name: 'post_id', type: 'varchar', length: 36 })
  postId: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @ManyToOne(() => Collection, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @CreateDateColumn({ name: 'added_at' })
  addedAt: Date;
}

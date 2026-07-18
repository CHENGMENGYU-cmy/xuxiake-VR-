import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity.js';

@Entity('collections')
export class Collection {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'creator_id', type: 'varchar', length: 36 })
  creatorId: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'cover_url', type: 'varchar', length: 500, nullable: true })
  coverUrl: string | null;

  @Column({ name: 'is_public', type: 'boolean', default: true })
  isPublic: boolean;

  @Column({ name: 'post_count', type: 'int', default: 0 })
  postCount: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

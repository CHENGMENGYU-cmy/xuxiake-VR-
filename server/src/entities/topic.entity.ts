import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('topics')
export class Topic {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  icon: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'cover_url', type: 'varchar', length: 500, nullable: true })
  coverUrl: string | null;

  @Column({ name: 'post_count', type: 'int', default: 0 })
  postCount: number;

  @Column({ name: 'is_hot', type: 'boolean', default: false })
  isHot: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

import { Entity, Column, PrimaryColumn, ManyToMany, CreateDateColumn } from 'typeorm';
import { User } from './user.entity.js';

@Entity('interest_tags')
export class InterestTag {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  category: 'TRAVEL' | 'VR' | 'ACTIVITY' | 'CULTURE' | 'OTHER';

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_hot', type: 'boolean', default: false })
  isHot: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Community } from './community.entity.js';
import { InterestTag } from './interest-tag.entity.js';

@Entity('community_tags')
export class CommunityTag {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'community_id', type: 'varchar', length: 36 })
  communityId: string;

  @Column({ name: 'tag_id', type: 'varchar', length: 36 })
  tagId: string;

  @ManyToOne(() => Community, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'community_id' })
  community: Community;

  @ManyToOne(() => InterestTag, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  tag: InterestTag;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

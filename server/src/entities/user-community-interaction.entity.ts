import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('user_community_interactions')
export class UserCommunityInteraction {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Column({ name: 'community_id', type: 'varchar', length: 36 })
  communityId: string;

  @Column({ name: 'action_type', type: 'enum', enum: ['VIEW', 'LIKE', 'COMMENT', 'SHARE', 'JOIN'] })
  actionType: 'VIEW' | 'LIKE' | 'COMMENT' | 'SHARE' | 'JOIN';

  @Column({ type: 'int', default: 1 })
  weight: number;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

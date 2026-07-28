import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('recommendation_feedback')
export class RecommendationFeedback {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Column({ name: 'target_id', type: 'varchar', length: 36 })
  targetId: string;

  @Column({ name: 'target_type', type: 'enum', enum: ['COMMUNITY', 'USER'] })
  targetType: 'COMMUNITY' | 'USER';

  @Column({ type: 'enum', enum: ['NOT_INTERESTED', 'INTERESTED', 'CLICK', 'VIEW'] })
  type: 'NOT_INTERESTED' | 'INTERESTED' | 'CLICK' | 'VIEW';

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

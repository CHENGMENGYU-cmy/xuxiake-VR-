import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('user_follows')
export class UserFollow {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'follower_id', type: 'varchar', length: 36 })
  followerId: string;

  @Column({ name: 'following_id', type: 'varchar', length: 36 })
  followingId: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

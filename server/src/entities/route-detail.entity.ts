import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Post } from './post.entity.js';

@Entity('route_details')
export class RouteDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'post_id', type: 'varchar', length: 36, unique: true })
  postId: string;

  @Column({ name: 'distance_km', type: 'decimal', precision: 10, scale: 2, nullable: true })
  distanceKm: number | null;

  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  durationMinutes: number | null;

  @Column({ name: 'elevation_gain_m', type: 'int', nullable: true })
  elevationGainM: number | null;

  @Column({ type: 'enum', enum: ['EASY', 'MODERATE', 'HARD', 'EXPERT'], default: 'MODERATE' })
  difficulty: 'EASY' | 'MODERATE' | 'HARD' | 'EXPERT';

  @Column({ name: 'route_type', type: 'enum', enum: ['HIKE', 'BIKE', 'DRIVE', 'PADDLE', 'CLIMB'], default: 'HIKE' })
  routeType: 'HIKE' | 'BIKE' | 'DRIVE' | 'PADDLE' | 'CLIMB';

  @Column({ name: 'gpx_data', type: 'text', nullable: true })
  gpxData: string | null;

  @Column({ type: 'json', nullable: true })
  waypoints: { lat: number; lng: number; name: string; description?: string }[] | null;

  @OneToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;
}

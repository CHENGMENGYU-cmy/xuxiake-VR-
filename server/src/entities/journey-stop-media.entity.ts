import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { JourneyStop } from './journey-stop.entity.js';

@Entity('journey_stop_media')
export class JourneyStopMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'stop_id', type: 'int' })
  stopId: number;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ name: 'thumbnail_url', type: 'varchar', length: 500, nullable: true })
  thumbnailUrl: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => JourneyStop, (stop) => stop.mediaItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stop_id' })
  stop: JourneyStop;
}

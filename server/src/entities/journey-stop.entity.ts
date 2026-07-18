import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Journey } from './journey.entity.js';

@Entity('journey_stops')
export class JourneyStop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'journey_id', type: 'int' })
  journeyId: number;

  @Column({ name: 'day_number', type: 'int', nullable: true })
  dayNumber: number | null;

  @Column({ name: 'location_name', type: 'varchar', length: 200, nullable: true })
  locationName: string | null;

  @Column({ name: 'location_lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
  locationLat: number | null;

  @Column({ name: 'location_lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
  locationLng: number | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'media_url', type: 'varchar', length: 500, nullable: true })
  mediaUrl: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @ManyToOne(() => Journey, (journey) => journey.stops, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journey_id' })
  journey: Journey;
}

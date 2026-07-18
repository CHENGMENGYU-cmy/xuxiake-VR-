import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { Post } from './post.entity.js';
import { JourneyStop } from './journey-stop.entity.js';

@Entity('journeys')
export class Journey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'post_id', type: 'varchar', length: 36, unique: true })
  postId: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: string | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  destination: string | null;

  @Column({ name: 'cover_url', type: 'varchar', length: 500, nullable: true })
  coverUrl: string | null;

  @Column({ name: 'stop_count', type: 'int', default: 0 })
  stopCount: number;

  @OneToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @OneToMany(() => JourneyStop, (stop) => stop.journey)
  stops: JourneyStop[];
}

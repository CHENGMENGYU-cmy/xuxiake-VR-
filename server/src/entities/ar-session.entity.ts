import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('ar_sessions')
export class ArSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // ── 设备信息 ──
  @Column({ length: 100 })
  deviceModel: string;

  @Column({ length: 50, nullable: true })
  deviceVersion: string;

  // ── 时间范围 ──
  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime', nullable: true })
  endTime: Date;

  // ── GPS 轨迹（JSON数组） ──
  // [{ lat, lng, altitude, accuracy, heading, speed, timestamp }]
  @Column({ type: 'json', nullable: true })
  trajectory: string;

  @Column({ type: 'int', default: 0 })
  trajectoryPointCount: number;

  // ── 传感器数据摘要 ──
  // { sampleRate, totalSamples, maxAccel, avgSpeed, deviceTemp }
  @Column({ type: 'json', nullable: true })
  sensorSummary: string;

  // ── 统计 ──
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalDistanceKm: number;

  @Column({ type: 'int', default: 0 })
  totalDurationMinutes: number;

  @Column({ type: 'int', default: 0 })
  mediaCount: number;

  // ── 关联的帖子（导入后自动生成） ──
  @Column({ nullable: true })
  postId: number;

  // ── 状态 ──
  @Column({ type: 'enum', enum: ['IMPORTING', 'READY', 'ERROR'], default: 'IMPORTING' })
  status: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

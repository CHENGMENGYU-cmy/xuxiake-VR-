import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Post } from './post.entity.js';
import { Comment } from './comment.entity.js';
import { Like } from './like.entity.js';
import { Notification } from './notification.entity.js';
import { Message } from './message.entity.js';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 190, unique: true, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone: string | null;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'display_name', type: 'varchar', length: 100 })
  displayName: string;

  @Column({ name: 'xxk_number', type: 'varchar', length: 11, unique: true })
  xxkNumber: string;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website: string | null;

  @Column({ type: 'enum', enum: ['MALE', 'FEMALE', 'OTHER', 'PRIVATE'], default: 'PRIVATE', nullable: true })
  gender: string | null;

  @Column({ type: 'date', nullable: true })
  birthday: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  region: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  occupation: string | null;

  @Column({ name: 'vr_device_model', type: 'varchar', length: 100, nullable: true })
  vrDeviceModel: string | null;

  @Column({ name: 'vr_device_version', type: 'varchar', length: 50, nullable: true })
  vrDeviceVersion: string | null;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt: Date | null;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Notification, (n) => n.recipient)
  receivedNotifications: Notification[];

  @OneToMany(() => Notification, (n) => n.sender)
  sentNotifications: Notification[];

  @OneToMany(() => Message, (msg) => msg.sender)
  messages: Message[];
}

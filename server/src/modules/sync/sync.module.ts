import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncController } from './sync.controller.js';
import { SyncService } from './sync.service.js';
import { Post } from '../../entities/post.entity.js';
import { MediaItem } from '../../entities/media-item.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, MediaItem]),
    AuthModule,
  ],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}

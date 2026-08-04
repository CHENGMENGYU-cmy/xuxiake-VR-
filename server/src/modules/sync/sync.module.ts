import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { SyncController } from './sync.controller.js';
import { SyncService } from './sync.service.js';
import { Post } from '../../entities/post.entity.js';
import { MediaItem } from '../../entities/media-item.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, MediaItem]),
    JwtModule,
  ],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}

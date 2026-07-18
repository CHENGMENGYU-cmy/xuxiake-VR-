import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller.js';
import { PostsService } from './posts.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { Post } from '../../entities/post.entity.js';
import { MediaItem } from '../../entities/media-item.entity.js';
import { Comment } from '../../entities/comment.entity.js';
import { Like } from '../../entities/like.entity.js';
import { User } from '../../entities/user.entity.js';
import { InterestTag } from '../../entities/interest-tag.entity.js';
import { Topic } from '../../entities/topic.entity.js';
import { RouteDetail } from '../../entities/route-detail.entity.js';
import { Journey } from '../../entities/journey.entity.js';
import { JourneyStop } from '../../entities/journey-stop.entity.js';
import { GuideDetail } from '../../entities/guide-detail.entity.js';
import { Collection } from '../../entities/collection.entity.js';
import { CollectionPost } from '../../entities/collection-post.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, MediaItem, Comment, Like, User, InterestTag, Topic, RouteDetail, Journey, JourneyStop, GuideDetail, Collection, CollectionPost]),
    AuthModule,
    NotificationsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}

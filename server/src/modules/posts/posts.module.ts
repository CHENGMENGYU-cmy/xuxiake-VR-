import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller.js';
import { PostsService } from './posts.service.js';
import { ReviewService } from './review.service.js';
import { AiService } from './ai.service.js';
import { DiaryGeneratorService } from './diary-generator.service.js';
import { AiClientService } from '../../common/ai-client.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { Post } from '../../entities/post.entity.js';
import { MediaItem } from '../../entities/media-item.entity.js';
import { Comment } from '../../entities/comment.entity.js';
import { Like } from '../../entities/like.entity.js';
import { User } from '../../entities/user.entity.js';
import { InterestTag } from '../../entities/interest-tag.entity.js';
import { Topic } from '../../entities/topic.entity.js';
import { Journey } from '../../entities/journey.entity.js';
import { JourneyStop } from '../../entities/journey-stop.entity.js';
import { JourneyStopMedia } from '../../entities/journey-stop-media.entity.js';
import { Collection } from '../../entities/collection.entity.js';
import { CollectionPost } from '../../entities/collection-post.entity.js';
import { UserFollow } from '../../entities/user-follow.entity.js';
import { ContentReview } from '../../entities/content-review.entity.js';
import { Report } from '../../entities/report.entity.js';
import { VideoComment } from '../../entities/video-comment.entity.js';
import { AudioPlaylist } from '../../entities/audio-playlist.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, MediaItem, Comment, Like, User, InterestTag, Topic, Journey, JourneyStop, JourneyStopMedia, Collection, CollectionPost, UserFollow, ContentReview, Report, VideoComment, AudioPlaylist]),
    AuthModule,
    NotificationsModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, ReviewService, AiService, DiaryGeneratorService, AiClientService],
  exports: [PostsService],
})
export class PostsModule {}

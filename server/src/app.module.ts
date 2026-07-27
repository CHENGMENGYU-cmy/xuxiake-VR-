import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module.js';
import { PostsModule } from './modules/posts/posts.module.js';
import { ChatModule } from './modules/chat/chat.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { ConversationsController } from './modules/conversations/conversations.controller.js';
import { FeedController } from './modules/feed/feed.controller.js';
import { UploadController } from './modules/upload/upload.controller.js';
import { UsersController } from './modules/users/users.controller.js';
import { SocialController } from './modules/social/social.controller.js';
import { SocialService } from './modules/social/social.service.js';
import { User } from './entities/user.entity.js';
import { Post } from './entities/post.entity.js';
import { MediaItem } from './entities/media-item.entity.js';
import { Comment } from './entities/comment.entity.js';
import { Like } from './entities/like.entity.js';
import { Conversation } from './entities/conversation.entity.js';
import { Message } from './entities/message.entity.js';
import { ConversationParticipant } from './entities/conversation-participant.entity.js';
import { UserFollow } from './entities/user-follow.entity.js';
import { InterestTag } from './entities/interest-tag.entity.js';
import { UserInterest } from './entities/user-interest.entity.js';
import { Community } from './entities/community.entity.js';
import { CommunityTag } from './entities/community-tag.entity.js';
import { CommunityAnnouncement } from './entities/community-announcement.entity.js';
import { CommunityRole } from './entities/community-role.entity.js';
import { CommunityChallenge } from './entities/community-challenge.entity.js';
import { CommunityChallengeEntry } from './entities/community-challenge-entry.entity.js';
import { MessageReaction } from './entities/message-reaction.entity.js';
import { LocationShare } from './entities/location-share.entity.js';
import { getDatabaseConfig } from './config/database.config.js';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    TypeOrmModule.forFeature([
      User, Post, MediaItem, Comment, Like,
      Conversation, Message,
      ConversationParticipant, UserFollow,
      InterestTag, UserInterest, Community, CommunityTag,
      CommunityAnnouncement, CommunityRole, CommunityChallenge, CommunityChallengeEntry,
      MessageReaction, LocationShare,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_ACCESS_EXPIRATION', '15m') as any },
      }),
    }),
    AuthModule,
    PostsModule,
    ChatModule,
    NotificationsModule,
  ],
  controllers: [
    ConversationsController,
    FeedController,
    UploadController,
    UsersController,
    SocialController,
  ],
  providers: [SocialService],
})
export class AppModule {}

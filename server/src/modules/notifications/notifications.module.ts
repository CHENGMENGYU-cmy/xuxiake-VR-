import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../../entities/notification.entity.js';
import { User } from '../../entities/user.entity.js';
import { Message } from '../../entities/message.entity.js';
import { Conversation } from '../../entities/conversation.entity.js';
import { ConversationParticipant } from '../../entities/conversation-participant.entity.js';
import { NotificationsService } from './notifications.service.js';
import { NotificationsController } from './notifications.controller.js';
import { ChatGateway } from '../chat/chat.gateway.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User, Message, Conversation, ConversationParticipant]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, ChatGateway],
  exports: [NotificationsService],
})
export class NotificationsModule {}

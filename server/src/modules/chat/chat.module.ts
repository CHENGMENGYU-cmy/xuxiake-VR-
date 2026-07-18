import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '../../entities/message.entity.js';
import { Conversation } from '../../entities/conversation.entity.js';
import { ConversationParticipant } from '../../entities/conversation-participant.entity.js';
import { User } from '../../entities/user.entity.js';
import { ChatGateway } from './chat.gateway.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Conversation, ConversationParticipant, User]),
  ],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}

import { Module } from '@nestjs/common';
import { MentionsService } from './mentions.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [UsersModule, NotificationsModule],
  providers: [MentionsService, PrismaService],
  exports: [MentionsService],
})
export class MentionsModule {}

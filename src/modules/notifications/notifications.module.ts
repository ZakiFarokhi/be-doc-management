import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsController } from './notifications.controller';
import { CaslModule } from '../casl/casl.module';

@Module({
  providers: [NotificationsService, PrismaService],
  exports: [NotificationsService],
  controllers: [NotificationsController],
  imports: [CaslModule],
})
export class NotificationsModule {}

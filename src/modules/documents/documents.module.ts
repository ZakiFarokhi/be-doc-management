import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UsersModule } from '../users/users.module';
import { MentionsModule } from '../mentions/mentions.module';
import { VersionsModule } from '../versions/versions.module';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [UsersModule, MentionsModule, VersionsModule, CaslModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, PrismaService],
})
export class DocumentsModule {}

import { Module } from '@nestjs/common';
import { VersionsService } from './versions.service';
import { PrismaService } from '../prisma/prisma.service';
import { VersionsController } from './versions.controller';
import { CaslModule } from '../casl/casl.module';

@Module({
  providers: [VersionsService, PrismaService],
  exports: [VersionsService],
  controllers: [VersionsController],
  imports: [CaslModule],
})
export class VersionsModule {}

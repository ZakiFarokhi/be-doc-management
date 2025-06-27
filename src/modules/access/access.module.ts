import { Module } from '@nestjs/common';
import { AccessService } from './access.service';
import { AccessController } from './access.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CaslModule } from '../casl/casl.module';

@Module({
  controllers: [AccessController],
  providers: [AccessService, PrismaService],
  imports: [CaslModule],
})
export class AccessModule {}

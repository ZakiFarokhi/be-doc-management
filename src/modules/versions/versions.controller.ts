import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { VersionsService } from './versions.service';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('versions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Get('documents/:id/versions')
  findByDocument(@Param('id') id: string) {
    return this.versionsService.findByDocument(id);
  }

  @Get('versions/:id')
  findOne(@Param('id') id: string) {
    return this.versionsService.findOne(id);
  }

  @Get('versions/compare/:idA/:idB')
  compare(@Param('idA') idA: string, @Param('idB') idB: string) {
    return this.versionsService.compareVersions(idA, idB);
  }
}

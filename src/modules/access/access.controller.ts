import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AccessService } from './access.service';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('access')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PoliciesGuard)
@Controller('documents/:id/access')
export class AccessController {
  constructor(private readonly accessService: AccessService) {}

  @Post()
  @CheckPolicies((ability) => ability.can('update', 'Document'))
  addAccess(
    @Param('id') documentId: string,
    @Body() body: { userId: string; permission: 'READ' | 'EDIT' },
  ) {
    return this.accessService.addUserAccess(
      documentId,
      body.userId,
      body.permission,
    );
  }

  @Delete(':userId')
  @CheckPolicies((ability) => ability.can('update', 'Document'))
  removeAccess(
    @Param('id') documentId: string,
    @Param('userId') userId: string,
  ) {
    return this.accessService.removeUserAccess(documentId, userId);
  }

  @Get()
  @CheckPolicies((ability) => ability.can('update', 'Document'))
  getAccessList(@Param('id') documentId: string) {
    return this.accessService.getDocumentAccessList(documentId);
  }
}

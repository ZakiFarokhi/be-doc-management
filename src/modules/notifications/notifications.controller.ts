// src/notifications/notifications.controller.ts
import {
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { NotificationDto } from './dto/notifications.dto';
import { PoliciesGuard } from '../casl/policies.guard';
import { CheckPolicies } from '../casl/check-policies.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PoliciesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOkResponse({ type: NotificationDto, isArray: true })
  @CheckPolicies((ability) => ability.can('read', 'Notification'))
  findUserNotifications(@Request() req) {
    return this.notificationsService.findByUser(req.user.userId);
  }

  @Patch(':id/read')
  @ApiOkResponse({ type: NotificationDto })
  @CheckPolicies((ability) => ability.can('update', 'Notification'))
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}

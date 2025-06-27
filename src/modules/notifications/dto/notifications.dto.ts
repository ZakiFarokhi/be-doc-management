import { ApiProperty } from '@nestjs/swagger';

export class NotificationDto {
  @ApiProperty({ example: 'notif_123' })
  id: string;

  @ApiProperty({ example: 'You were mentioned in a document' })
  message: string;

  @ApiProperty({ example: false })
  isRead: boolean;

  @ApiProperty({ example: '2025-06-27T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: 'user_abc123' })
  userId: string;
}

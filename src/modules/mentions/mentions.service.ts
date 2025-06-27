import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MentionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async handleMentions(content: string, documentId: string, authorId: string) {
    const usernames = this.extractMentions(content);
    const users = await this.prisma.user.findMany({
      where: { username: { in: usernames } },
    });

    for (const user of users) {
      // Auto-share (READ access)
      await this.prisma.access.upsert({
        where: { userId_documentId: { userId: user.id, documentId } },
        create: { userId: user.id, documentId, permission: 'READ' },
        update: {},
      });

      // Create mention record
      await this.prisma.mention.create({
        data: {
          mentionedId: user.id,
          documentId,
          userId: authorId,
        },
      });

      // Send notification
      await this.notificationsService.create({
        userId: user.id,
        message: `You were mentioned in a document`,
      });
    }
  }

  extractMentions(content: string): string[] {
    const matches = content.match(/@([a-zA-Z0-9_]+)/g) || [];
    return [...new Set(matches.map((m) => m.slice(1)))];
  }
}

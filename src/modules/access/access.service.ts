import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  async addUserAccess(
    documentId: string,
    userId: string,
    permission: 'READ' | 'EDIT',
  ) {
    return this.prisma.access.upsert({
      where: {
        userId_documentId: {
          userId,
          documentId,
        },
      },
      update: { permission },
      create: {
        documentId,
        userId,
        permission,
      },
    });
  }

  async removeUserAccess(documentId: string, userId: string) {
    return this.prisma.access.delete({
      where: {
        userId_documentId: {
          userId,
          documentId,
        },
      },
    });
  }

  async getDocumentAccessList(documentId: string) {
    return this.prisma.access.findMany({
      where: { documentId },
      include: { user: true },
    });
  }
}

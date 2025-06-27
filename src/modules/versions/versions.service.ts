import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Diff from 'diff';

@Injectable()
export class VersionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createVersion(documentId: string, content: string, modifiedBy: string) {
    return this.prisma.version.create({
      data: {
        documentId,
        content,
        modifiedBy,
      },
    });
  }

  async findByDocument(documentId: string) {
    return this.prisma.version.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.version.findUnique({ where: { id } });
  }

  async compareVersions(idA: string, idB: string) {
    const [verA, verB] = await Promise.all([
      this.prisma.version.findUnique({ where: { id: idA } }),
      this.prisma.version.findUnique({ where: { id: idB } }),
    ]);

    if (!verA || !verB) throw new NotFoundException('Version(s) not found');

    const diff = Diff.diffLines(verA.content, verB.content);
    return {
      versionA: { id: verA.id, createdAt: verA.createdAt },
      versionB: { id: verB.id, createdAt: verB.createdAt },
      diff,
    };
  }
}

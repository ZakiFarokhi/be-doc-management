import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Visibility } from '@prisma/client';
import { MentionsService } from '../mentions/mentions.service';
import { VersionsService } from '../versions/versions.service';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mentionsService: MentionsService,
    private readonly versionsService: VersionsService,
  ) {}

  async create(userId: string, dto: CreateDocumentDto) {
    const doc = await this.prisma.document.create({
      data: {
        title: dto.title,
        content: dto.content,
        visibility: dto.visibility ?? Visibility.PRIVATE,
        authorId: userId,
      },
    });
    await this.versionsService.createVersion(doc.id, dto.content, userId);
    await this.mentionsService.handleMentions(dto.content, doc.id, userId);
    return doc;
  }

  async findAllAccessible(userId: string) {
    return this.prisma.document.findMany({
      where: {
        OR: [
          { visibility: 'PUBLIC' },
          { authorId: userId },
          { accesses: { some: { userId } } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: { accesses: true },
    });
    if (!doc) throw new NotFoundException('Document not found');

    const canAccess =
      doc.visibility === 'PUBLIC' ||
      doc.authorId === userId ||
      doc.accesses.some((a) => a.userId === userId);

    if (!canAccess) throw new ForbiddenException();
    return doc;
  }

  async update(userId: string, id: string, dto: UpdateDocumentDto) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.authorId !== userId) throw new ForbiddenException();

    const updated = await this.prisma.document.update({
      where: { id },
      data: dto,
    });

    if (dto.content) {
      await this.versionsService.createVersion(doc.id, dto.content, userId);
      await this.mentionsService.handleMentions(dto.content, id, userId);
    }

    return updated;
  }

  async remove(userId: string, id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.authorId !== userId) throw new ForbiddenException();

    return this.prisma.document.delete({ where: { id } });
  }
}

// test/e2e/versions.e2e-spec.ts
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/modules/app/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Versions (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let userId: string;
  let documentId: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    // urutan aman dari FK constraint
    await prisma.notification.deleteMany({});
    await prisma.userDocumentAccess.deleteMany({});
    await prisma.version.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.user.deleteMany({});

    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'version@example.com',
        username: 'versioner',
        password: 'password123',
      });

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'version@example.com', password: 'password123' });

    token = login.body.access_token;
    const user = await prisma.user.findFirst({
      where: { email: 'version@example.com' },
    });
    userId = user.id;

    const doc = await request(app.getHttpServer())
      .post('/documents')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Versioned Doc',
        content: 'Original',
        visibility: 'PRIVATE',
      });

    documentId = doc.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should update document and create a version', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/documents/${documentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Updated version 1' })
      .expect(200);

    expect(res.body.content).toContain('Updated');

    const versions = await prisma.version.findMany({ where: { documentId } });
    expect(versions.length).toBeGreaterThanOrEqual(1);
  });

  it('should list all versions of a document', async () => {
    const res = await request(app.getHttpServer())
      .get(`/versions/${documentId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('content');
  });

  it('should compare two versions', async () => {
    const versions = await prisma.version.findMany({
      where: { documentId },
      orderBy: { createdAt: 'asc' },
    });

    const res = await request(app.getHttpServer())
      .get(`/versions/compare/${versions[0].id}/${versions[1].id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('diff');
    expect(typeof res.body.diff).toBe('string');
  });
});

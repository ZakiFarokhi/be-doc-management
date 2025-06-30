// test/e2e/mentions.e2e-spec.ts
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/modules/app/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Mentions (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authorToken: string;
  let mentionedUser: { id: string; username: string; token: string };
  let docId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.notification.deleteMany({});
    await prisma.access.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.user.deleteMany({});

    // Create mentioned user
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'mentionee@example.com',
      username: 'mentionee',
      password: 'password123',
    });
    const mentioned = await prisma.user.findFirst({
      where: { email: 'mentionee@example.com' },
    });
    mentionedUser = {
      id: mentioned.id,
      username: mentioned.username,
      token: '',
    };

    // Create author
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'author@example.com',
      username: 'authoruser',
      password: 'password123',
    });

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'author@example.com', password: 'password123' });
    authorToken = login.body.access_token;

    // Create document
    const doc = await request(app.getHttpServer())
      .post('/documents')
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ title: 'Mention Test', content: '...', visibility: 'PRIVATE' });

    docId = doc.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should mention user in document and auto share', async () => {
    await request(app.getHttpServer())
      .patch(`/documents/${docId}`)
      .set('Authorization', `Bearer ${authorToken}`)
      .send({ content: 'Hello @mentionee' })
      .expect(200);

    // Check user access created
    const access = await prisma.access.findFirst({
      where: { documentId: docId, userId: mentionedUser.id },
    });

    expect(access).toBeTruthy();
    expect(access.permission).toBe('READ');
  });

  it('should create a notification for mentioned user', async () => {
    const notif = await prisma.notification.findMany({
      where: { userId: mentionedUser.id },
    });

    expect(notif.length).toBeGreaterThan(0);
    expect(notif[0].message).toContain('mentioned');
  });
});

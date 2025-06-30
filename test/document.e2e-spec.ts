// test/e2e/documents.e2e-spec.ts
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/modules/app/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Documents (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let documentId: string;

  const user = {
    email: 'docuser@example.com',
    username: 'docuser',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.user.deleteMany({});
    await prisma.document.deleteMany({});

    await request(app.getHttpServer()).post('/auth/register').send(user);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: user.password });

    token = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a new document', async () => {
    const res = await request(app.getHttpServer())
      .post('/documents')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Doc',
        content: 'Initial content',
        visibility: 'PRIVATE',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Test Doc');
    documentId = res.body.id;
  });

  it('should get all accessible documents', async () => {
    const res = await request(app.getHttpServer())
      .get('/documents')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('should update the document', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/documents/${documentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'Updated content with @mention',
      })
      .expect(200);

    expect(res.body.content).toContain('Updated content');
  });

  it('should get a single document', async () => {
    const res = await request(app.getHttpServer())
      .get(`/documents/${documentId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.id).toBe(documentId);
  });

  it('should delete the document', async () => {
    await request(app.getHttpServer())
      .delete(`/documents/${documentId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});

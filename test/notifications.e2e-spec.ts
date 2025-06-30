// test/e2e/notifications.e2e-spec.ts
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/modules/app/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Notifications (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let userId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.notification.deleteMany({});
    await prisma.user.deleteMany({});

    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'notif@example.com',
      username: 'notifuser',
      password: 'password123',
    });

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'notif@example.com', password: 'password123' });

    token = login.body.access_token;
    userId =
      login.body.user?.id ||
      (await prisma.user.findFirst({ where: { email: 'notif@example.com' } }))
        .id;

    // Buat notifikasi dummy
    await prisma.notification.create({
      data: {
        userId,
        message: 'This is a test notification',
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get notifications for the user', async () => {
    const res = await request(app.getHttpServer())
      .get('/notifications')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should mark a notification as read', async () => {
    const notif = await prisma.notification.findFirst({ where: { userId } });

    const res = await request(app.getHttpServer())
      .patch(`/notifications/${notif.id}/read`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.read).toBe(true);
  });
});

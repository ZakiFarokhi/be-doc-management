// test/e2e/auth.e2e-spec.ts
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app/app.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.user.deleteMany(); // clean test users
  });

  afterAll(async () => {
    await app.close();
  });

  const user = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'password123',
  };

  it('should register a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe(user.email);
  });

  it('should login the user and return JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: user.password })
      .expect(201);

    expect(res.body).toHaveProperty('access_token');
  });

  it('should reject login with wrong password', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: 'wrongpassword' })
      .expect(401);
  });

  it('should block access to protected route without JWT', async () => {
    await request(app.getHttpServer()).get('/users/me').expect(401);
  });
});

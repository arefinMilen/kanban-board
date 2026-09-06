import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as dotenv from 'dotenv';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

dotenv.config();

describe('Kanban Application (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let ownerToken: string;
  let ownerRefreshToken: string;
  let strangerToken: string;

  let createdBoardId: string;
  let createdColumnId: string;
  let task1Id: string;
  let task2Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    // Clean up any old test data
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['e2e_owner@example.com', 'e2e_stranger@example.com'],
        },
      },
    });
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.user.deleteMany({
        where: {
          email: {
            in: ['e2e_owner@example.com', 'e2e_stranger@example.com'],
          },
        },
      });
      await prisma.$disconnect();
    }
    await app.close();
  });

  describe('1. Auth Flow', () => {
    it('POST /auth/register - Register board owner', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'e2e_owner@example.com',
          password: 'Password123!',
          name: 'E2E Owner',
        })
        .expect(201);

      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('e2e_owner@example.com');
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();

      ownerToken = res.body.accessToken;
      ownerRefreshToken = res.body.refreshToken;
    });

    it('POST /auth/login - Login board owner', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'e2e_owner@example.com',
          password: 'Password123!',
        })
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      ownerToken = res.body.accessToken;
      ownerRefreshToken = res.body.refreshToken;
    });

    it('POST /auth/refresh - Refresh token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: ownerRefreshToken,
        })
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      ownerToken = res.body.accessToken;
    });

    it('POST /auth/register - Register stranger user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'e2e_stranger@example.com',
          password: 'Password123!',
          name: 'E2E Stranger',
        })
        .expect(201);

      strangerToken = res.body.accessToken;
    });
  });

  describe('2. Board Creation & Role Assignment', () => {
    it('POST /boards - Create board and assign OWNER role', async () => {
      const res = await request(app.getHttpServer())
        .post('/boards')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'E2E Test Board',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe('E2E Test Board');
      expect(res.body.members).toBeDefined();

      const ownerMember = res.body.members.find(
        (m: any) => m.user.email === 'e2e_owner@example.com',
      );
      expect(ownerMember).toBeDefined();
      expect(ownerMember.role).toBe('OWNER');

      createdBoardId = res.body.id;
    });
  });

  describe('3. Security & Access Control', () => {
    it('GET /boards/:id - Stranger gets 404 Not Found for private board', async () => {
      const res = await request(app.getHttpServer())
        .get(`/boards/${createdBoardId}`)
        .set('Authorization', `Bearer ${strangerToken}`)
        .expect(404);

      expect(res.body.message).toContain('Board not found');
    });
  });

  describe('4. Columns, Tasks & Movement (Fractional Indexing)', () => {
    it('POST /boards/:boardId/columns - Create column', async () => {
      const res = await request(app.getHttpServer())
        .post(`/boards/${createdBoardId}/columns`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'To Do',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe('To Do');
      createdColumnId = res.body.id;
    });

    it('POST /columns/:columnId/tasks - Create Task 1 & Task 2', async () => {
      const res1 = await request(app.getHttpServer())
        .post(`/columns/${createdColumnId}/tasks`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Task 1',
          order: 1000,
        })
        .expect(201);

      task1Id = res1.body.id;
      expect(res1.body.order).toBe(1000);

      const res2 = await request(app.getHttpServer())
        .post(`/columns/${createdColumnId}/tasks`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Task 2',
          order: 2000,
        })
        .expect(201);

      task2Id = res2.body.id;
      expect(res2.body.order).toBe(2000);
    });

    it('PATCH /tasks/:id/move - Move Task 2 before Task 1 (Fractional midpoint calculation)', async () => {
      // Move Task 2 before Task 1 at index 0
      // Task 1 order is 1000. Expected midpoint: 1000 / 2 = 500
      const res = await request(app.getHttpServer())
        .patch(`/tasks/${task2Id}/move`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          targetColumnId: createdColumnId,
          targetIndex: 0,
        })
        .expect(200);

      expect(res.body.id).toBe(task2Id);
      expect(res.body.order).toBe(500);
    });
  });
});


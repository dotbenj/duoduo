import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';

describe('Duoduo API (e2e)', () => {
  let app: INestApplication;
  let mongo: MongoMemoryServer;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongo.getUri();
    process.env.MONGO_DB_NAME = 'duoduo_test';

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();

    const config = new DocumentBuilder()
      .setTitle('Duoduo API')
      .setDescription('Duoduo HTTP API')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongo.stop();
  });

  it('GET /health (green)', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('GET /docs (green)', async () => {
    const res = await request(app.getHttpServer()).get('/docs').expect(200);
    expect(res.text).toContain('Swagger UI');
  });

  it('GET /missing (red)', async () => {
    const res = await request(app.getHttpServer()).get('/missing').expect(404);
    expect(res.body).toMatchObject({
      statusCode: 404,
      error: 'Not Found'
    });
  });

  describe('/user', () => {
    const createUser = async (email: string, password: string) => {
      const res = await request(app.getHttpServer())
        .post('/user')
        .send({ email, password })
        .expect(201);
      return res.body as { _id: string; email: string; password: string; salt: string };
    };

    it('POST /user (green)', async () => {
      const user = await createUser('benjamin.roullet@gmail.com', 'password');
      expect(user).toMatchObject({ email: 'benjamin.roullet@gmail.com' });
      expect(user._id).toEqual(expect.any(String));
      expect(user.salt).toEqual(expect.any(String));
      expect(user.password).toEqual(expect.any(String));
      expect(user.password).not.toBe('password');
    });

    it('POST /user (red)', async () => {
      await request(app.getHttpServer()).post('/user').send({}).expect(400);
    });

    it('GET /user (green)', async () => {
      await createUser('a@b.com', 'password');
      await createUser('b@c.com', 'password');

      const res = await request(app.getHttpServer()).get('/user?limit=2').expect(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty('_id');
    });

    it('GET /user (red)', async () => {
      await request(app.getHttpServer()).get('/user?limit=0').expect(400);
    });

    it('GET /user/{userId} (green)', async () => {
      const created = await createUser('get@b.com', 'password');
      const res = await request(app.getHttpServer())
        .get(`/user/${created._id}`)
        .expect(200);
      expect(res.body).toMatchObject({ _id: created._id, email: 'get@b.com' });
    });

    it('GET /user/{userId} (red)', async () => {
      await request(app.getHttpServer()).get('/user/not-an-objectid').expect(400);
    });

    it('UPDATE /user/{userId} (green)', async () => {
      const created = await createUser('update@b.com', 'password');
      const res = await request(app.getHttpServer())
        .put(`/user/${created._id}`)
        .send({ email: 'updated@b.com', password: 'new-password' })
        .expect(200);
      expect(res.body).toMatchObject({ _id: created._id, email: 'updated@b.com' });
      expect(res.body.password).not.toBe(created.password);
      expect(res.body.salt).not.toBe(created.salt);
    });

    it('UPDATE /user/{userId} (red)', async () => {
      const created = await createUser('red-update@b.com', 'password');
      await request(app.getHttpServer()).put(`/user/${created._id}`).send({}).expect(400);
    });

    it('DELETE /user/{userId} (green)', async () => {
      const created = await createUser('delete@b.com', 'password');
      await request(app.getHttpServer()).delete(`/user/${created._id}`).expect(204);
      await request(app.getHttpServer()).get(`/user/${created._id}`).expect(404);
    });

    it('DELETE /user/{userId} (red)', async () => {
      await request(app.getHttpServer()).delete('/user/not-an-objectid').expect(400);
    });
  });
});

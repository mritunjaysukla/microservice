import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ZipController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/zip (POST) - should require fileUrls', () => {
    return request(app.getHttpServer())
      .post('/zip')
      .send({})
      .expect(400);
  });

  it('/zip/status/:jobId (GET) - should return job status', () => {
    return request(app.getHttpServer())
      .get('/zip/status/test-job-id')
      .expect(200);
  });
});

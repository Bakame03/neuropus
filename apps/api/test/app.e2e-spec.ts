import 'dotenv/config';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

// Exige une vraie base PostgreSQL (DATABASE_URL).
describe('GET /api/health (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('répond ok avec la base joignable', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ api: 'ok', base: 'ok' });
  });
});

const request = require('supertest');
const express = require('express');

jest.mock('@vercel/postgres', () => require('../_mocks/vercelPostgres'));
jest.mock('pg', () => require('../_mocks/pg'));

const pgMock = require('../_mocks/vercelPostgres');
const galleryRouter = require('../../src/routes/gallery');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/gallery', galleryRouter);
  return app;
}

describe('GET /api/gallery', () => {
  let app;

  beforeEach(() => {
    pgMock.__reset();
    app = buildApp();
  });

  it('returns photos on success', async () => {
    pgMock.__setRows([{ id: 1, filename: 'a.jpg', photo_url: 'u1', caption: 'c1', order: 1 }]);
    const res = await request(app).get('/api/gallery');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.photos).toHaveLength(1);
  });

  it('returns an empty array when the gallery is empty', async () => {
    pgMock.__setRows([]);
    const res = await request(app).get('/api/gallery');
    expect(res.status).toBe(200);
    expect(res.body.photos).toEqual([]);
  });

  it('returns 500 on DB error', async () => {
    pgMock.__setError(new Error('db down'));
    const res = await request(app).get('/api/gallery');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/failed/i);
  });
});

const request = require('supertest');
const express = require('express');

jest.mock('@vercel/postgres', () => require('../_mocks/vercelPostgres'));
jest.mock('@vercel/blob', () => require('../_mocks/vercelBlob'));
jest.mock('pg', () => require('../_mocks/pg'));
jest.mock('multer', () => require('../_mocks/multer'));

// Neutralize rate limiting so tests can fire repeated requests.
jest.mock('../../src/config/rateLimits', () => ({
  adminLoginLimiter: (_req, _res, next) => next(),
  memorySubmissionLimiter: (_req, _res, next) => next()
}));

const pgMock = require('../_mocks/vercelPostgres');
const blobMock = require('../_mocks/vercelBlob');
const multerMock = require('../_mocks/multer');
const memoriesRouter = require('../../src/routes/memories');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/memories', memoriesRouter);
  return app;
}

describe('GET /api/memories', () => {
  let app;

  beforeEach(() => {
    pgMock.__reset();
    blobMock.__reset();
    multerMock.__reset();
    app = buildApp();
  });

  it('returns memories on success', async () => {
    pgMock.__setRows([{ id: 1, from: 'Luka', message: 'hi', photo: null, timestamp: 't' }]);
    const res = await request(app).get('/api/memories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.memories).toHaveLength(1);
  });

  it('returns 500 on DB error', async () => {
    pgMock.__setError(new Error('db down'));
    const res = await request(app).get('/api/memories');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/memories', () => {
  let app;

  beforeEach(() => {
    pgMock.__reset();
    blobMock.__reset();
    multerMock.__reset();
    app = buildApp();
  });

  it('creates a memory without a photo', async () => {
    pgMock.__setRows([{ id: 1, from: 'Luka', message: 'hi', photo: null, timestamp: 't' }]);
    const res = await request(app).post('/api/memories').send({ from: 'Luka', message: 'hi' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.memory.id).toBe(1);
  });

  it('creates a memory with a photo (uploads to blob storage)', async () => {
    multerMock.__setNextFile({
      fieldname: 'photo',
      originalname: 'pic.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('img'),
      size: 3
    });
    blobMock.put.mockResolvedValueOnce({
      url: 'https://blob.example.com/memories/1-pic.jpg'
    });
    pgMock.__setRows([
      {
        id: 2,
        from: 'Luka',
        message: 'with photo',
        photo: 'https://blob.example.com/memories/1-pic.jpg',
        timestamp: 't'
      }
    ]);
    const res = await request(app)
      .post('/api/memories')
      .send({ from: 'Luka', message: 'with photo' });
    expect(res.status).toBe(201);
    expect(res.body.memory.photo).toMatch(/blob\.example\.com/);
    expect(blobMock.put).toHaveBeenCalledTimes(1);
  });

  it('returns 400 when validation fails', async () => {
    const res = await request(app).post('/api/memories').send({ from: '', message: '' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('returns 400 when only from is provided', async () => {
    const res = await request(app).post('/api/memories').send({ from: 'Luka' });
    expect(res.status).toBe(400);
  });

  it('returns 500 when the DB save fails', async () => {
    pgMock.__setError(new Error('insert failed'));
    const res = await request(app).post('/api/memories').send({ from: 'Luka', message: 'hi' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('returns 500 when blob upload fails', async () => {
    multerMock.__setNextFile({
      fieldname: 'photo',
      originalname: 'pic.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('img'),
      size: 3
    });
    blobMock.put.mockRejectedValueOnce(new Error('blob 500'));
    const res = await request(app)
      .post('/api/memories')
      .send({ from: 'Luka', message: 'with photo' });
    expect(res.status).toBe(500);
  });

  it('trims whitespace from from/message before saving', async () => {
    pgMock.__setRows([{ id: 3, from: 'Luka', message: 'hi', photo: null, timestamp: 't' }]);
    const res = await request(app)
      .post('/api/memories')
      .send({ from: '  Luka  ', message: '  hi  ' });
    expect(res.status).toBe(201);
  });
});

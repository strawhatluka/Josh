const request = require('supertest');
const express = require('express');
const session = require('express-session');

jest.mock('@vercel/postgres', () => require('../_mocks/vercelPostgres'));
jest.mock('@vercel/blob', () => require('../_mocks/vercelBlob'));
jest.mock('pg', () => require('../_mocks/pg'));
jest.mock('multer', () => require('../_mocks/multer'));

// Neutralize the rate limiter so we can fire repeated requests within the test.
jest.mock('../../src/config/rateLimits', () => ({
  adminLoginLimiter: (_req, _res, next) => next(),
  memorySubmissionLimiter: (_req, _res, next) => next()
}));

const pgMock = require('../_mocks/vercelPostgres');
const blobMock = require('../_mocks/vercelBlob');
const multerMock = require('multer');
const adminRouter = require('../../src/routes/admin');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(
    session({
      secret: 'test',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }
    })
  );
  app.use('/api/admin', adminRouter);
  return app;
}

async function loginAgent(app) {
  const agent = request.agent(app);
  await agent
    .post('/api/admin/login')
    .send({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD });
  return agent;
}

beforeEach(() => {
  pgMock.__reset();
  blobMock.__reset();
  multerMock.__reset();
});

describe('POST /api/admin/login', () => {
  it('returns 400 when username or password is missing', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/admin/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 for wrong username', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/api/admin/login')
      .send({ username: 'nobody', password: 'x' });
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it('returns 401 for wrong password', async () => {
    const app = buildApp();
    const res = await request(app)
      .post('/api/admin/login')
      .send({ username: process.env.ADMIN_USERNAME, password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('logs in successfully with correct credentials and sets a cookie', async () => {
    const app = buildApp();
    const res = await request(app).post('/api/admin/login').send({
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined();
  });
});

describe('GET /api/admin/status', () => {
  it('reports unauthenticated for a fresh client', async () => {
    const app = buildApp();
    const res = await request(app).get('/api/admin/status');
    expect(res.status).toBe(200);
    expect(res.body.isAuthenticated).toBe(false);
  });

  it('reports authenticated after a successful login', async () => {
    const app = buildApp();
    const agent = await loginAgent(app);
    const res = await agent.get('/api/admin/status');
    expect(res.body.isAuthenticated).toBe(true);
  });
});

describe('POST /api/admin/logout', () => {
  it('clears the session and reports authenticated=false afterward', async () => {
    const app = buildApp();
    const agent = await loginAgent(app);
    const logout = await agent.post('/api/admin/logout');
    expect(logout.status).toBe(200);
    expect(logout.body.success).toBe(true);
    const status = await agent.get('/api/admin/status');
    expect(status.body.isAuthenticated).toBe(false);
  });
});

describe('Admin gallery endpoints (require auth)', () => {
  it('GET /api/admin/gallery — 401 when not authenticated', async () => {
    const app = buildApp();
    const res = await request(app).get('/api/admin/gallery');
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/gallery — returns photos when authenticated', async () => {
    const app = buildApp();
    const agent = await loginAgent(app);
    pgMock.__setRows([{ id: 1, filename: 'a.jpg', photo_url: 'u', caption: 'c', order: 1 }]);
    const res = await agent.get('/api/admin/gallery');
    expect(res.status).toBe(200);
    expect(res.body.photos).toHaveLength(1);
  });

  it('GET /api/admin/gallery — 500 on DB error', async () => {
    const app = buildApp();
    const agent = await loginAgent(app);
    pgMock.__setError(new Error('db down'));
    const res = await agent.get('/api/admin/gallery');
    expect(res.status).toBe(500);
  });

  it('POST /api/admin/gallery — 400 when no file uploaded', async () => {
    const app = buildApp();
    const agent = await loginAgent(app);
    // multer mock produces no req.file by default
    const res = await agent.post('/api/admin/gallery').field('caption', 'test');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no photo/i);
  });

  it('POST /api/admin/gallery — uploads + adds photo on success', async () => {
    const app = buildApp();
    const agent = await loginAgent(app);
    multerMock.__setNextFile({
      fieldname: 'photo',
      originalname: 'a.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('img'),
      size: 3
    });
    blobMock.put.mockResolvedValueOnce({ url: 'https://blob.example.com/gallery/1-a.jpg' });
    // First query: SELECT MAX(display_order). Second query: INSERT returning.
    pgMock.__setRows([{ max_order: 0 }]);
    pgMock.__setRows([
      {
        id: 1,
        filename: 'a.jpg',
        photo_url: 'https://blob.example.com/gallery/1-a.jpg',
        caption: 'test',
        order: 1
      }
    ]);
    const res = await agent.post('/api/admin/gallery').field('caption', 'test');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.photo.id).toBe(1);
  });

  it('POST /api/admin/gallery — 500 on blob upload failure', async () => {
    const app = buildApp();
    const agent = await loginAgent(app);
    multerMock.__setNextFile({
      fieldname: 'photo',
      originalname: 'a.jpg',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('img'),
      size: 3
    });
    blobMock.put.mockRejectedValueOnce(new Error('blob 500'));
    const res = await agent.post('/api/admin/gallery').field('caption', 'test');
    expect(res.status).toBe(500);
  });

  it('PUT /api/admin/gallery/:id — updates a caption', async () => {
    const app = buildApp();
    const agent = await loginAgent(app);
    pgMock.__setRows([
      { id: 1, filename: 'a.jpg', photo_url: 'u', caption: 'new', order: 1 }
    ]);
    const res = await agent
      .put('/api/admin/gallery/1')
      .send({ caption: 'new' });
    expect(res.status).toBe(200);
    expect(res.body.photo.caption).toBe('new');
  });

  it('PUT /api/admin/gallery/:id — 500 when photo not found', async () => {
    const app = buildApp();
    const agent = await loginAgent(app);
    pgMock.__setRows([]);
    const res = await agent.put('/api/admin/gallery/999').send({ caption: 'x' });
    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/not found/i);
  });

  it('DELETE /api/admin/gallery/:id — deletes photo and blob', async () => {
    const app = buildApp();
    const agent = await loginAgent(app);
    pgMock.__setRows([
      { id: 1, filename: 'a.jpg', photo_url: 'https://blob/a.jpg', caption: '', order: 1 }
    ]);
    blobMock.del.mockResolvedValueOnce(undefined);
    const res = await agent.delete('/api/admin/gallery/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /api/admin/gallery/:id — 500 when photo not found', async () => {
    const app = buildApp();
    const agent = await loginAgent(app);
    pgMock.__setRows([]);
    const res = await agent.delete('/api/admin/gallery/999');
    expect(res.status).toBe(500);
  });

  it('PATCH /api/admin/gallery/reorder — 400 when photoOrders is not an array', async () => {
    const app = buildApp();
    const agent = await loginAgent(app);
    const res = await agent.patch('/api/admin/gallery/reorder').send({ photoOrders: 'nope' });
    expect(res.status).toBe(400);
  });

  it('PATCH /api/admin/gallery/reorder — succeeds with a valid array', async () => {
    const app = buildApp();
    const agent = await loginAgent(app);
    pgMock.__setRows([]);
    pgMock.__setRows([]);
    const res = await agent
      .patch('/api/admin/gallery/reorder')
      .send({ photoOrders: [{ id: 1, order: 2 }, { id: 2, order: 1 }] });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('PATCH /api/admin/gallery/reorder — 500 when any update fails', async () => {
    const app = buildApp();
    const agent = await loginAgent(app);
    pgMock.__setError(new Error('update failed'));
    const res = await agent
      .patch('/api/admin/gallery/reorder')
      .send({ photoOrders: [{ id: 1, order: 2 }] });
    expect(res.status).toBe(500);
  });
});

describe('Admin memories endpoints (require auth)', () => {
  it('GET /api/admin/memories — 401 when unauthenticated', async () => {
    const app = buildApp();
    const res = await request(app).get('/api/admin/memories');
    expect(res.status).toBe(401);
  });

  it('GET /api/admin/memories — returns memories when authenticated', async () => {
    const app = buildApp();
    const agent = await loginAgent(app);
    pgMock.__setRows([{ id: 1, from: 'Luka', message: 'hi', photo: null, timestamp: 't' }]);
    const res = await agent.get('/api/admin/memories');
    expect(res.status).toBe(200);
    expect(res.body.memories).toHaveLength(1);
  });

  it('GET /api/admin/memories — 500 on DB error', async () => {
    const app = buildApp();
    const agent = await loginAgent(app);
    pgMock.__setError(new Error('db down'));
    const res = await agent.get('/api/admin/memories');
    expect(res.status).toBe(500);
  });

  it('PUT /api/admin/memories/:id — updates a memory', async () => {
    const app = buildApp();
    const agent = await loginAgent(app);
    pgMock.__setRows([
      { id: 1, from: 'Luka', message: 'edited', photo: null, timestamp: 't' }
    ]);
    const res = await agent
      .put('/api/admin/memories/1')
      .send({ from: 'Luka', message: 'edited' });
    expect(res.status).toBe(200);
    expect(res.body.memory.message).toBe('edited');
  });

  it('PUT /api/admin/memories/:id — 500 when memory not found', async () => {
    const app = buildApp();
    const agent = await loginAgent(app);
    pgMock.__setRows([]);
    const res = await agent
      .put('/api/admin/memories/999')
      .send({ from: 'x', message: 'y' });
    expect(res.status).toBe(500);
  });

  it('DELETE /api/admin/memories/:id — deletes a memory and its blob', async () => {
    const app = buildApp();
    const agent = await loginAgent(app);
    pgMock.__setRows([
      { id: 1, from: 'Luka', message: 'bye', photo: 'https://blob/x.jpg', timestamp: 't' }
    ]);
    blobMock.del.mockResolvedValueOnce(undefined);
    const res = await agent.delete('/api/admin/memories/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DELETE /api/admin/memories/:id — works without a photo', async () => {
    const app = buildApp();
    const agent = await loginAgent(app);
    pgMock.__setRows([
      { id: 2, from: 'Luka', message: 'bye', photo: null, timestamp: 't' }
    ]);
    const res = await agent.delete('/api/admin/memories/2');
    expect(res.status).toBe(200);
  });

  it('DELETE /api/admin/memories/:id — 500 when not found', async () => {
    const app = buildApp();
    const agent = await loginAgent(app);
    pgMock.__setRows([]);
    const res = await agent.delete('/api/admin/memories/999');
    expect(res.status).toBe(500);
  });
});

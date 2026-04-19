const request = require('supertest');

jest.mock('@vercel/postgres', () => require('./_mocks/vercelPostgres'));
jest.mock('@vercel/blob', () => require('./_mocks/vercelBlob'));
jest.mock('pg', () => require('./_mocks/pg'));
jest.mock('connect-pg-simple', () => require('./_mocks/connectPgSimple'));
jest.mock('multer', () => require('./_mocks/multer'));

const createApp = require('../src/app');

describe('app.js (smoke)', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  it('exports a factory function', () => {
    expect(typeof createApp).toBe('function');
  });

  it('creates an Express app with a router', () => {
    expect(typeof app).toBe('function');
    expect(typeof app.use).toBe('function');
    expect(typeof app.listen).toBe('function');
  });

  it('serves GET / with the public index.html', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });

  it('serves GET /through-years', async () => {
    const res = await request(app).get('/through-years');
    expect(res.status).toBe(200);
  });

  it('serves GET /memories (HTML page, not the API)', async () => {
    const res = await request(app).get('/memories');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });

  it('serves GET /flowers', async () => {
    const res = await request(app).get('/flowers');
    expect(res.status).toBe(200);
  });

  it('serves GET /admin', async () => {
    const res = await request(app).get('/admin');
    expect(res.status).toBe(200);
  });

  it('returns JSON from GET /api/admin/status when unauthenticated', async () => {
    const res = await request(app).get('/api/admin/status');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ isAuthenticated: false });
  });

  it('applies the security-headers middleware (Helmet)', async () => {
    const res = await request(app).get('/api/admin/status');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  it('404s unknown paths', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
  });
});

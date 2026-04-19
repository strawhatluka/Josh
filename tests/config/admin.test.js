const bcrypt = require('bcryptjs');

describe('config/admin', () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    jest.resetModules();
  });

  it('exports ADMIN_USERNAME, ADMIN_PASSWORD_HASH, SESSION_SECRET', () => {
    jest.resetModules();
    const config = require('../../src/config/admin');
    expect(config).toHaveProperty('ADMIN_USERNAME');
    expect(config).toHaveProperty('ADMIN_PASSWORD_HASH');
    expect(config).toHaveProperty('SESSION_SECRET');
  });

  it('uses ADMIN_USERNAME from env when provided', () => {
    jest.resetModules();
    process.env.ADMIN_USERNAME = 'alice';
    process.env.ADMIN_PASSWORD = 'hunter2';
    const { ADMIN_USERNAME } = require('../../src/config/admin');
    expect(ADMIN_USERNAME).toBe('alice');
  });

  it('falls back to "admin" when ADMIN_USERNAME is not set', () => {
    jest.resetModules();
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
    const { ADMIN_USERNAME } = require('../../src/config/admin');
    expect(ADMIN_USERNAME).toBe('admin');
  });

  it('hashes ADMIN_PASSWORD from env with bcrypt and makes it verifiable', () => {
    jest.resetModules();
    process.env.ADMIN_PASSWORD = 'hunter2';
    process.env.ADMIN_USERNAME = 'alice';
    const { ADMIN_PASSWORD_HASH } = require('../../src/config/admin');
    expect(ADMIN_PASSWORD_HASH).toMatch(/^\$2[aby]\$/);
    expect(bcrypt.compareSync('hunter2', ADMIN_PASSWORD_HASH)).toBe(true);
    expect(bcrypt.compareSync('wrong', ADMIN_PASSWORD_HASH)).toBe(false);
  });

  it('hashes the default password when no ADMIN_PASSWORD env var', () => {
    jest.resetModules();
    delete process.env.ADMIN_PASSWORD;
    const { ADMIN_PASSWORD_HASH } = require('../../src/config/admin');
    expect(bcrypt.compareSync('changeme123', ADMIN_PASSWORD_HASH)).toBe(true);
  });

  it('uses SESSION_SECRET from env when provided', () => {
    jest.resetModules();
    process.env.SESSION_SECRET = 'my-secret';
    const { SESSION_SECRET } = require('../../src/config/admin');
    expect(SESSION_SECRET).toBe('my-secret');
  });

  it('falls back to a default SESSION_SECRET when env var is not set', () => {
    jest.resetModules();
    delete process.env.SESSION_SECRET;
    const { SESSION_SECRET } = require('../../src/config/admin');
    expect(typeof SESSION_SECRET).toBe('string');
    expect(SESSION_SECRET.length).toBeGreaterThan(0);
  });

  it('uses 4 bcrypt rounds under NODE_ENV=test (fast test mode)', () => {
    jest.resetModules();
    process.env.NODE_ENV = 'test';
    process.env.ADMIN_PASSWORD = 'pw';
    const { ADMIN_PASSWORD_HASH } = require('../../src/config/admin');
    // bcrypt hash format: $2a$<cost>$...; cost is the 4th and 5th chars of the substring after $2a$
    expect(ADMIN_PASSWORD_HASH).toMatch(/^\$2[aby]\$04\$/);
  });
});

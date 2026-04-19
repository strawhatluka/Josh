jest.mock('@vercel/postgres', () => require('../_mocks/vercelPostgres'));
jest.mock('pg', () => require('../_mocks/pg'));

const pgMock = require('../_mocks/vercelPostgres');

describe('db/index', () => {
  beforeEach(() => {
    pgMock.__reset();
    jest.resetModules();
  });

  it('exports sql, pool, and initializeDatabase', () => {
    const db = require('../../src/db');
    expect(db).toHaveProperty('sql');
    expect(db).toHaveProperty('pool');
    expect(db).toHaveProperty('initializeDatabase');
    expect(typeof db.initializeDatabase).toBe('function');
  });

  it('constructs the pool with POSTGRES_URL from env', () => {
    const db = require('../../src/db');
    expect(db.pool).toBeDefined();
    expect(db.pool.config).toEqual(
      expect.objectContaining({ connectionString: process.env.POSTGRES_URL })
    );
  });

  it('initializeDatabase runs four DDL statements (2 tables + 2 indexes)', async () => {
    pgMock.__setRows([]);
    pgMock.__setRows([]);
    pgMock.__setRows([]);
    pgMock.__setRows([]);
    const { initializeDatabase } = require('../../src/db');
    await initializeDatabase();
    expect(pgMock.sqlMock).toHaveBeenCalledTimes(4);
  });

  it('initializeDatabase propagates DB errors', async () => {
    pgMock.__setError(new Error('permission denied'));
    const { initializeDatabase } = require('../../src/db');
    await expect(initializeDatabase()).rejects.toThrow('permission denied');
  });
});

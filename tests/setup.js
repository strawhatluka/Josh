/**
 * Jest setup file. Runs before every test suite.
 *
 * - Forces NODE_ENV=test (enables 4-round bcrypt in src/config/admin.js).
 * - Provides a minimal POSTGRES_URL so src/db/index.js can construct its Pool
 *   without throwing (the pg mock ignores the connection string anyway).
 * - Supplies a deterministic SESSION_SECRET + admin credentials so config loads
 *   without printing the noisy "default admin credentials" warning.
 */
process.env.NODE_ENV = 'test';
process.env.POSTGRES_URL = process.env.POSTGRES_URL || 'postgres://test:test@localhost:5432/test';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-session-secret';
process.env.ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'testadmin';
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'testpass123';

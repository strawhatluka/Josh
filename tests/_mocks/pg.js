/**
 * Mock for `pg` (node-postgres). Only exports the Pool symbol used by src/db/index.js.
 */
class MockPool {
  constructor(_config) {
    this.config = _config;
  }

  query() {
    return Promise.resolve({ rows: [] });
  }

  end() {
    return Promise.resolve();
  }
}

module.exports = { Pool: MockPool };

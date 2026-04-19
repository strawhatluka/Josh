/**
 * Mock for connect-pg-simple.
 *
 * Returns a constructor that produces a no-op session store compatible with
 * express-session. Sessions live in memory inside each Store instance for the
 * duration of a single test run — enough for supertest flows to carry cookies
 * across requests without touching Postgres.
 */
const { EventEmitter } = require('events');

module.exports = function connectPgSimpleFactory(_session) {
  class MemoryPgStore extends EventEmitter {
    constructor(_opts) {
      super();
      this.sessions = new Map();
    }

    get(sid, cb) {
      process.nextTick(() => cb(null, this.sessions.get(sid) || null));
    }

    set(sid, session, cb) {
      this.sessions.set(sid, session);
      process.nextTick(() => cb && cb(null));
    }

    destroy(sid, cb) {
      this.sessions.delete(sid);
      process.nextTick(() => cb && cb(null));
    }

    touch(sid, session, cb) {
      if (this.sessions.has(sid)) {
        this.sessions.set(sid, session);
      }
      process.nextTick(() => cb && cb(null));
    }
  }

  return MemoryPgStore;
};

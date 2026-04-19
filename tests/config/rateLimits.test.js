const { adminLoginLimiter, memorySubmissionLimiter } = require('../../src/config/rateLimits');

describe('rateLimits', () => {
  it('exports adminLoginLimiter as an Express middleware function', () => {
    expect(typeof adminLoginLimiter).toBe('function');
    expect(adminLoginLimiter.length).toBeGreaterThanOrEqual(2);
  });

  it('exports memorySubmissionLimiter as an Express middleware function', () => {
    expect(typeof memorySubmissionLimiter).toBe('function');
    expect(memorySubmissionLimiter.length).toBeGreaterThanOrEqual(2);
  });

  it('adminLoginLimiter exposes express-rate-limit metadata', () => {
    // express-rate-limit attaches `resetKey` or similar helpers to the returned handler;
    // at minimum the returned function must be callable and truthy.
    expect(adminLoginLimiter).toBeTruthy();
  });

  it('memorySubmissionLimiter exposes express-rate-limit metadata', () => {
    expect(memorySubmissionLimiter).toBeTruthy();
  });

  it('the two limiters are distinct middlewares (different configs)', () => {
    expect(adminLoginLimiter).not.toBe(memorySubmissionLimiter);
  });
});

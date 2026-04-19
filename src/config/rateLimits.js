const rateLimit = require('express-rate-limit').default;

/**
 * Rate limiter for admin login endpoint
 * Prevents brute force attacks by limiting login attempts
 * 5 attempts per 15 minutes per IP address
 *
 * Note: Currently uses in-memory store. For production with multiple serverless
 * instances, consider upgrading to a distributed store like Redis or PostgreSQL.
 */
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests, not just failed ones
  skipFailedRequests: false
});

/**
 * Rate limiter for public memory submission endpoint
 * Prevents spam and DoS attacks
 * 5 submissions per minute per IP address
 *
 * Note: Currently uses in-memory store. For production with multiple serverless
 * instances, consider upgrading to a distributed store like Redis or PostgreSQL.
 */
const memorySubmissionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many submissions from this IP, please try again after a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

module.exports = {
  adminLoginLimiter,
  memorySubmissionLimiter
};

const rateLimit = require('express-rate-limit');

const isProd = process.env.NODE_ENV === 'production';

// Helper to construct a standard rate-limit handler
const createLimitHandler = (message) => {
  return (req, res) => {
    res.status(429).json({
      success: false,
      statusCode: 429,
      error: {
        message: message || 'Too many requests. Please slow down and try again later.',
        retryAfter: res.getHeader('Retry-After') || '15 minutes'
      }
    });
  };
};

// 1. Strict Auth Limiter (Protects against brute-force password guessing and bot registrations)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 10 : 100, // 10 attempts in production, 100 in dev/testing
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false,
  handler: createLimitHandler('Too many authentication attempts. Please try again after 15 minutes to protect account security.'),
  skipSuccessfulRequests: false,
});

// 2. Upload Limiter (Prevents storage flooding and server buffer overload)
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 15 : 150, // 15 uploads per 15 min in prod, 150 in dev
  standardHeaders: true,
  legacyHeaders: false,
  handler: createLimitHandler('Upload threshold reached. Please wait a few minutes before uploading additional documents.'),
});

// 3. Report & Rating Spam Limiter (Prevents harassment and review spam)
const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 20 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createLimitHandler('Too many feedback or report submissions. Please wait before submitting more.'),
});

// 4. General Global API Limiter (Protects general endpoints from aggressive bots/scrapers)
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 400 : 2000, // 400 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: createLimitHandler('Too many requests from this IP. Please wait a few minutes.'),
  skip: (req) => req.path.startsWith('/uploads/') || req.path === '/api/health',
});

module.exports = {
  authLimiter,
  uploadLimiter,
  reportLimiter,
  generalApiLimiter
};

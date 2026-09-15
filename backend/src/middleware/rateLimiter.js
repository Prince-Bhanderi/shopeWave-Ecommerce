import rateLimit from 'express-rate-limit';

const jsonRateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please try again later.',
    errors: [],
  });
};

// Generous limiter for the whole API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonRateLimitHandler,
});

// Tighter limiter for auth endpoints to slow down brute force / credential
// stuffing attempts against login, register, and password reset.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts. Please try again in a few minutes.',
  handler: jsonRateLimitHandler,
  skipSuccessfulRequests: true,
});

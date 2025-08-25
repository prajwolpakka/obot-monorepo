import rateLimit from "express-rate-limit";

export const createRateLimiter = (options: any) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100, // limit each IP to 100 requests per windowMs
    message: {
      message: "Too many requests from this IP, please try again later.",
      error: "Rate Limit Exceeded",
      statusCode: 429,
    },
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
};

// API rate limiter
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Auth rate limiter (stricter)
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 50 : 5, // More lenient in development
  skipSuccessfulRequests: true,
  message: {
    message: "Too many authentication attempts from this IP, please try again later.",
    error: "Rate Limit Exceeded",
    statusCode: 429,
  },
});

// File upload rate limiter
export const uploadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

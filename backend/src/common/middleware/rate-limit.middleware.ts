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
// API limiter — configurable via env and excludes routes with their own limiter
export const apiLimiter = createRateLimiter({
  windowMs: Number(process.env.RATE_LIMIT_API_WINDOW_MS) || 60 * 1000, // default 1 minute
  max: Number(process.env.RATE_LIMIT_API_MAX) || 600, // default 600 req/min
  // Avoid double-limiting auth/upload/webhook which have their own limiters
  skip: (req: any) => {
    const p: string = req.path || "";
    return p.startsWith("/auth") || p.startsWith("/documents/upload") || p.startsWith("/payment/webhook");
  },
});

// Auth rate limiter (stricter)
export const authLimiter = createRateLimiter({
  windowMs: Number(process.env.RATE_LIMIT_AUTH_WINDOW_MS) || 15 * 60 * 1000,
  max:
    Number(process.env.RATE_LIMIT_AUTH_MAX) || (process.env.NODE_ENV === "development" ? 50 : 5), // keep strict in prod by default
  skipSuccessfulRequests: true,
  message: {
    message: "Too many authentication attempts from this IP, please try again later.",
    error: "Rate Limit Exceeded",
    statusCode: 429,
  },
});

// File upload rate limiter
export const uploadLimiter = createRateLimiter({
  windowMs: Number(process.env.RATE_LIMIT_UPLOAD_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_UPLOAD_MAX) || 10,
});

import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, RateLimitRecord>>();

export function rateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyPrefix?: string;
}) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests. Please try again shortly.',
    keyPrefix = 'global',
  } = options;

  if (!stores.has(keyPrefix)) {
    stores.set(keyPrefix, new Map());
  }
  const store = stores.get(keyPrefix)!;

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
    const now = Date.now();

    let record = store.get(ip);
    if (!record || now > record.resetAt) {
      record = { count: 1, resetAt: now + windowMs };
      store.set(ip, record);
      return next();
    }

    record.count++;
    if (record.count > maxRequests) {
      const retryAfter = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
      res.setHeader('Retry-After', retryAfter);
      res.setHeader('X-RateLimit-Limit', String(maxRequests));
      res.setHeader('X-RateLimit-Remaining', '0');
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
          retryAfterSeconds: retryAfter,
        },
      });
      return;
    }

    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, maxRequests - record.count)));
    next();
  };
}

// Pre-configured limiters
export const authRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 15,
  message: 'Too many authentication attempts. Please wait 60 seconds.',
  keyPrefix: 'auth',
});

export const bookingRateLimiter = rateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: 'Too many booking requests. Please slow down.',
  keyPrefix: 'booking',
});

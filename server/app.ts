import express from 'express';
import { authRouter } from './routes/authRoutes.js';
import { bookingRouter } from './routes/bookingRoutes.js';
import { chefRouter } from './routes/chefRoutes.js';
import { paymentRouter } from './routes/paymentRoutes.js';
import { rewardRouter } from './routes/rewardRoutes.js';
import { notificationRouter } from './routes/notificationRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';
import { otpRouter } from './routes/otpRoutes.js';
import { groceryRouter } from './routes/groceryRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { config } from './config.js';
import { queryOne } from './db/database.js';
import { requestContext } from './middleware/requestContext.js';

declare global {
  namespace Express {
    interface Request { rawBody?: Buffer }
  }
}

export function createApp(): express.Application {
  const app = express();
  app.set('trust proxy', config.trustProxy ? 1 : false);
  app.disable('x-powered-by');
  app.use(requestContext);

  // Explicit CORS policy. Production never uses a wildcard origin.
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (config.corsOrigin === '*' || (origin && origin === config.corsOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', config.corsOrigin === '*' ? '*' : origin!);
    }
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Idempotency-Key, X-Request-ID');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') { res.status(204).end(); return; }
    next();
  });

  // Basic security and parsing
  app.use(express.json({
    limit: '10mb',
    verify: (req, _res, buf) => {
      if (req.originalUrl === '/api/payments/webhook') {
        req.rawBody = Buffer.from(buf);
      }
    },
  }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Basic security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=(self)');
    if (config.env === 'production') res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // Liveness: process is running. Does not depend on database/provider health.
  app.get('/api/health/live', (_req, res) => {
    res.json({ status: 'ok', app: 'ChefPulse Backend Core', timestamp: new Date().toISOString() });
  });

  // Readiness: database must be reachable before traffic is considered ready.
  app.get('/api/health/ready', async (_req, res) => {
    try {
      await queryOne('SELECT 1 AS ok');
      res.json({ status: 'ready', database: 'ok', timestamp: new Date().toISOString() });
    } catch {
      res.status(503).json({ status: 'not_ready', database: 'unavailable', timestamp: new Date().toISOString() });
    }
  });

  // Backwards-compatible health endpoint.
  app.get('/api/health', async (_req, res) => {
    try {
      await queryOne('SELECT 1 AS ok');
      res.json({ status: 'healthy', app: 'ChefPulse Backend Core', database: 'ok', timestamp: new Date().toISOString() });
    } catch {
      res.status(503).json({ status: 'degraded', app: 'ChefPulse Backend Core', database: 'unavailable', timestamp: new Date().toISOString() });
    }
  });

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/otp', otpRouter);
  app.use('/api/bookings', bookingRouter);
  app.use('/api/chefs', chefRouter);
  app.use('/api/payments', paymentRouter);
  app.use('/api/grocery', groceryRouter);
  app.use('/api/rewards', rewardRouter);
  app.use('/api/notifications', notificationRouter);
  app.use('/api/admin', adminRouter);

  // Global Centralized Error Handler (Catches all sync & async errors, sanitizes responses)
  app.use(errorHandler);

  return app;
}

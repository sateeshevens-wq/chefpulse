import path from 'path';
import fs from 'fs';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createApp } from './server/app.js';
import { initDatabase } from './server/db/database.js';
import { seedInitialData } from './server/db/seed.js';
import { config } from './server/config.js';
import { closePostgresPool } from './server/db/postgres/client.js';

async function startServer() {
  console.log('[Server] Initializing ChefPulse Backend Foundation...');

  if (config.env === 'production') {
    const errors: string[] = [];
    if (config.jwtSecret.length < 32 || config.jwtSecret === 'chefpulse-dev-jwt-secret-key-local-only-9845012345') errors.push('JWT_SECRET must be a unique production secret of at least 32 characters.');
    if (!config.paymentWebhookSecret || config.paymentWebhookSecret.length < 32) errors.push('PAYMENT_WEBHOOK_SECRET must be configured.');
    if (config.paymentProvider === 'simulation' || config.allowSimulation) errors.push('Payment simulation is disabled in production. Set PAYMENT_PROVIDER=razorpay.');
    if (config.paymentProvider === 'razorpay' && (!config.razorpayKeyId || !config.razorpayKeySecret)) errors.push('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required for production payments.');
    if (config.databaseDriver !== 'postgres') errors.push('DATABASE_DRIVER=postgres is required in production.');
    if (!config.databaseUrl) errors.push('DATABASE_URL is required in production.');
    if (!config.corsOrigin) errors.push('CORS_ORIGIN must be configured in production.');
    if (errors.length) throw new Error(`PRODUCTION_CONFIGURATION_INVALID: ${errors.join(' ')}`);
  }

  // 1. Initialize the configured relational database and schema
  await initDatabase();

  // 2. Seed Baseline Admin, Chef, and Customer Records if fresh
  await seedInitialData();

  // 3. Create Express App with Security Middlewares & API Routes
  const app = createApp();

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development Mode: Mount Vite in middleware mode
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: config.port,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
    console.log('[Server] Vite middleware mounted for development.');
  } else {
    // Production Mode: Serve compiled static assets
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
      console.log('[Server] Serving production static assets from dist/.');
    }
  }

  // Bind to port 3000
  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`[Server] ChefPulse server listening on 0.0.0.0:${config.port}`);
  });

  // Graceful shutdown
  let shuttingDown = false;
  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[Server] ${signal} received. Shutting down gracefully...`);
    const forceExit = setTimeout(() => {
      console.error('[Server] Graceful shutdown timed out; forcing exit.');
      process.exit(1);
    }, config.shutdownTimeoutMs);
    forceExit.unref();

    await new Promise<void>((resolve) => server.close(() => resolve()));
    console.log('[Server] Closed all HTTP connections.');
    await closePostgresPool().catch((err) => console.error('[Server] PostgreSQL pool close failed:', err));
    clearTimeout(forceExit);
    process.exit(0);
  };

  server.on('error', (err) => {
    console.error('[Server] HTTP server error:', err);
  });
  process.on('SIGTERM', () => { void shutdown('SIGTERM'); });
  process.on('SIGINT', () => { void shutdown('SIGINT'); });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});

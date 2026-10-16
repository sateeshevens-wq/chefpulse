import pg from 'pg';
import { config } from '../../config.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;

function sslConfig(): pg.ClientConfig['ssl'] {
  if (String(process.env.DATABASE_SSL || 'true').toLowerCase() !== 'true') return undefined;
  return { rejectUnauthorized: String(process.env.DATABASE_SSL_REJECT_UNAUTHORIZED || 'true').toLowerCase() === 'true' };
}

export function isPostgresConfigured(): boolean {
  return config.databaseDriver === 'postgres' && Boolean(process.env.DATABASE_URL);
}

export function getPostgresPool(): pg.Pool {
  if (!isPostgresConfigured()) {
    throw new Error('POSTGRES_NOT_CONFIGURED: Set DATABASE_DRIVER=postgres and DATABASE_URL before using the PostgreSQL repository.');
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: sslConfig(),
      max: Number(process.env.DATABASE_POOL_MAX || 10),
      idleTimeoutMillis: Number(process.env.DATABASE_POOL_IDLE_TIMEOUT_MS || 30000),
      connectionTimeoutMillis: Number(process.env.DATABASE_POOL_CONNECTION_TIMEOUT_MS || 10000),
      application_name: 'chefpulse-api',
    });
    pool.on('error', (err) => console.error('[PostgreSQL] idle client error', err));
  }
  return pool;
}

export async function closePostgresPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

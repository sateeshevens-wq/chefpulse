import pg from 'pg';
import { getPostgresPool } from './client.js';

export async function withPostgresTransaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await getPostgresPool().connect();
  try {
    await client.query('BEGIN');
    await client.query("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (rollbackError) {
      console.error('[PostgreSQL] rollback failed', rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Serializes competing writes for the same ChefPulse aggregate.
 * PostgreSQL advisory locks are transaction-scoped and therefore release automatically on commit/rollback.
 */
export async function lockBookingAggregate(client: pg.PoolClient, bookingId: string): Promise<void> {
  await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [`booking:${bookingId}`]);
}

export async function lockChefSchedule(client: pg.PoolClient, chefId: string, scheduledTime: string): Promise<void> {
  await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [`chef-schedule:${chefId}:${scheduledTime}`]);
}

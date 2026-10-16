import process from 'node:process';
import pg from 'pg';

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error('STAGING DATABASE CHECK FAILED: DATABASE_URL is required.');
  process.exit(1);
}

const ssl = process.env.DATABASE_SSL !== 'false';
const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false';
const pool = new pg.Pool({ connectionString: url, ssl: ssl ? { rejectUnauthorized } : undefined, max: 2, connectionTimeoutMillis: 10_000 });

try {
  const requiredTables = ['users', 'chef_profiles', 'bookings', 'payments', 'notifications', 'otp_provider_verifications'];
  const result = await pool.query<{ table_name: string; exists: boolean }>(
    `SELECT table_name, to_regclass('public.' || table_name) IS NOT NULL AS exists
     FROM unnest($1::text[]) AS table_name`,
    [requiredTables],
  );
  const missing = result.rows.filter((row) => !row.exists).map((row) => row.table_name);
  const version = await pool.query<{ version: string }>(
    `SELECT COALESCE(MAX(version), 0)::text AS version FROM schema_migrations`,
  );
  const migrationVersion = version.rows[0]?.version ?? '0';
  if (missing.length) {
    console.error(`STAGING DATABASE CHECK FAILED: missing tables: ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log(`Staging PostgreSQL connection OK; required tables present; schema_migrations max version=${migrationVersion}.`);
} catch (error) {
  console.error(`STAGING DATABASE CHECK FAILED: ${error instanceof Error ? error.message : 'unknown error'}`);
  process.exit(1);
} finally {
  await pool.end();
}

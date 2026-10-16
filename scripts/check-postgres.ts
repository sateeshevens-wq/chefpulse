import process from 'node:process';
import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required.');
const ssl = process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' };
const client = new Client({ connectionString: databaseUrl, ssl });
await client.connect();
try {
  const result = await client.query(`
    SELECT
      current_database() AS database,
      current_user AS user,
      current_setting('server_version') AS server_version,
      pg_size_pretty(pg_database_size(current_database())) AS database_size
  `);
  console.table(result.rows);
} finally {
  await client.end();
}

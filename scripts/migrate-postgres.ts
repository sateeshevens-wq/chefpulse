import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Refusing to run PostgreSQL migration without an explicit target.');
}

const ssl = process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' };
const schemaPath = path.resolve(process.cwd(), 'server', 'db', 'postgres', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

const client = new Client({ connectionString: databaseUrl, ssl });
await client.connect();
try {
  await client.query('BEGIN');
  await client.query(schema);
  await client.query('COMMIT');
  console.log('ChefPulse PostgreSQL schema applied successfully.');
} catch (error) {
  await client.query('ROLLBACK').catch(() => undefined);
  throw error;
} finally {
  await client.end();
}

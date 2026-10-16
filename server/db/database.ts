import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { config } from '../config.js';
import { getPostgresPool } from './postgres/client.js';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { PoolClient } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;
let postgresReady = false;
const pgTypeCache = new Map<string, Map<string, string>>();
const postgresTransactionStorage = new AsyncLocalStorage<PoolClient>();

function getPostgresExecutor(): PoolClient | ReturnType<typeof getPostgresPool> {
  return postgresTransactionStorage.getStore() || getPostgresPool();
}

export async function initDatabase(): Promise<Database | null> {
  if (config.databaseDriver === 'postgres') {
    await initPostgresDatabase();
    return null;
  }
  if (db) return db;

  if (!SQL) SQL = await initSqlJs();
  const dbDir = path.dirname(config.dbPath);
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

  if (fs.existsSync(config.dbPath)) {
    try { db = new SQL.Database(fs.readFileSync(config.dbPath)); }
    catch { db = new SQL.Database(); }
  } else db = new SQL.Database();

  db.run('PRAGMA foreign_keys = ON;');
  applyMigrations(db);
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) db.run(fs.readFileSync(schemaPath, 'utf-8'));
  persistDatabase();
  return db;
}

async function initPostgresDatabase(): Promise<void> {
  if (postgresReady) return;
  const pool = getPostgresPool();
  const schemaPath = path.resolve(__dirname, 'postgres', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  await pool.query(schema);
  postgresReady = true;
}

function applyMigrations(database: Database): void {
  try {
    const tableSqlRes = database.exec("SELECT sql FROM sqlite_master WHERE type='table' AND name='payments';");
    if (tableSqlRes.length > 0 && tableSqlRes[0].values.length > 0) {
      const currentSql = (tableSqlRes[0].values[0][0] as string) || '';
      if (!currentSql.includes('partially_refunded')) {
        database.run('PRAGMA foreign_keys = OFF;');
        database.run(`CREATE TABLE payments_v2 (
          id TEXT PRIMARY KEY, booking_id TEXT NOT NULL, customer_id TEXT NOT NULL,
          amount REAL NOT NULL CHECK(amount >= 0), amount_paise INTEGER NOT NULL DEFAULT 0,
          currency TEXT NOT NULL DEFAULT 'INR', method TEXT NOT NULL DEFAULT 'upi' CHECK(method IN ('upi','card','netbanking','wallet')),
          provider TEXT NOT NULL DEFAULT 'escrow_simulation', provider_order_id TEXT, provider_payment_id TEXT,
          transaction_ref TEXT UNIQUE NOT NULL, status TEXT NOT NULL DEFAULT 'created' CHECK(status IN ('created','pending','authorized','captured','failed','cancelled','refunded','partially_refunded')),
          escrow_status TEXT NOT NULL DEFAULT 'held' CHECK(escrow_status IN ('held','released_to_chef','refunded_to_customer')),
          idempotency_key TEXT, failure_reason TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE, FOREIGN KEY (customer_id) REFERENCES users(id)
        );`);
        const colsRes = database.exec('PRAGMA table_info(payments);');
        const cols = colsRes.length ? colsRes[0].values.map((v: any[]) => v[1] as string) : [];
        const has = (name: string) => cols.includes(name);
        database.run(`INSERT INTO payments_v2 (id,booking_id,customer_id,amount,amount_paise,currency,method,provider,provider_order_id,provider_payment_id,transaction_ref,status,escrow_status,idempotency_key,failure_reason,created_at,updated_at)
          SELECT id,booking_id,customer_id,amount,${has('amount_paise') ? 'COALESCE(amount_paise, CAST(ROUND(amount*100) AS INTEGER))' : 'CAST(ROUND(amount*100) AS INTEGER)'},currency,method,provider,${has('provider_order_id') ? 'provider_order_id' : 'NULL'},${has('provider_payment_id') ? 'provider_payment_id' : 'NULL'},transaction_ref,status,escrow_status,${has('idempotency_key') ? 'idempotency_key' : 'NULL'},${has('failure_reason') ? 'failure_reason' : 'NULL'},created_at,updated_at FROM payments;`);
        database.run('DROP TABLE payments; ALTER TABLE payments_v2 RENAME TO payments;');
        database.run('CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id); CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id); CREATE INDEX IF NOT EXISTS idx_payments_provider_order ON payments(provider_order_id); CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);');
        database.run('PRAGMA foreign_keys = ON;');
      }
    }
    const paymentColsNow = database.exec('PRAGMA table_info(payments);');
    if (paymentColsNow.length) {
      const paymentCols = paymentColsNow[0].values.map((v: any[]) => v[1] as string);
      if (!paymentCols.includes('provider_payment_id')) database.run('ALTER TABLE payments ADD COLUMN provider_payment_id TEXT;');
    }
    const refundColsRes = database.exec('PRAGMA table_info(refunds);');
    if (refundColsRes.length) {
      const cols = refundColsRes[0].values.map((v: any[]) => v[1] as string);
      if (!cols.includes('amount_paise')) { database.run('ALTER TABLE refunds ADD COLUMN amount_paise INTEGER DEFAULT 0;'); database.run('UPDATE refunds SET amount_paise=CAST(ROUND(amount*100) AS INTEGER) WHERE amount_paise=0;'); }
      if (!cols.includes('provider_refund_id')) database.run('ALTER TABLE refunds ADD COLUMN provider_refund_id TEXT;');
    }
    database.run(`CREATE TABLE IF NOT EXISTS payment_idempotency (id TEXT PRIMARY KEY,idempotency_key TEXT NOT NULL,scope TEXT NOT NULL,user_id TEXT NOT NULL,request_hash TEXT NOT NULL,response_json TEXT NOT NULL,status_code INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT (datetime('now'))); CREATE UNIQUE INDEX IF NOT EXISTS idx_idempotency_lookup ON payment_idempotency(idempotency_key,scope,user_id);`);
    database.run(`CREATE TABLE IF NOT EXISTS webhook_events (id TEXT PRIMARY KEY,provider TEXT NOT NULL,provider_event_id TEXT UNIQUE NOT NULL,event_type TEXT NOT NULL,payload_json TEXT NOT NULL,signature TEXT,status TEXT NOT NULL DEFAULT 'received' CHECK(status IN ('received','processed','duplicate','failed')),processed_at TEXT,error_message TEXT,created_at TEXT NOT NULL DEFAULT (datetime('now'))); CREATE INDEX IF NOT EXISTS idx_webhook_events_provider ON webhook_events(provider,event_type);`);
  } catch (err) { console.warn('[Database Migration] Migration warning:', err); }
}

export function getDb(): Database {
  if (!db) throw new Error('SQLite database not initialized.');
  return db;
}

export function persistDatabase(): void {
  if (!db) return;
  try {
    const buffer = Buffer.from(db.export());
    const dbDir = path.dirname(config.dbPath);
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    const tempPath = `${config.dbPath}.tmp`;
    fs.writeFileSync(tempPath, buffer);
    fs.renameSync(tempPath, config.dbPath);
  } catch (err) { console.error('Failed to persist database to disk:', err); }
}

function toPostgresSql(sql: string): { sql: string; paramsMap: number[] } {
  let text = sql.replace(/datetime\(\s*'now'\s*\)/gi, 'NOW()');
  text = text.replace(/"(admin|support|active|paid|captured|processed|created|pending|refunded|failed|cancelled|duplicate|received)"/g, "'$1'");
  const paramsMap: number[] = [];
  let index = 0;
  text = text.replace(/\?/g, () => { paramsMap.push(index++); return `$${index}`; });
  return { sql: text, paramsMap };
}

async function postgresColumnTypes(table: string): Promise<Map<string, string>> {
  const cached = pgTypeCache.get(table);
  if (cached) return cached;
  const result = await getPostgresPool().query(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=$1`,
    [table]
  );
  const map = new Map<string, string>();
  for (const row of result.rows) map.set(row.column_name, row.data_type);
  pgTypeCache.set(table, map);
  return map;
}

function targetColumns(sql: string, paramCount: number): Array<string | null> {
  const result: Array<string | null> = Array(paramCount).fill(null);
  const insert = sql.match(/INSERT\s+INTO\s+([\w.]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/is);
  if (insert) {
    const cols = insert[2].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
    const values = insert[3];
    const tokens = values.split(',').map(s => s.trim());
    let p = 0;
    for (let i = 0; i < tokens.length && p < paramCount; i++) {
      const m = tokens[i].match(/^\$(\d+)$/);
      if (m) { result[Number(m[1]) - 1] = cols[i] || null; p++; }
    }
  }
  const update = sql.match(/UPDATE\s+([\w.]+)\s+SET\s+([\s\S]+?)(?:\s+WHERE\s|$)/i);
  if (update) {
    for (const part of update[2].split(',')) {
      const m = part.match(/^\s*([\w.]+)\s*=\s*\$(\d+)/);
      if (m) result[Number(m[2]) - 1] = m[1];
    }
  }
  const whereRe = /([\w.]+)\s*=\s*\$(\d+)/gi;
  let m: RegExpExecArray | null;
  while ((m = whereRe.exec(sql))) result[Number(m[2]) - 1] ||= m[1];
  return result;
}

async function normalizePostgresParams(sql: string, params: any[]): Promise<any[]> {
  const tableMatch = sql.match(/(?:INSERT\s+INTO|UPDATE|FROM|JOIN)\s+([\w.]+)/i);
  const table = tableMatch?.[1]?.split('.').pop();
  if (!table) return params;
  const types = await postgresColumnTypes(table);
  const columns = targetColumns(sql, params.length);
  return params.map((value, i) => {
    const col = columns[i];
    const type = col ? types.get(col) : undefined;
    if (type === 'boolean' && (value === 0 || value === 1)) return Boolean(value);
    if (type === 'jsonb' && value !== null && value !== undefined && typeof value !== 'string') return JSON.stringify(value);
    return value;
  });
}

export async function run(sql: string, params: any[] = []): Promise<number> {
  if (config.databaseDriver === 'postgres') {
    const converted = toPostgresSql(sql);
    const normalized = await normalizePostgresParams(converted.sql, params);
    const result = await getPostgresExecutor().query(converted.sql, normalized);
    return result.rowCount || 0;
  }
  const database = getDb(); database.run(sql, params); persistDatabase(); return 0;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (config.databaseDriver === 'postgres') {
    const converted = toPostgresSql(sql);
    const normalized = await normalizePostgresParams(converted.sql, params);
    const result = await getPostgresExecutor().query(converted.sql, normalized);
    return result.rows as T[];
  }
  const database = getDb();
  const stmt = database.prepare(sql); stmt.bind(params);
  const rows: T[] = []; while (stmt.step()) rows.push(stmt.getAsObject() as unknown as T); stmt.free(); return rows;
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params); return rows.length ? rows[0] : null;
}

export async function transaction<T>(fn: () => Promise<T>): Promise<T> {
  if (config.databaseDriver === 'postgres') {
    if (postgresTransactionStorage.getStore()) return fn();
    const client = await getPostgresPool().connect();
    try {
      await client.query('BEGIN');
      return await postgresTransactionStorage.run(client, async () => {
        const result = await fn();
        await client.query('COMMIT');
        return result;
      });
    } catch (error) {
      try { await client.query('ROLLBACK'); } catch {}
      throw error;
    } finally {
      client.release();
    }
  }
  const database = getDb(); database.run('BEGIN TRANSACTION;');
  try { const result = await fn(); database.run('COMMIT;'); persistDatabase(); return result; }
  catch (error) { try { database.run('ROLLBACK;'); } catch {} throw error; }
}

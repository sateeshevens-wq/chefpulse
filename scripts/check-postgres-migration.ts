import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Client } = pg;

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required.');
  const client = new Client({
    connectionString: url,
    ssl: String(process.env.DATABASE_SSL || 'true').toLowerCase() === 'true'
      ? { rejectUnauthorized: String(process.env.DATABASE_SSL_REJECT_UNAUTHORIZED || 'true').toLowerCase() === 'true' }
      : undefined,
  });
  await client.connect();
  try {
    const requiredTables = [
      'users','customer_profiles','chef_profiles','addresses','chef_availabilities','bookings',
      'booking_status_history','payments','refunds','payment_idempotency','webhook_events',
      'notifications','reviews','reward_accounts','reward_transactions','verifications','audit_logs','otp_challenges'
    ];
    const tableRows = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name = ANY($1::text[])`,
      [requiredTables]
    );
    const present = new Set(tableRows.rows.map((r) => r.table_name));
    const missing = requiredTables.filter((t) => !present.has(t));
    if (missing.length) throw new Error(`Missing required tables: ${missing.join(', ')}`);

    const checks = await Promise.all([
      client.query(`SELECT COUNT(*)::bigint AS count FROM users`),
      client.query(`SELECT COUNT(*)::bigint AS count FROM bookings`),
      client.query(`SELECT COUNT(*)::bigint AS count FROM payments`),
      client.query(`SELECT COUNT(*)::bigint AS count FROM refunds`),
      client.query(`SELECT COUNT(*)::bigint AS count FROM webhook_events`),
      client.query(`SELECT COUNT(*)::bigint AS count FROM payment_idempotency`),
    ]);
    const [users, bookings, payments, refunds, webhooks, idempotency] = checks.map((r) => Number(r.rows[0].count));

    const paymentMismatch = await client.query(`
      SELECT COUNT(*)::bigint AS count
      FROM payments
      WHERE amount_paise <> ROUND(amount * 100)::integer
    `);
    const refundMismatch = await client.query(`
      SELECT COUNT(*)::bigint AS count
      FROM refunds
      WHERE amount_paise <> ROUND(amount * 100)::integer
    `);
    const mismatchPayments = Number(paymentMismatch.rows[0].count);
    const mismatchRefunds = Number(refundMismatch.rows[0].count);
    if (mismatchPayments || mismatchRefunds) {
      throw new Error(`Money mismatch detected: payments=${mismatchPayments}, refunds=${mismatchRefunds}`);
    }

    const schemaPath = path.resolve(process.cwd(), 'server/db/postgres/schema.sql');
    if (!fs.existsSync(schemaPath)) throw new Error(`PostgreSQL schema not found: ${schemaPath}`);

    console.log(JSON.stringify({
      ok: true,
      tables: requiredTables.length,
      counts: { users, bookings, payments, refunds, webhooks, idempotency },
      moneyChecks: { paymentMismatches: mismatchPayments, refundMismatches: mismatchRefunds },
      message: 'PostgreSQL schema and migrated data passed structural verification.'
    }, null, 2));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(`[PostgreSQL verification] ${error.message}`);
  process.exit(1);
});

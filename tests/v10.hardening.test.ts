import fs from 'fs';
import path from 'path';

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

const database = read('server/db/database.ts');
const booking = read('server/db/postgres/repositories/bookingRepository.ts');
const schema = read('server/db/postgres/schema.sql');
const razorpay = read('server/services/paymentProviders/razorpayProvider.ts');
const reconcile = read('scripts/reconcile-postgres-refunds.ts');
const webhook = read('server/db/postgres/repositories/paymentRepository.ts');

const checks: Array<[string, boolean]> = [
  ['Postgres transactions bind the same PoolClient through AsyncLocalStorage', database.includes('AsyncLocalStorage') && database.includes('postgresTransactionStorage.run(client')],
  ['Postgres query/run helpers use the transaction-bound executor', database.includes('getPostgresExecutor().query')],
  ['Booking conflict checks service-window overlap', booking.includes('service_duration_minutes * INTERVAL') && booking.includes("scheduled_time < ($2::timestamptz")],
  ['Booking schema has bounded service duration', schema.includes('service_duration_minutes INTEGER') && schema.includes('<= 1440')],
  ['Razorpay refund reconciliation can list provider refunds', razorpay.includes('listPaymentRefunds')],
  ['Refund reconciliation script exists', reconcile.includes('reconcileRefundPostgres')],
  ['Failed webhook events can be retried transactionally', webhook.includes("row.status === 'failed'") && webhook.includes("status='received'")],
];

for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}`);
const failures = checks.filter(([, ok]) => !ok);
if (failures.length) process.exit(1);

import { config } from '../server/config.js';
import { initDatabase } from '../server/db/database.js';
import { listPendingRefundsPostgres, reconcileRefundPostgres } from '../server/db/postgres/repositories/refundReconciliationRepository.js';
import { RazorpayProvider } from '../server/services/paymentProviders/razorpayProvider.js';

if (config.databaseDriver !== 'postgres') throw new Error('DATABASE_DRIVER=postgres is required');
if (config.paymentProvider !== 'razorpay') throw new Error('This reconciliation script currently supports RAZORPAY only');
await initDatabase();
const pending = await listPendingRefundsPostgres(100);
let recovered = 0;
for (const refund of pending) {
  if (!refund.provider_payment_id) continue;
  try {
    const provider = await RazorpayProvider.listPaymentRefunds(refund.provider_payment_id);
    const match = provider.items.find(item => Number(item.amount) === Number(refund.amount_paise) && ['processed','pending'].includes(String(item.status || 'processed')));
    if (!match) continue;
    await reconcileRefundPostgres({ refundId: refund.id, providerRefundId: match.id });
    recovered++;
    console.log(`[refund-reconcile] recovered ${refund.id} -> ${match.id}`);
  } catch (error: any) {
    console.error(`[refund-reconcile] ${refund.id}: ${error.message}`);
  }
}
console.log(`[refund-reconcile] pending=${pending.length} recovered=${recovered}`);

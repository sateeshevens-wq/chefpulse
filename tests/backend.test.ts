import assert from 'node:assert';
import http from 'node:http';
import crypto from 'node:crypto';
import { createApp } from '../server/app.js';
import { initDatabase, query, queryOne, run } from '../server/db/database.js';
import { seedInitialData } from '../server/db/seed.js';
import { config } from '../server/config.js';

let server: http.Server;
let baseUrl: string;

async function request(path: string, options: RequestInit = {}) {
  const url = `${baseUrl}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runTests() {
  console.log('\n========================================');
  console.log('🧪 Starting ChefPulse Backend Test Suite');
  console.log('========================================\n');

  // Initialize DB and Seed
  await initDatabase();
  await seedInitialData();

  // Spin up test server on ephemeral port
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr: any = server.address();
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // Clean up any test records from prior runs
  try {
    await run("DELETE FROM users WHERE phone LIKE '+9191%' OR phone LIKE '+9192%'");
  } catch {}

  // Tokens for actors
  let customerAToken: string;
  let customerAId: string;
  let customerBToken: string;
  let customerBId: string;
  let chefAToken: string;
  let chefAProfileId: string;
  let chefBToken: string;
  let chefBProfileId: string;
  let adminToken: string;

  // 1. REGISTRATION TESTS
  console.log('\n--- 1. Registration Tests ---');
  await test('Register Customer A with secure password hashing', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        phone: '+919100000001',
        password: 'SecurePassword123!',
        name: 'Customer Alice',
        role: 'customer',
      }),
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.token);
    assert.strictEqual(res.data.user.role, 'customer');
    customerAToken = res.data.token;
    customerAId = res.data.user.id;

    // Verify password is not plaintext in database
    const dbUser = queryOne<any>('SELECT password_hash FROM users WHERE id = ?', [customerAId]);
    assert.notStrictEqual(dbUser.password_hash, 'SecurePassword123!');
    assert.ok(dbUser.password_hash.startsWith('$2'));
  });

  await test('Register Customer B', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        phone: '+919100000002',
        password: 'SecurePassword123!',
        name: 'Customer Bob',
        role: 'customer',
      }),
    });
    assert.strictEqual(res.status, 201);
    customerBToken = res.data.token;
    customerBId = res.data.user.id;
  });

  await test('Register Chef A with culinary profile', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        phone: '+919200000001',
        password: 'ChefPassword123!',
        name: 'Chef Anil',
        role: 'chef',
        hourlyRate: 600,
        sosRate: 900,
        dayPrepRate: 1500,
      }),
    });
    assert.strictEqual(res.status, 201);
    chefAToken = res.data.token;
    chefAProfileId = res.data.user.chefProfileId;
    assert.ok(chefAProfileId);
  });

  await test('Register Chef B', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        phone: '+919200000002',
        password: 'ChefPassword123!',
        name: 'Chef Bipin',
        role: 'chef',
      }),
    });
    assert.strictEqual(res.status, 201);
    chefBToken = res.data.token;
    chefBProfileId = res.data.user.chefProfileId;
    assert.ok(chefBProfileId);
  });

  // 2. SECURITY TEST: PRIVILEGE ESCALATION
  console.log('\n--- 2. Security Test: Privilege Escalation Prevention ---');
  await test('Customer CANNOT promote themselves to admin during registration', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        phone: '+919999999998',
        password: 'MaliciousPassword123!',
        name: 'Hacker Joe',
        role: 'admin', // Attack: Attempting self-promotion to admin
      }),
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.error.code, 'PRIVILEGE_ESCALATION_BLOCKED');
  });

  // 3. LOGIN & AUTHENTICATION TESTS
  console.log('\n--- 3. Login & Authentication Tests ---');
  await test('Login with valid credentials returns JWT token', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        phone: '+919100000001',
        password: 'SecurePassword123!',
      }),
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.token);
  });

  await test('Login with incorrect password is rejected (401)', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        phone: '+919100000001',
        password: 'WrongPassword!',
      }),
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  });

  await test('Login as Seeded Administrator', async () => {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        phone: '+919999999999',
        password: 'Password123!',
      }),
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.role, 'admin');
    adminToken = res.data.token;
  });

  // 4. ROLE AUTHORIZATION TESTS
  console.log('\n--- 4. Role Authorization Tests ---');
  await test('Customer is blocked from admin audit-logs endpoint (403)', async () => {
    const res = await request('/api/admin/audit-logs', {
      headers: { Authorization: `Bearer ${customerAToken}` },
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
  });

  await test('Admin can successfully retrieve audit logs (200)', async () => {
    const res = await request('/api/admin/audit-logs', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.logs));
  });

  // 5. BOOKING CREATION & PRICE TAMPERING PREVENTION
  console.log('\n--- 5. Booking Creation & Price Tampering Prevention ---');
  let bookingId: string;
  let bookingTotalAmount: number;
  let bookingOtp: string;

  await test('Server overrides client price tampering during booking creation', async () => {
    // Attack: Client maliciously sends totalAmount = 1 and subtotal = 1 to get a 900 INR chef for 1 INR!
    const res = await request('/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({
        chefId: chefAProfileId,
        type: 'sos_quick_fix', // Base SOS rate for Chef A is 900
        dishesRequested: 'Butter Chicken & Naan',
        totalAmount: 1, // MALICIOUS CLIENT INPUT
        subtotal: 1,    // MALICIOUS CLIENT INPUT
      }),
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    bookingId = res.data.booking.id;
    bookingTotalAmount = res.data.booking.total_amount;
    bookingOtp = res.data.booking.otp_code;

    // Expected: 900 base + 49 platform fee = 949 + 18% GST (171) = 1120
    assert.strictEqual(res.data.booking.subtotal, 900);
    assert.strictEqual(res.data.booking.platform_fee, 49);
    assert.ok(res.data.booking.total_amount > 1000); // Definitely NOT 1 INR!
    assert.strictEqual(res.data.booking.status, 'requested');
    assert.strictEqual(res.data.booking.payment_status, 'pending');
    assert.ok(bookingOtp && bookingOtp.length === 4);
  });

  // 6. SECURITY TEST: IDOR / BOLA (Customer A vs Customer B)
  console.log('\n--- 6. Security Test: IDOR Protection ---');
  await test('Customer B CANNOT view Customer A booking (403 IDOR Blocked)', async () => {
    const res = await request(`/api/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${customerBToken}` }, // Customer B attempting to access Customer A's booking
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.error.code, 'FORBIDDEN');
  });

  await test('Customer A CAN view their own booking (200)', async () => {
    const res = await request(`/api/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${customerAToken}` },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.booking.id, bookingId);
  });

  // 7. SECURITY TEST: CLIENT CANNOT DIRECTLY MARK AS PAID OR COMPLETE
  console.log('\n--- 7. Security Test: Booking Status State Machine Protections ---');
  await test('Customer CANNOT directly jump status requested -> completed (Illegal Transition Blocked)', async () => {
    const res = await request(`/api/bookings/${bookingId}/status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({ targetStatus: 'completed' }),
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.error.code, 'INVALID_TRANSITION');
  });

  await test('Customer CANNOT directly mark booking as paid (Blocked)', async () => {
    const res = await request(`/api/bookings/${bookingId}/status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({ targetStatus: 'paid' }),
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  // 8. PAYMENT ESCROW FLOW & HARDENING
  console.log('\n--- 8. Payment Escrow Flow & Hardening ---');
  let paymentId: string;
  let txnRef: string;

  await test('Client attempts to alter payment amount during create-intent (Server enforces authoritative price)', async () => {
    // Attack: Client passes amount = 1 and amount_paise = 100 to attempt paying 1 INR instead of 1120 INR
    const res = await request('/api/payments/create-intent', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({
        bookingId,
        amount: 1, // MALICIOUS CLIENT INPUT
        amount_paise: 100, // MALICIOUS CLIENT INPUT
      }),
    });
    assert.strictEqual(res.status, 200);
    // Server must strictly override and bind the true booking totalAmount
    assert.strictEqual(res.data.payment.amount, bookingTotalAmount);
    assert.strictEqual(res.data.payment.amountPaise, Math.round(bookingTotalAmount * 100));
    paymentId = res.data.payment.id;
    txnRef = res.data.payment.transactionRef;
  });

  await test('Payment belonging to another customer\'s booking is blocked (IDOR Protection)', async () => {
    // Customer B attempts to create payment intent for Customer A's booking
    const res = await request('/api/payments/create-intent', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerBToken}` },
      body: JSON.stringify({ bookingId }),
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.error.code, 'FORBIDDEN');
  });

  await test('Customer B CANNOT confirm Customer A\'s payment (IDOR Protection)', async () => {
    const res = await request('/api/payments/confirm', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerBToken}` },
      body: JSON.stringify({ paymentId, transactionRef: txnRef }),
    });
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.error.code, 'FORBIDDEN');
  });

  await test('Payment confirmation advances booking status to paid and credits rewards', async () => {
    const res = await request('/api/payments/confirm', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({ paymentId, transactionRef: txnRef }),
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.booking.status, 'paid');
    assert.strictEqual(res.data.booking.payment_status, 'paid');
    assert.strictEqual(res.data.paymentStatus, 'captured');

    // Verify Reward balance was credited upon legitimate payment confirmation
    const rewardAcc = queryOne<any>('SELECT total_points FROM reward_accounts WHERE user_id = ?', [customerAId]);
    assert.strictEqual(rewardAcc.total_points, 50); // Exactly 50 points earned on legitimate payment capture
  });

  await test('Duplicate payment confirmation is idempotent (No duplicate bookings, payments, or rewards)', async () => {
    const preReward = queryOne<any>('SELECT total_points FROM reward_accounts WHERE user_id = ?', [customerAId]);

    // Resend exact same confirmation request
    const res = await request('/api/payments/confirm', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({ paymentId, transactionRef: txnRef }),
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.paymentStatus, 'captured');
    assert.strictEqual(res.data.isDuplicate, true);

    // Verify Reward balance was NOT credited twice
    const postReward = queryOne<any>('SELECT total_points FROM reward_accounts WHERE user_id = ?', [customerAId]);
    assert.strictEqual(postReward.total_points, preReward.total_points);

    // Verify duplicate_payment_event was logged in audit_logs
    const dupLog = queryOne<any>('SELECT * FROM audit_logs WHERE event_type = "duplicate_payment_event" AND target_id = ?', [paymentId]);
    assert.ok(dupLog, 'duplicate_payment_event must be recorded in audit log');
  });

  await test('Payment failure handling: booking stays unpaid and rewards are NOT granted', async () => {
    // 1. Create a second booking
    const bookRes = await request('/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({
        chefId: chefAProfileId,
        type: 'scheduled_prep',
        dishesRequested: 'Dal Makhani & Roti',
      }),
    });
    assert.strictEqual(bookRes.status, 201);
    const failBookingId = bookRes.data.booking.id;

    // 2. Create intent
    const intentRes = await request('/api/payments/create-intent', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({ bookingId: failBookingId }),
    });
    assert.strictEqual(intentRes.status, 200);
    const failPaymentId = intentRes.data.payment.id;

    // 3. Record payment failure
    const preFailRewards = queryOne<any>('SELECT total_points FROM reward_accounts WHERE user_id = ?', [customerAId]);
    const failRes = await request('/api/payments/fail', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({ paymentId: failPaymentId, reason: 'Card declined by issuing bank' }),
    });
    assert.strictEqual(failRes.status, 200);
    assert.strictEqual(failRes.data.status, 'failed');

    // 4. Verify booking remains unpaid
    const checkBooking = queryOne<any>('SELECT * FROM bookings WHERE id = ?', [failBookingId]);
    assert.notStrictEqual(checkBooking.status, 'paid');
    assert.notStrictEqual(checkBooking.payment_status, 'paid');

    // 5. Verify NO rewards granted on payment failure
    const postFailRewards = queryOne<any>('SELECT total_points FROM reward_accounts WHERE user_id = ?', [customerAId]);
    assert.strictEqual(postFailRewards.total_points, preFailRewards.total_points);

    // 6. Verify cannot confirm a failed payment (state consistency)
    const badConfirm = await request('/api/payments/confirm', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({ paymentId: failPaymentId, transactionRef: intentRes.data.payment.transactionRef }),
    });
    assert.strictEqual(badConfirm.status, 400);
    assert.strictEqual(badConfirm.data.error.code, 'INVALID_PAYMENT_STATE');
  });

  await test('Unauthorized customer CANNOT issue a refund (403 Forbidden)', async () => {
    const res = await request('/api/payments/refund', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({ bookingId, amount: 500 }),
    });
    assert.strictEqual(res.status, 403);
  });

  await test('Refund amount tampering is strictly prevented by server', async () => {
    // Attack: Admin or client tries to refund ₹99999 (exceeding original payment amount)
    const excessiveRefund = await request('/api/payments/refund', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ bookingId, amount: 99999 }),
    });
    assert.strictEqual(excessiveRefund.status, 400);
    assert.strictEqual(excessiveRefund.data.error.code, 'REFUND_AMOUNT_EXCEEDED');

    // Attack: Negative refund amount
    const negativeRefund = await request('/api/payments/refund', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ bookingId, amount: -100 }),
    });
    assert.strictEqual(negativeRefund.status, 400);
    assert.strictEqual(negativeRefund.data.error.code, 'INVALID_AMOUNT');
  });

  await test('Authorized partial and full refund process with escrow release', async () => {
    // 1. Create a third booking for refund testing
    const rBookRes = await request('/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({
        chefId: chefAProfileId,
        type: 'sos_quick_fix',
        dishesRequested: 'Tandoori Platter',
      }),
    });
    assert.strictEqual(rBookRes.status, 201);
    const rBookingId = rBookRes.data.booking.id;

    // 2. Pay booking
    const intentRes = await request('/api/payments/create-intent', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({ bookingId: rBookingId }),
    });
    const rPaymentId = intentRes.data.payment.id;
    const rTxnRef = intentRes.data.payment.transactionRef;

    const confRes = await request('/api/payments/confirm', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({ paymentId: rPaymentId, transactionRef: rTxnRef }),
    });
    assert.strictEqual(confRes.status, 200);

    // 3. Partial Refund of ₹300
    const partialRefund = await request('/api/payments/refund', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ paymentId: rPaymentId, amount: 300, reason: 'Chef delayed 10 minutes' }),
    });
    assert.strictEqual(partialRefund.status, 200);
    assert.strictEqual(partialRefund.data.refund.amount, 300);
    assert.strictEqual(partialRefund.data.refund.isFullRefund, false);

    const midPayment = queryOne<any>('SELECT * FROM payments WHERE id = ?', [rPaymentId]);
    assert.strictEqual(midPayment.status, 'partially_refunded');

    // 4. Full remaining refund
    const fullRefund = await request('/api/payments/refund', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ paymentId: rPaymentId, reason: 'Cancellation by mutual consent' }),
    });
    assert.strictEqual(fullRefund.status, 200);
    assert.strictEqual(fullRefund.data.refund.isFullRefund, true);

    const endPayment = queryOne<any>('SELECT * FROM payments WHERE id = ?', [rPaymentId]);
    assert.strictEqual(endPayment.status, 'refunded');
    assert.strictEqual(endPayment.escrow_status, 'refunded_to_customer');

    // Verify refund audit logs
    const refAudit = queryOne<any>('SELECT * FROM audit_logs WHERE event_type = "refund_completed" AND target_id = ?', [fullRefund.data.refund.id]);
    assert.ok(refAudit, 'refund_completed audit log must be recorded');
  });

  await test('Provider-Agnostic Webhook Architecture & Deduplication', async () => {
    // 1. Create a booking and intent for webhook capture testing
    const wbRes = await request('/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({
        chefId: chefAProfileId,
        type: 'sos_quick_fix',
        dishesRequested: 'Paneer Butter Masala',
      }),
    });
    const wbBookingId = wbRes.data.booking.id;

    const intentRes = await request('/api/payments/create-intent', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({ bookingId: wbBookingId }),
    });
    const wbPayment = intentRes.data.payment;
    const testEventId = `evt_test_${Date.now()}_abc`;

    // 2. Inbound Webhook: payment.captured
    const webhookRes = await request('/api/payments/webhook', {
      method: 'POST',
      headers: {
        'x-razorpay-event-id': testEventId,
        'x-payment-provider': 'razorpay',
      },
      body: JSON.stringify({
        event: 'payment.captured',
        order_id: wbPayment.providerOrderId,
        payment_id: wbPayment.transactionRef,
      }),
    });
    assert.strictEqual(webhookRes.status, 200);
    assert.strictEqual(webhookRes.data.status, 'processed');

    // Verify booking is now paid
    const checkWbBooking = queryOne<any>('SELECT * FROM bookings WHERE id = ?', [wbBookingId]);
    assert.strictEqual(checkWbBooking.status, 'paid');

    // 3. Webhook Deduplication: Resend exact same eventId
    const dupWebhookRes = await request('/api/payments/webhook', {
      method: 'POST',
      headers: {
        'x-razorpay-event-id': testEventId,
        'x-payment-provider': 'razorpay',
      },
      body: JSON.stringify({
        event: 'payment.captured',
        order_id: wbPayment.providerOrderId,
        payment_id: wbPayment.transactionRef,
      }),
    });
    assert.strictEqual(dupWebhookRes.status, 200);
    assert.strictEqual(dupWebhookRes.data.status, 'duplicate');

    // Verify duplicate_payment_event was logged in audit_logs
    const dupWhAudit = queryOne<any>('SELECT * FROM audit_logs WHERE event_type = "duplicate_payment_event" AND target_id = ?', [testEventId]);
    assert.ok(dupWhAudit, 'duplicate_payment_event must be recorded for duplicate webhook');
  });

  await test('Webhook with invalid signature is rejected with 401', async () => {
    const rawPayload = JSON.stringify({ event: 'payment.captured', order_id: 'order_test_fake' });
    const res = await request('/api/payments/webhook', {
      method: 'POST',
      headers: {
        'x-webhook-event-id': `evt_tamper_${Date.now()}`,
        'x-razorpay-signature': '0000000000000000000000000000000000000000000000000000000000000000', // Invalid signature
      },
      body: rawPayload,
    });
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.error.code, 'INVALID_WEBHOOK_SIGNATURE');

    // Verify invalid_payment_signature audit log
    const invalidSigAudit = queryOne<any>('SELECT * FROM audit_logs WHERE event_type = "invalid_payment_signature" ORDER BY created_at DESC LIMIT 1');
    assert.ok(invalidSigAudit, 'invalid_payment_signature must be recorded in audit log');
  });

  await test('Idempotency-Key header prevents duplicate intent and detects key reuse mismatch', async () => {
    // Create a fresh booking in requested state
    const bookRes = await request('/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({
        chefId: chefAProfileId,
        type: 'sos_quick_fix',
        dishesRequested: 'Gulab Jamun & Rabri',
      }),
    });
    const idemBookingId = bookRes.data.booking.id;

    const testIdemKey = `idem_key_${Date.now()}`;
    const firstRes = await request('/api/payments/create-intent', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customerAToken}`,
        'Idempotency-Key': testIdemKey,
      },
      body: JSON.stringify({ bookingId: idemBookingId }),
    });
    assert.strictEqual(firstRes.status, 200);

    // Replay with identical key and payload -> returns cached intent
    const replayRes = await request('/api/payments/create-intent', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customerAToken}`,
        'Idempotency-Key': testIdemKey,
      },
      body: JSON.stringify({ bookingId: idemBookingId }),
    });
    assert.strictEqual(replayRes.status, 200);
    assert.strictEqual(replayRes.data.payment.id, firstRes.data.payment.id);

    // Mismatched payload with same idempotency key -> rejected
    const mismatchRes = await request('/api/payments/create-intent', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customerAToken}`,
        'Idempotency-Key': testIdemKey,
      },
      body: JSON.stringify({ bookingId: idemBookingId, method: 'card' }), // Different method!
    });
    assert.strictEqual(mismatchRes.status, 500);
    assert.ok(mismatchRes.data.error.message.includes('IDEMPOTENCY_KEY_REUSE_PAYLOAD_MISMATCH'));
  });

  await test('Server unavailable / network error simulation leaves booking unpaid and rewards ungranted', async () => {
    // 1. Create a fresh booking
    const bookRes = await request('/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({
        chefId: chefAProfileId,
        type: 'sos_quick_fix',
        dishesRequested: 'Truffle Pasta',
      }),
    });
    const unavailBookingId = bookRes.data.booking.id;
    const preRewards = queryOne<any>('SELECT total_points FROM reward_accounts WHERE user_id = ?', [customerAId]);

    // 2. Client encounters an invalid endpoint / network drop during payment
    const brokenCall = await request('/api/payments/confirm', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({ paymentId: 'pay-nonexistent', transactionRef: 'TXN-FAKE' }),
    });
    assert.strictEqual(brokenCall.status, 404);

    // 3. Ensure booking is NOT marked as paid
    const bookingCheck = queryOne<any>('SELECT * FROM bookings WHERE id = ?', [unavailBookingId]);
    assert.notStrictEqual(bookingCheck.status, 'paid');
    assert.notStrictEqual(bookingCheck.payment_status, 'paid');

    // 4. Ensure reward points were NOT awarded
    const postRewards = queryOne<any>('SELECT total_points FROM reward_accounts WHERE user_id = ?', [customerAId]);
    assert.strictEqual(postRewards.total_points, preRewards.total_points);
  });

  // 9. CHEF OWNERSHIP & STATUS ADVANCEMENT
  console.log('\n--- 9. Chef Status Transitions & Ownership ---');
  await test('Chef B CANNOT accept Chef A booking (Unauthorized Chef Blocked)', async () => {
    const res = await request(`/api/bookings/${bookingId}/status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${chefBToken}` }, // Chef B attempting to steal Chef A's booking
      body: JSON.stringify({ targetStatus: 'accepted' }),
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.success, false);
  });

  await test('Chef A accepts booking (Transition to accepted)', async () => {
    const res = await request(`/api/bookings/${bookingId}/status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${chefAToken}` },
      body: JSON.stringify({ targetStatus: 'accepted' }),
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.booking.status, 'accepted');
  });

  await test('Chef A marks en_route -> arrived', async () => {
    const enRoute = await request(`/api/bookings/${bookingId}/status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${chefAToken}` },
      body: JSON.stringify({ targetStatus: 'chef_en_route' }),
    });
    assert.strictEqual(enRoute.status, 200);

    const arrived = await request(`/api/bookings/${bookingId}/status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${chefAToken}` },
      body: JSON.stringify({ targetStatus: 'chef_arrived' }),
    });
    assert.strictEqual(arrived.status, 200);
    assert.strictEqual(arrived.data.booking.status, 'chef_arrived');
  });

  await test('Doorstep OTP verification rejects invalid code', async () => {
    const res = await request(`/api/bookings/${bookingId}/verify-otp`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${chefAToken}` },
      body: JSON.stringify({ otp: '0000' }), // Wrong code
    });
    assert.strictEqual(res.status, 400);
  });

  await test('Doorstep OTP verification succeeds with correct code', async () => {
    const res = await request(`/api/bookings/${bookingId}/verify-otp`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${chefAToken}` },
      body: JSON.stringify({ otp: bookingOtp }),
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.booking.status, 'otp_verified');
  });

  await test('Chef starts service and completes shift', async () => {
    const start = await request(`/api/bookings/${bookingId}/status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${chefAToken}` },
      body: JSON.stringify({ targetStatus: 'service_started' }),
    });
    assert.strictEqual(start.status, 200);

    const complete = await request(`/api/bookings/${bookingId}/status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${chefAToken}` },
      body: JSON.stringify({ targetStatus: 'completed' }),
    });
    assert.strictEqual(complete.status, 200);
    assert.strictEqual(complete.data.booking.status, 'completed');
  });

  // 10. REWARD BALANCE INTEGRITY
  console.log('\n--- 10. Reward Balance Integrity ---');
  await test('Customer CANNOT arbitrarily modify their own reward balance', async () => {
    // Verify there is no client endpoint that allows arbitrary balance setting
    const res = await request('/api/rewards/credit', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` }, // Customer trying to call admin credit
      body: JSON.stringify({ targetUserId: customerAId, points: 999999 }),
    });
    assert.strictEqual(res.status, 403); // Forbidden
  });

  await test('Admin credits reward points to Customer A', async () => {
    // Customer A has 150 points accumulated from 3 legitimate payment captures (50 pts each)
    const currentPoints = queryOne<any>('SELECT total_points FROM reward_accounts WHERE user_id = ?', [customerAId]).total_points;
    const res = await request('/api/rewards/credit', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ targetUserId: customerAId, points: 500, reason: 'Special Promotion Bonus' }),
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.newTotalPoints, currentPoints + 500);
  });

  await test('Customer redeems perk with server balance deduction', async () => {
    const preRedeemPoints = queryOne<any>('SELECT total_points FROM reward_accounts WHERE user_id = ?', [customerAId]).total_points;
    const res = await request('/api/rewards/redeem', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({ pointsCost: 400, perkTitle: '₹1,500 Catering Discount' }),
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.newTotalPoints, preRedeemPoints - 400);
  });

  await test('Customer cannot overdraft reward points (Insufficient Balance Blocked)', async () => {
    const res = await request('/api/rewards/redeem', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerAToken}` },
      body: JSON.stringify({ pointsCost: 9999, perkTitle: 'BBQ Grill Perk' }),
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.error.code, 'INSUFFICIENT_POINTS');
  });

  // 11. AUDIT LOGGING VERIFICATION
  console.log('\n--- 11. Immutable Audit Logging Verification ---');
  await test('Verify immutable audit log records events across all payment and lifecycle actions', async () => {
    const logs = await query('SELECT * FROM audit_logs ORDER BY created_at DESC');
    assert.ok(logs.length >= 15);

    const eventTypes = logs.map((l: any) => l.event_type);
    assert.ok(eventTypes.includes('account_created'));
    assert.ok(eventTypes.includes('login'));
    assert.ok(eventTypes.includes('booking_created'));
    assert.ok(eventTypes.includes('booking_status_changed'));
    assert.ok(eventTypes.includes('reward_transaction'));

    // Verify all payment-specific audit log events required by Step 2 Hardening
    assert.ok(eventTypes.includes('payment_intent_created'), 'payment_intent_created must be logged');
    assert.ok(eventTypes.includes('payment_confirmation_attempted'), 'payment_confirmation_attempted must be logged');
    assert.ok(eventTypes.includes('payment_captured'), 'payment_captured must be logged');
    assert.ok(eventTypes.includes('payment_failed'), 'payment_failed must be logged');
    assert.ok(eventTypes.includes('duplicate_payment_event'), 'duplicate_payment_event must be logged');
    assert.ok(eventTypes.includes('invalid_payment_signature'), 'invalid_payment_signature must be logged');
    assert.ok(eventTypes.includes('refund_requested'), 'refund_requested must be logged');
    assert.ok(eventTypes.includes('refund_completed'), 'refund_completed must be logged');
  });

  // Clean up
  server.close();

  console.log('\n========================================');
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

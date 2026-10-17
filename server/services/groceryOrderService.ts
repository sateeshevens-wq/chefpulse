import crypto from 'crypto';
import { query, queryOne, run } from '../db/database.js';
import { config } from '../config.js';
import { RazorpayProvider } from './razorpayProvider.js';
import { AuditService } from './auditService.js';

export type GroceryOrderStatus = 'created' | 'payment_pending' | 'paid' | 'out_for_delivery' | 'delivered_to_customer' | 'cancelled';
export type GroceryPartner = 'zepto' | 'blinkit' | 'bigbasket';

export interface GroceryItemInput { id: string; name: string; packSize?: string; quantity?: number; pricePaise: number; }

const assertPartner: (partner: string) => asserts partner is GroceryPartner = (partner: string): asserts partner is GroceryPartner => {
  if (!['zepto', 'blinkit', 'bigbasket'].includes(partner)) throw new Error('Unsupported grocery delivery partner.');
};

export class GroceryOrderService {
  static async create(params: {
    bookingId: string; customerId: string; partner: string; address: string; area: string; items: GroceryItemInput[]; totalPaise: number;
  }) {
    assertPartner(params.partner);
    const booking = await queryOne<any>('SELECT * FROM bookings WHERE id = ?', [params.bookingId]);
    if (!booking) return { statusCode: 404, data: { success: false, error: { code: 'BOOKING_NOT_FOUND', message: 'Booking not found.' } } };
    if (booking.customer_id !== params.customerId) return { statusCode: 403, data: { success: false, error: { code: 'FORBIDDEN', message: 'You do not own this booking.' } } };
    if (!['accepted', 'chef_en_route', 'chef_arrived', 'otp_verified', 'service_started'].includes(booking.status)) {
      return { statusCode: 409, data: { success: false, error: { code: 'INVALID_BOOKING_STATE', message: 'Your chef must accept the request before ingredients can be ordered.' } } };
    }
    if (!Array.isArray(params.items) || params.items.length === 0 || !Number.isInteger(params.totalPaise) || params.totalPaise <= 0) {
      return { statusCode: 400, data: { success: false, error: { code: 'INVALID_GROCERY_CART', message: 'A valid ingredient cart is required.' } } };
    }
    const serverTotal = params.items.reduce((sum, item) => sum + Math.max(0, Math.round(item.pricePaise)) * Math.max(1, item.quantity || 1), 0);
    if (serverTotal !== params.totalPaise) return { statusCode: 400, data: { success: false, error: { code: 'TOTAL_MISMATCH', message: 'Ingredient total does not match the selected items.' } } };

    const existing = await queryOne<any>(`SELECT * FROM grocery_orders WHERE booking_id = ? AND customer_id = ? AND status NOT IN ('cancelled') ORDER BY created_at DESC LIMIT 1`, [params.bookingId, params.customerId]);
    if (existing) return { statusCode: 200, data: { success: true, order: existing, reused: true } };

    const id = `groc-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    await run(`INSERT INTO grocery_orders (id, booking_id, customer_id, partner, address, area, items_json, total_paise, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'created', datetime('now'), datetime('now'))`, [
      id, params.bookingId, params.customerId, params.partner, params.address, params.area, JSON.stringify(params.items), params.totalPaise,
    ]);
    await AuditService.log({ eventType: 'grocery_order_created', userId: params.customerId, userRole: 'customer', targetType: 'grocery_order', targetId: id, details: { bookingId: params.bookingId, partner: params.partner, totalPaise: params.totalPaise } });
    return { statusCode: 201, data: { success: true, order: await queryOne<any>('SELECT * FROM grocery_orders WHERE id = ?', [id]) } };
  }

  static async createPaymentIntent(orderId: string, customerId: string) {
    const order = await queryOne<any>('SELECT * FROM grocery_orders WHERE id = ?', [orderId]);
    if (!order) return { statusCode: 404, data: { success: false, error: { code: 'GROCERY_ORDER_NOT_FOUND', message: 'Grocery order not found.' } } };
    if (order.customer_id !== customerId) return { statusCode: 403, data: { success: false, error: { code: 'FORBIDDEN', message: 'You do not own this grocery order.' } } };
    if (order.status === 'paid' || order.status === 'out_for_delivery' || order.status === 'delivered_to_customer') return { statusCode: 200, data: { success: true, order, alreadyPaid: true } };
    if (config.env === 'production' && config.paymentProvider === 'simulation') throw new Error('PRODUCTION_GATEWAY_NOT_CONFIGURED: Grocery payments require a live payment gateway.');
    const existing = await queryOne<any>(`SELECT * FROM grocery_order_payments WHERE grocery_order_id = ? AND status IN ('pending','created') ORDER BY created_at DESC LIMIT 1`, [orderId]);
    if (existing) return { statusCode: 200, data: { success: true, payment: this.paymentResponse(existing) } };
    const paymentId = `gpay-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const transactionRef = `GROC-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    let providerOrderId: string | null = null;
    if (config.paymentProvider === 'razorpay') {
      if (!RazorpayProvider.isConfigured()) throw new Error('RAZORPAY_NOT_CONFIGURED: Live payment is unavailable until Razorpay server credentials are configured.');
      const orderResult = await RazorpayProvider.createOrder(order.total_paise, transactionRef);
      providerOrderId = orderResult.id;
    } else providerOrderId = `order_${config.paymentProvider}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    await run(`INSERT INTO grocery_order_payments (id, grocery_order_id, customer_id, amount_paise, currency, provider, provider_order_id, transaction_ref, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'INR', ?, ?, ?, 'pending', datetime('now'), datetime('now'))`, [paymentId, orderId, customerId, order.total_paise, config.paymentProvider, providerOrderId, transactionRef]);
    await run(`UPDATE grocery_orders SET status='payment_pending', updated_at=datetime('now') WHERE id=?`, [orderId]);
    const payment = await queryOne<any>('SELECT * FROM grocery_order_payments WHERE id = ?', [paymentId]);
    return { statusCode: 200, data: { success: true, payment: this.paymentResponse(payment) } };
  }

  static async confirmPayment(params: { paymentId: string; customerId: string; providerPaymentId?: string; signature?: string }) {
    const payment = await queryOne<any>('SELECT * FROM grocery_order_payments WHERE id = ?', [params.paymentId]);
    if (!payment) return { statusCode: 404, data: { success: false, error: { code: 'PAYMENT_NOT_FOUND', message: 'Grocery payment not found.' } } };
    if (payment.customer_id !== params.customerId) return { statusCode: 403, data: { success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized grocery payment confirmation.' } } };
    if (payment.status === 'captured') return { statusCode: 200, data: { success: true, paymentStatus: 'captured', isDuplicate: true, order: await queryOne<any>('SELECT * FROM grocery_orders WHERE id=?', [payment.grocery_order_id]) } };
    if (config.paymentProvider === 'razorpay') {
      if (!params.providerPaymentId || !params.signature) return { statusCode: 400, data: { success: false, error: { code: 'PROVIDER_SIGNATURE_REQUIRED', message: 'Razorpay payment verification is required.' } } };
      if (!payment.provider_order_id || !RazorpayProvider.verifyCheckoutSignature(payment.provider_order_id, params.providerPaymentId, params.signature)) return { statusCode: 400, data: { success: false, error: { code: 'INVALID_SIGNATURE', message: 'Payment verification signature invalid.' } } };
      const providerPayment = await RazorpayProvider.fetchPayment(params.providerPaymentId);
      if (providerPayment.order_id && providerPayment.order_id !== payment.provider_order_id) return { statusCode: 400, data: { success: false, error: { code: 'PROVIDER_ORDER_MISMATCH', message: 'Payment does not belong to this grocery order.' } } };
      if (providerPayment.amount !== payment.amount_paise || providerPayment.currency !== 'INR') return { statusCode: 400, data: { success: false, error: { code: 'PROVIDER_AMOUNT_MISMATCH', message: 'Payment amount does not match the ingredient order.' } } };
      if (providerPayment.status !== 'captured' && providerPayment.captured !== true) return { statusCode: 400, data: { success: false, error: { code: 'PAYMENT_NOT_CAPTURED', message: 'Razorpay payment is not captured.' } } };
    }
    await run(`UPDATE grocery_order_payments SET status='captured', provider_payment_id=?, updated_at=datetime('now') WHERE id=?`, [params.providerPaymentId || null, params.paymentId]);
    await run(`UPDATE grocery_orders SET status='paid', updated_at=datetime('now') WHERE id=?`, [payment.grocery_order_id]);
    await AuditService.log({ eventType: 'grocery_payment_captured', userId: params.customerId, userRole: 'customer', targetType: 'grocery_order', targetId: payment.grocery_order_id, details: { paymentId: params.paymentId, providerPaymentId: params.providerPaymentId } });
    return { statusCode: 200, data: { success: true, paymentStatus: 'captured', order: await queryOne<any>('SELECT * FROM grocery_orders WHERE id=?', [payment.grocery_order_id]) } };
  }

  static async updateStatus(orderId: string, status: GroceryOrderStatus, actorId: string, actorRole: 'customer'|'admin'|'support'|'system' = 'customer') {
    const order = await queryOne<any>('SELECT * FROM grocery_orders WHERE id=?', [orderId]);
    if (!order) return { statusCode: 404, data: { success: false, error: { code: 'NOT_FOUND', message: 'Grocery order not found.' } } };
    if (actorRole !== 'system' && !['admin','support'].includes(actorRole) && order.customer_id !== actorId) return { statusCode: 403, data: { success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized grocery order.' } } };
    if (['out_for_delivery','delivered_to_customer'].includes(status) && !['system','admin','support'].includes(actorRole)) return { statusCode: 403, data: { success: false, error: { code: 'PROVIDER_CONFIRMATION_REQUIRED', message: 'Delivery status can only be confirmed by the delivery partner or an authorized operations user.' } } };
    const allowed: Record<GroceryOrderStatus, GroceryOrderStatus[]> = { created:['payment_pending','cancelled'], payment_pending:['paid','cancelled'], paid:['out_for_delivery','cancelled'], out_for_delivery:['delivered_to_customer'], delivered_to_customer:[], cancelled:[] };
    if (!allowed[order.status as GroceryOrderStatus]?.includes(status)) return { statusCode: 409, data: { success: false, error: { code: 'INVALID_GROCERY_STATE', message: `Cannot move grocery order from ${order.status} to ${status}.` } } };
    await run(`UPDATE grocery_orders SET status=?, updated_at=datetime('now'), delivered_at=CASE WHEN ?='delivered_to_customer' THEN datetime('now') ELSE delivered_at END WHERE id=?`, [status, status, orderId]);
    return { statusCode: 200, data: { success: true, order: await queryOne<any>('SELECT * FROM grocery_orders WHERE id=?', [orderId]) } };
  }

  private static paymentResponse(payment: any) { return { id: payment.id, groceryOrderId: payment.grocery_order_id, amountPaise: payment.amount_paise, currency: payment.currency, provider: payment.provider, providerOrderId: payment.provider_order_id, transactionRef: payment.transaction_ref, providerKeyId: config.paymentProvider === 'razorpay' ? RazorpayProvider.getPublicKeyId() : undefined, status: payment.status }; }
}

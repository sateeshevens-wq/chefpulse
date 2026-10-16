import crypto from 'crypto';
import { config } from '../../config.js';

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status?: string;
  receipt?: string;
}

interface RazorpayPayment {
  id: string;
  order_id?: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed' | string;
  captured?: boolean;
}

function requireCredentials(): { keyId: string; keySecret: string } {
  if (!config.razorpayKeyId || !config.razorpayKeySecret) {
    throw new Error('RAZORPAY_NOT_CONFIGURED: Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on the server.');
  }
  return { keyId: config.razorpayKeyId, keySecret: config.razorpayKeySecret };
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const { keyId, keySecret } = requireCredentials();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let payload: any = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { error: { description: text || 'Empty provider response' } };
  }

  if (!response.ok) {
    const message = payload?.error?.description || payload?.error?.reason || `Razorpay request failed (${response.status})`;
    throw new Error(`RAZORPAY_API_ERROR: ${message}`);
  }

  return payload as T;
}

export class RazorpayProvider {
  static isConfigured(): boolean {
    return Boolean(config.razorpayKeyId && config.razorpayKeySecret);
  }

  static getPublicKeyId(): string {
    return requireCredentials().keyId;
  }

  static async createOrder(amountPaise: number, receipt: string): Promise<RazorpayOrder> {
    return request<RazorpayOrder>('POST', '/orders', {
      amount: amountPaise,
      currency: 'INR',
      receipt,
      payment_capture: 1,
    });
  }

  static verifyCheckoutSignature(orderId: string, paymentId: string, signature: string): boolean {
    const { keySecret } = requireCredentials();
    const expected = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(signature, 'utf8'));
    } catch {
      return false;
    }
  }

  static async fetchPayment(paymentId: string): Promise<RazorpayPayment> {
    return request<RazorpayPayment>('GET', `/payments/${encodeURIComponent(paymentId)}`);
  }

  static async listPaymentRefunds(paymentId: string): Promise<{ items: Array<{ id: string; amount: number; status?: string }> }> {
    return request<{ items: Array<{ id: string; amount: number; status?: string }> }>('GET', `/payments/${encodeURIComponent(paymentId)}/refunds`);
  }

  static async refundPayment(paymentId: string, amountPaise: number, receipt: string): Promise<{ id: string; amount: number; status?: string }> {
    return request<{ id: string; amount: number; status?: string }>('POST', `/payments/${encodeURIComponent(paymentId)}/refund`, {
      amount: amountPaise,
      receipt,
    });
  }
}

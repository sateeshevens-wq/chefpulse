export interface RazorpayCheckoutPayment {
  id: string;
  amountPaise: number;
  currency: string;
  providerOrderId: string;
  providerKeyId: string;
  bookingId: string;
  name?: string;
  email?: string;
  phone?: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, any>) => { open: () => void };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Unable to load secure payment checkout.')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load secure payment checkout.'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export async function openRazorpayCheckout(
  payment: RazorpayCheckoutPayment,
  onSuccess: (result: { paymentId: string; orderId: string; signature: string }) => Promise<void>,
  onFailure?: (message: string) => void,
): Promise<void> {
  await loadRazorpayScript();
  if (!window.Razorpay) throw new Error('Secure payment checkout is unavailable on this device.');

  await new Promise<void>((resolve, reject) => {
    const checkout = new window.Razorpay!({
      key: payment.providerKeyId,
      amount: payment.amountPaise,
      currency: payment.currency || 'INR',
      name: 'ChefPulse',
      description: `Chef service booking ${payment.bookingId}`,
      order_id: payment.providerOrderId,
      prefill: {
        name: payment.name,
        email: payment.email,
        contact: payment.phone,
      },
      theme: { color: '#f59e0b' },
      modal: {
        ondismiss: () => {
          const message = 'Payment window closed. Your booking is still unpaid.';
          onFailure?.(message);
          reject(new Error(message));
        },
      },
      handler: async (response: any) => {
        try {
          await onSuccess({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      },
    });

    checkout.open();
  });
}

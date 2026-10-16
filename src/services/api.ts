// ChefPulse Frontend API Client
// Connects to the Express & SQLite backend foundation at /api/*

const TOKEN_KEY = 'chefpulse_auth_token';
const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function removeStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: { code: string; message: string } }> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
    const json = await res.json().catch(() => ({}));

    if (!res.ok || json.success === false) {
      return {
        success: false,
        error: json.error || { code: `HTTP_${res.status}`, message: res.statusText },
      };
    }

    return { success: true, data: json };
  } catch (err: any) {
    return {
      success: false,
      error: { code: 'NETWORK_ERROR', message: err.message || 'Network request failed' },
    };
  }
}

export const api = {
  // Authentication
  async login(phoneOrEmail: string, password: string) {
    const isEmail = phoneOrEmail.includes('@');
    const res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        phone: !isEmail ? phoneOrEmail : undefined,
        email: isEmail ? phoneOrEmail : undefined,
        password,
      }),
    });

    if (res.success && res.data?.token) {
      setStoredToken(res.data.token);
    }
    return res;
  },

  async register(payload: {
    phone: string;
    password: string;
    name: string;
    email?: string;
    role?: 'customer' | 'chef';
    cityId?: string;
    cityName?: string;
    address?: string;
    lat?: number;
    lng?: number;
    experienceYears?: number;
    specialties?: string[];
    bio?: string;
    hourlyRate?: number;
    sosRate?: number;
    dayPrepRate?: number;
    shiftRate?: number;
    signatureDishes?: string[];
  }) {
    const res = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        password: payload.password,
      }),
    });

    if (res.success && res.data?.token) {
      setStoredToken(res.data.token);
    }
    return res;
  },

  async getMe() {
    return apiRequest('/api/auth/me');
  },

  // Push notifications
  async registerPushToken(payload: { token: string; platform: 'web' | 'android' | 'ios'; deviceId?: string }) {
    return apiRequest('/api/notifications/push-token', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getNotifications() {
    return apiRequest('/api/notifications');
  },

  async markNotificationRead(id: string) {
    return apiRequest(`/api/notifications/${encodeURIComponent(id)}/read`, { method: 'PUT' });
  },

  logout() {
    removeStoredToken();
  },

  // Chefs
  async getChefs(cityId?: string, options?: { search?: string; specialty?: string; minRating?: number; availableOnly?: boolean }) {
    const params = new URLSearchParams();
    if (cityId) params.set('cityId', cityId);
    if (options?.search) params.set('search', options.search);
    if (options?.specialty) params.set('specialty', options.specialty);
    if (options?.minRating !== undefined) params.set('minRating', String(options.minRating));
    if (options?.availableOnly) params.set('availableOnly', 'true');
    const query = params.toString();
    return apiRequest(`/api/chefs${query ? `?${query}` : ''}`);
  },

  async getChef(id: string) {
    return apiRequest(`/api/chefs/${id}`);
  },

  async updateChefStatus(chefId: string, isOnline: boolean, status?: string) {
    return apiRequest(`/api/chefs/${chefId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isOnline, status }),
    });
  },

  // Bookings (Server-Authoritative)
  async createBooking(payload: {
    chefId: string;
    type?: 'sos_quick_fix' | 'scheduled_prep' | 'b2b_gig_shift';
    scheduledTime?: string;
    dishesRequested: string;
    specialInstructions?: string;
    serviceAddress?: string;
    area?: string;
    lat?: number;
    lng?: number;
    surgeCondition?: string;
    guestCount?: number;
  }) {
    return apiRequest('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getBookings() {
    return apiRequest('/api/bookings');
  },

  async getBooking(id: string) {
    return apiRequest(`/api/bookings/${id}`);
  },

  async updateBookingStatus(id: string, targetStatus: string, reason?: string, payload?: any) {
    return apiRequest(`/api/bookings/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ targetStatus, reason, payload }),
    });
  },

  async verifyOtp(id: string, otp: string) {
    return apiRequest(`/api/bookings/${id}/verify-otp`, {
      method: 'POST',
      body: JSON.stringify({ otp }),
    });
  },

  async cancelBooking(id: string, reason?: string) {
    return apiRequest(`/api/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // Grocery fulfillment (V19): ingredient order is a separate payment/resource from chef service.
  async createGroceryOrder(payload: { bookingId: string; partner: 'zepto' | 'blinkit' | 'bigbasket'; address: string; area: string; items: Array<{ id: string; name: string; packSize?: string; quantity?: number; pricePaise: number }>; totalPaise: number }) {
    return apiRequest('/api/grocery/orders', { method: 'POST', body: JSON.stringify(payload) });
  },
  async createGroceryPaymentIntent(orderId: string) {
    return apiRequest(`/api/grocery/orders/${encodeURIComponent(orderId)}/payment-intent`, { method: 'POST' });
  },
  async confirmGroceryPayment(paymentId: string, providerPaymentId?: string, signature?: string) {
    return apiRequest('/api/grocery/payments/confirm', { method: 'POST', body: JSON.stringify({ paymentId, providerPaymentId, signature }) });
  },
  async getGroceryOrder(orderId: string) {
    return apiRequest(`/api/grocery/orders/${encodeURIComponent(orderId)}`);
  },
  async updateGroceryOrderStatus(orderId: string, status: string) {
    return apiRequest(`/api/grocery/orders/${encodeURIComponent(orderId)}/status`, { method: 'POST', body: JSON.stringify({ status }) });
  },

  async disputeBooking(id: string, reason: string) {
    return apiRequest(`/api/bookings/${id}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // Payments & Escrow (Server-Authoritative)
  async createPaymentIntent(bookingId: string, method = 'upi', idempotencyKey?: string) {
    return apiRequest('/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ bookingId, method, idempotencyKey }),
    });
  },

  async confirmPayment(paymentId: string, transactionRef: string, signature?: string, idempotencyKey?: string, providerPaymentId?: string) {
    return apiRequest('/api/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentId, transactionRef, providerPaymentId, signature, idempotencyKey }),
    });
  },

  async failPayment(paymentId: string, reason?: string) {
    return apiRequest('/api/payments/fail', {
      method: 'POST',
      body: JSON.stringify({ paymentId, reason }),
    });
  },

  async refundPayment(bookingId: string, amount?: number, reason?: string) {
    return apiRequest('/api/payments/refund', {
      method: 'POST',
      body: JSON.stringify({ bookingId, amount, reason }),
    });
  },

  // Rewards
  async getRewards() {
    return apiRequest('/api/rewards');
  },

  async redeemPerk(pointsCost: number, perkTitle: string) {
    return apiRequest('/api/rewards/redeem', {
      method: 'POST',
      body: JSON.stringify({ pointsCost, perkTitle }),
    });
  },

  // Admin & Audit
  async getAuditLogs(limit = 100, offset = 0) {
    return apiRequest(`/api/admin/audit-logs?limit=${limit}&offset=${offset}`);
  },

  async getAdminStats() {
    return apiRequest('/api/admin/stats');
  },
};

import { api } from './api';

// ─── Types ─────────────────────────────────────────────────────────────────

export type SubscriptionStatus =
  | 'TRIAL'
  | 'TRIAL_EXPIRED'
  | 'PENDING'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'EXPIRED'
  | 'LIFETIME';

export type PaymentMethod = 'PIX' | 'CARD' | 'BOLETO';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CHARGEBACK' | 'EXPIRED_CHECKOUT';

export interface Plan {
  id: string;
  name: string;
  slug: string;
  durationDays: number | null;
  priceInCents: number;
  isRecurring: boolean;
  isLifetime: boolean;
  isActive: boolean;
  displayOrder: number;
  features?: string[];
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string | null;
  status: SubscriptionStatus;
  startedAt: string | null;
  expiresAt: string | null;
  canceledAt: string | null;
  gracePeriodEndsAt: string | null;
  plan?: Plan | null;
}

export interface AccessStatus {
  canAccess: boolean;
  status: SubscriptionStatus | null;
  isTrial: boolean;
  isWarning: boolean;
  expiresAt: string | null;
  gracePeriodEndsAt: string | null;
}

export interface CheckoutResponse {
  paymentId: string;
  subscriptionId: string;
  pixCode: string | null;
  pixQrCode: string | null;
  expiresAt: string | null;
}

// ─── Service ────────────────────────────────────────────────────────────────

export const subscriptionService = {
  async getPlans(): Promise<Plan[]> {
    const response = await api.get<Plan[]>('/plans');
    return response.data;
  },

  async getAccessStatus(): Promise<AccessStatus> {
    const response = await api.get<AccessStatus>('/subscriptions/access-status');
    return response.data;
  },

  async getCurrentSubscription(): Promise<{ subscription: Subscription | null }> {
    const response = await api.get<{ subscription: Subscription | null }>('/subscriptions/current');
    return response.data;
  },

  async getHistory(): Promise<{ subscriptions: Subscription[] }> {
    const response = await api.get<{ subscriptions: Subscription[] }>('/subscriptions/history');
    return response.data;
  },

  async checkout(planId: string, method: PaymentMethod): Promise<CheckoutResponse> {
    const response = await api.post<CheckoutResponse>('/subscriptions/checkout', { planId, method });
    return response.data;
  },

  async cancel(reason?: string): Promise<void> {
    await api.post('/subscriptions/cancel', { reason });
  },
};

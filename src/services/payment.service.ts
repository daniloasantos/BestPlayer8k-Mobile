import { api } from './api';
import type { PaymentStatus, PaymentMethod } from './subscription.service';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface Payment {
  id: string;
  subscriptionId: string;
  userId: string;
  amountInCents: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  gatewayPaymentId: string | null;
  pixCode: string | null;
  pixQrCode: string | null;
  paidAt: string | null;
  expiresAt: string | null;
  failureReason: string | null;
  createdAt: string;
}

export interface PaginatedPayments {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
}

// ─── Service ────────────────────────────────────────────────────────────────

export const paymentService = {
  async getPayment(id: string): Promise<Payment> {
    const response = await api.get<Payment>(`/payments/${id}`);
    return response.data;
  },

  async getMyPayments(page = 1, limit = 20): Promise<PaginatedPayments> {
    const response = await api.get<PaginatedPayments>('/payments/my', {
      params: { page, limit },
    });
    return response.data;
  },

  async regeneratePix(paymentId: string): Promise<{ pixCode: string; pixQrCode: string; expiresAt: string }> {
    const response = await api.post(`/payments/${paymentId}/pix`);
    return response.data;
  },
};

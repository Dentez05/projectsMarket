import { api } from './client';
import type { ApiPaymentResponse } from './types';

export const paymentsApi = {
  create: (orderId: number) =>
    api.post<ApiPaymentResponse>('/Payment/create', { orderId }),

  checkStatus: (paymentId: string) =>
    api.get<{ status: string }>(`/Payment/status/${paymentId}`),
};

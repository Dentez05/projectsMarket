import { api } from './client';

export const paymentsApi = {
  create: (orderId: number) =>
    api.post<{ paymentId: string; confirmationUrl: string }>(`/Payments/orders/${orderId}`),

  checkOrderStatus: (orderId: number) =>
    api.get<{ status: string }>(`/Payments/check/${orderId}`),
};

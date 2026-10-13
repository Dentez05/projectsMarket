import { api } from './client';
import type { ApiOrder } from './types';

export const ordersApi = {
  getAll: () => api.get<ApiOrder[]>('/Orders'),

  getById: (id: number) => api.get<ApiOrder>(`/Orders/${id}`),

  create: (comment?: string, promoCode?: string) =>
    api.post<ApiOrder>('/Orders', {
      comment: comment || null,
      promoCode: promoCode?.trim() || null,
    }),

  updateStatus: (id: number, status: string) =>
    api.patch<{ status: string }>(`/Orders/${id}/status`, { status }),
};

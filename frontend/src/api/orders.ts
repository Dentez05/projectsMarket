import { api } from './client';
import type { ApiOrder } from './types';

export const ordersApi = {
  getAll: () => api.get<ApiOrder[]>('/Orders'),

  getById: (id: number) => api.get<ApiOrder>(`/Orders/${id}`),

  create: (comment?: string) =>
    api.post<ApiOrder>('/Orders', { comment: comment || null }),
};

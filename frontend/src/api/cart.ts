import { api } from './client';
import type { ApiCartResponse } from './types';

export const cartApi = {
  get: () => api.get<ApiCartResponse>('/Cart'),

  add: (projectId: number) =>
    api.post<{ message: string }>('/Cart', { projectId }),

  remove: (projectId: number) =>
    api.delete<void>(`/Cart/${projectId}`),

  clear: () => api.delete<void>('/Cart'),
};

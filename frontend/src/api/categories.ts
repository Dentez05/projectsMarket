import { api } from './client';
import type { ApiCategory } from './types';

export const categoriesApi = {
  getAll: () => api.get<ApiCategory[]>('/Categories'),

  create: (data: { name: string; description: string }) =>
    api.post<ApiCategory>('/Categories', data),

  update: (id: number, data: { name: string; description: string }) =>
    api.put<ApiCategory>(`/Categories/${id}`, data),

  delete: (id: number) =>
    api.delete<void>(`/Categories/${id}`),
};

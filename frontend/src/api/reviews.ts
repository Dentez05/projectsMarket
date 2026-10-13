import { api } from './client';
import type { ApiReview } from './types';

export const reviewsApi = {
  getByProject: (projectId: number) =>
    api.get<ApiReview[]>(`/Reviews/project/${projectId}`),

  create: (projectId: number, data: { rating: number; comment?: string }) =>
    api.post<ApiReview>(`/Reviews/project/${projectId}`, data),

  update: (id: number, data: { rating: number; comment?: string }) =>
    api.put<{ ok: boolean }>(`/Reviews/${id}`, data),

  delete: (id: number) =>
    api.delete<void>(`/Reviews/${id}`),
};

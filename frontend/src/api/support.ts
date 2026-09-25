import { api } from './client';
import type { ApiSupportTicket } from './types';

export const supportApi = {
  create: (subject: string, message: string) =>
    api.post<ApiSupportTicket>('/Support', { subject, message }),

  getMy: () => api.get<ApiSupportTicket[]>('/Support/my'),

  getAll: () => api.get<ApiSupportTicket[]>('/Support'),

  reply: (id: number, reply: string) =>
    api.patch<ApiSupportTicket>(`/Support/${id}/reply`, { reply }),

  close: (id: number) =>
    api.patch<ApiSupportTicket>(`/Support/${id}/close`),
};

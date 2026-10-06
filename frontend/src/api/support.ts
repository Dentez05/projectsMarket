import { api } from './client';
import type { ApiSupportTicket } from './types';

export const supportApi = {
  create: (subject: string, message: string) =>
    api.post<ApiSupportTicket>('/Support', { subject, message }),

  getMy: () => api.get<ApiSupportTicket[]>('/Support/my'),

  getAll: () => api.get<ApiSupportTicket[]>('/Support'),

  getById: (id: number) =>
    api.get<ApiSupportTicket>(`/Support/${id}`),

  sendMessage: (id: number, body: string) =>
    api.post<ApiSupportTicket>(`/Support/${id}/messages`, { body }),

  markRead: (id: number) =>
    api.post<ApiSupportTicket>(`/Support/${id}/read`),

  close: (id: number) =>
    api.patch<ApiSupportTicket>(`/Support/${id}/close`),
};

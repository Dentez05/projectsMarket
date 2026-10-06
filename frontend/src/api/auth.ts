import { api } from './client';
import type { AuthResponse } from './types';

export const authApi = {
  register: (data: { email: string; password: string; fullName: string }) =>
    api.post<AuthResponse>('/Auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/Auth/login', data),

  getProfile: () => api.get<AuthResponse['user']>('/Auth/profile'),

  refresh: () => api.post<AuthResponse>('/Auth/refresh'),

  logout: () => api.post<{ ok: boolean }>('/Auth/logout'),
};

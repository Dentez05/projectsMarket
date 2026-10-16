import { api } from './client';
import type { ApiPromoCode, PromoValidationResponse } from './types';

export const promoCodesApi = {
  getAll: () => api.get<ApiPromoCode[]>('/PromoCodes'),

  validate: (code: string, subtotal: number) =>
    api.post<PromoValidationResponse>('/PromoCodes/validate', { code, subtotal }),

  create: (data: { code: string; type: 'Percent' | 'Fixed'; value: number; minOrderAmount?: number; maxUses?: number; expiresAt?: string }) =>
    api.post<ApiPromoCode>('/PromoCodes', data),

  update: (id: number, data: Partial<{ value: number; minOrderAmount: number | null; maxUses: number | null; expiresAt: string | null; isActive: boolean }>) =>
    api.put<ApiPromoCode>(`/PromoCodes/${id}`, data),

  remove: (id: number) => api.delete<void>(`/PromoCodes/${id}`),
};

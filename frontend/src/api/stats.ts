import { fetchWithAuth } from './client';

const BASE = import.meta.env.VITE_API_URL || '/api';

export interface StatsSummary {
  totalOrders: number;
  totalRevenue: number;
  totalBuyers: number;
  totalProjects: number;
  pendingOrders: number;
  openTickets: number;
  avgRating: number;
  reviewCount: number;
}

export interface SalesPoint {
  date: string;
  orders: number;
  revenue: number;
}

export interface TopProject {
  projectId: number;
  title: string;
  sold: number;
  revenue: number;
}

export const statsApi = {
  async getSummary(): Promise<StatsSummary> {
    const res = await fetchWithAuth(`${BASE}/Stats/summary`);
    if (!res.ok) throw new Error('Не удалось загрузить статистику');
    return res.json();
  },

  async getSales(days = 30): Promise<{ days: number; series: SalesPoint[] }> {
    const res = await fetchWithAuth(`${BASE}/Stats/sales?days=${days}`);
    if (!res.ok) throw new Error('Не удалось загрузить продажи');
    return res.json();
  },

  async getTopProjects(limit = 10): Promise<TopProject[]> {
    const res = await fetchWithAuth(`${BASE}/Stats/top-projects?limit=${limit}`);
    if (!res.ok) throw new Error('Не удалось загрузить топ проектов');
    return res.json();
  },
};

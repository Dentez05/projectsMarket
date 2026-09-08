import { api } from './client';
import type { ApiProject, CreateProjectRequest } from './types';

export const projectsApi = {
  getAll: () => api.get<ApiProject[]>('/Projects'),

  getById: (id: number) => api.get<ApiProject>(`/Projects/${id}`),

  create: (data: CreateProjectRequest) =>
    api.post<ApiProject>('/Projects', data),

  update: (id: number, data: Partial<CreateProjectRequest>) =>
    api.put<ApiProject>(`/Projects/${id}`, data),

  delete: (id: number) =>
    api.delete<void>(`/Projects/${id}`),
};

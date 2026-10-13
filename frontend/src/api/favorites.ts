import { api } from './client';

export const favoritesApi = {
  getMy: () => api.get<number[]>('/Favorites'),

  toggle: (projectId: number) =>
    api.post<{ favorited: boolean }>(`/Favorites/${projectId}`),
};

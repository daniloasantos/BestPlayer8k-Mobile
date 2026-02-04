import { api } from './api';
import type { Channel, FavoritesStats } from '@/types';

export const favoritesService = {
  async getFavorites(): Promise<Channel[]> {
    const response = await api.get<Channel[]>('/favorites');
    return response.data;
  },

  async toggleFavorite(channelId: string): Promise<{ isFavorite: boolean }> {
    const response = await api.post<{ isFavorite: boolean }>(`/favorites/${channelId}/toggle`);
    return response.data;
  },

  async addFavorite(channelId: string): Promise<void> {
    await api.post(`/favorites/${channelId}`);
  },

  async removeFavorite(channelId: string): Promise<void> {
    await api.delete(`/favorites/${channelId}`);
  },

  async getFavoritesStats(): Promise<FavoritesStats> {
    const response = await api.get<FavoritesStats>('/favorites/stats');
    return response.data;
  },
};

import { api } from './api';
import type { Channel } from '@/types';

// Helper para transformar canal do backend para o formato do mobile
const transformChannel = (item: any): Channel => ({
  id: item.id,
  name: item.name,
  logo: item.logo,
  quality: item.quality,
  category: item.group || item.Category?.name || '',
  categoryId: item.categoryId || item.Category?.id || '',
  streamUrl: item.url,
  isFavorite: item.isFavorite ?? true,
  type: item.type,
  description: item.description,
  poster: item.poster || item.logo,
});

export const favoritesService = {
  async getFavorites(): Promise<Channel[]> {
    const response = await api.get<any[]>('/favorites');
    return (response.data || []).map(transformChannel);
  },

  async toggleFavorite(channelId: string): Promise<{ isFavorite: boolean }> {
    const response = await api.post<any>('/favorites/toggle', { channelId });
    // Backend retorna { message: 'Channel added/removed to favorites' }
    const isAdded = response.data.message?.includes('added');
    return { isFavorite: isAdded };
  },

  async addFavorite(channelId: string): Promise<void> {
    await api.post(`/favorites/${channelId}`);
  },

  async removeFavorite(channelId: string): Promise<void> {
    await api.delete(`/favorites/${channelId}`);
  },
};

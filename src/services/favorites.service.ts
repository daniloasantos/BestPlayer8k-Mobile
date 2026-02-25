import { api } from './api';
import type { Channel } from '@/types';

const buildProxyUrl = (rawUrl: string): string => {
  if (!rawUrl) return rawUrl;
  const base = api.defaults.baseURL || '';
  return `${base}/stream/proxy?url=${encodeURIComponent(rawUrl)}`;
};

// Helper para transformar canal do backend para o formato do mobile
const transformChannel = (item: any): Channel => ({
  id: item.id,
  name: item.name,
  logo: item.logo,
  quality: item.quality,
  category: item.group || item.Category?.name || '',
  categoryId: item.categoryId || item.Category?.id || '',
  streamUrl: buildProxyUrl(item.url),
  isFavorite: item.isFavorite ?? true,
  type: item.type,
  description: item.description,
  poster: item.poster || item.logo,
  seriesId: item.seriesId,
});

export const favoritesService = {
  async getFavorites(playlistId?: string): Promise<Channel[]> {
    const params = playlistId ? { playlistId } : {};
    const response = await api.get<any[]>('/favorites', { params });
    return (response.data || []).map(transformChannel);
  },

  async toggleFavorite(channelId: string, playlistId?: string): Promise<{ isFavorite: boolean }> {
    const response = await api.post<any>('/favorites/toggle', { channelId, playlistId });
    // Backend retorna { message: 'Channel added/removed to favorites' }
    const isAdded = response.data.message?.includes('added');
    return { isFavorite: isAdded };
  },

  async addFavorite(channelId: string, playlistId?: string): Promise<void> {
    await api.post(`/favorites/${channelId}`, { playlistId });
  },

  async removeFavorite(channelId: string, playlistId?: string): Promise<void> {
    const params = playlistId ? { playlistId } : {};
    await api.delete(`/favorites/${channelId}`, { params });
  },
};

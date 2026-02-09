import { api } from './api';
import type { Channel, Category, ChannelParams, PaginatedResponse, ChannelType, DashboardStats } from '@/types';

// Helper para transformar canal do backend para o formato do mobile
const transformChannel = (item: any): Channel => ({
  id: item.id,
  name: item.name,
  logo: item.logo,
  quality: item.quality,
  category: item.group || item.Category?.name || '',
  categoryId: item.categoryId || item.Category?.id || '',
  streamUrl: item.url,
  isFavorite: item.isFavorite || false,
  type: item.type,
  description: item.description,
  poster: item.poster || item.logo,
});

export const channelsService = {
  async getChannels(params?: ChannelParams): Promise<PaginatedResponse<Channel>> {
    const response = await api.get<any>('/channels', { params });
    const rawItems = response.data.data || response.data.items || [];

    return {
      items: rawItems.map(transformChannel),
      meta: response.data.meta,
      total: response.data.meta?.total,
      page: response.data.meta?.page,
      totalPages: response.data.meta?.totalPages,
    };
  },

  async getChannel(id: string, playlistId?: string): Promise<Channel> {
    const response = await api.get<any>(`/channels/${id}`, {
      params: playlistId ? { playlistId } : undefined,
    });
    return transformChannel(response.data);
  },

  async getCategories(type?: ChannelType, playlistId?: string): Promise<Category[]> {
    const params: any = {};
    if (type) params.type = type;
    if (playlistId) params.playlistId = playlistId;

    const response = await api.get<Category[]>('/categories', {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    return response.data;
  },

  async getRecentlyWatched(limit: number = 10, type?: ChannelType, playlistId?: string): Promise<Channel[]> {
    const params: any = { limit };
    if (type) params.type = type;
    if (playlistId) params.playlistId = playlistId;

    const response = await api.get<any[]>('/watch-history/recent', { params });
    return (response.data || []).map(transformChannel);
  },

  async markAsWatched(channelId: string): Promise<void> {
    await api.post(`/watch-history/${channelId}`);
  },

  async getDashboardStats(playlistId?: string): Promise<DashboardStats> {
    const response = await api.get<any>('/stats/dashboard', {
      params: playlistId ? { playlistId } : undefined,
    });

    // Mapear a resposta do backend para o formato esperado pelo mobile
    const data = response.data;
    return {
      totalChannels: (data.counts?.live || 0) + (data.counts?.movies || 0) + (data.counts?.series || 0),
      totalMovies: data.counts?.movies || 0,
      totalSeries: data.counts?.series || 0,
      totalFavorites: 0, // TODO: implementar no backend
      total4K: 0, // TODO: implementar no backend
      totalFHD: 0, // TODO: implementar no backend
      recentlyWatched: [],
    };
  },

  async searchChannels(query: string, type?: ChannelType | 'ALL', playlistId?: string): Promise<Channel[]> {
    const params: any = {
      search: query,
      limit: 50,
    };
    if (type && type !== 'ALL') params.type = type;
    if (playlistId) params.playlistId = playlistId;

    const response = await api.get<any>('/channels', { params });
    const rawItems = response.data.data || response.data.items || [];
    return rawItems.map(transformChannel);
  },
};

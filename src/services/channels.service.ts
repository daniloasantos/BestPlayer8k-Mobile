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

  async getChannel(id: string): Promise<Channel> {
    const response = await api.get<any>(`/channels/${id}`);
    return transformChannel(response.data);
  },

  async getCategories(type?: ChannelType): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories', {
      params: type ? { type } : undefined,
    });
    return response.data;
  },

  async getRecentlyWatched(limit: number = 10): Promise<Channel[]> {
    const response = await api.get<any[]>('/channels/recently-watched', {
      params: { limit },
    });
    return (response.data || []).map(transformChannel);
  },

  async markAsWatched(channelId: string): Promise<void> {
    await api.post(`/watch-history/${channelId}`);
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/stats/dashboard');
    return response.data;
  },

  async searchChannels(query: string, type?: ChannelType | 'ALL'): Promise<Channel[]> {
    // Backend usa /channels com parâmetro search, não /channels/search
    const response = await api.get<any>('/channels', {
      params: {
        search: query,
        type: type === 'ALL' ? undefined : type,
        limit: 50,
      },
    });
    const rawItems = response.data.data || response.data.items || [];
    return rawItems.map(transformChannel);
  },
};

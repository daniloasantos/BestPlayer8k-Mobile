import { api } from './api';
import type { Channel, Category, ChannelParams, PaginatedResponse, ChannelType, DashboardStats } from '@/types';

export const channelsService = {
  async getChannels(params?: ChannelParams): Promise<PaginatedResponse<Channel>> {
    const response = await api.get<PaginatedResponse<Channel>>('/channels', { params });
    return response.data;
  },

  async getChannel(id: string): Promise<Channel> {
    const response = await api.get<Channel>(`/channels/${id}`);
    return response.data;
  },

  async getCategories(type?: ChannelType): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories', {
      params: type ? { type } : undefined,
    });
    return response.data;
  },

  async getRecentlyWatched(limit: number = 10): Promise<Channel[]> {
    const response = await api.get<Channel[]>('/channels/recently-watched', {
      params: { limit },
    });
    return response.data;
  },

  async markAsWatched(channelId: string): Promise<void> {
    await api.post(`/channels/${channelId}/watch`);
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  async searchChannels(query: string, type?: ChannelType | 'ALL'): Promise<Channel[]> {
    const response = await api.get<Channel[]>('/channels/search', {
      params: { q: query, type: type === 'ALL' ? undefined : type },
    });
    return response.data;
  },
};

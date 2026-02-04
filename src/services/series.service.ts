import { api } from './api';
import type { Series, Category, PaginatedResponse, ChannelParams } from '@/types';

export const seriesService = {
  async getSeries(params?: ChannelParams): Promise<PaginatedResponse<Series>> {
    const response = await api.get<PaginatedResponse<Series>>('/series', { params });
    return response.data;
  },

  async getSeriesDetail(id: string): Promise<Series> {
    const response = await api.get<Series>(`/series/${id}`);
    return response.data;
  },

  async getSeriesCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/categories', {
      params: { type: 'SERIES' },
    });
    return response.data;
  },

  async markEpisodeAsWatched(seriesId: string, episodeId: string): Promise<void> {
    await api.post(`/series/${seriesId}/episodes/${episodeId}/watch`);
  },
};

import { api } from './api';
import type { Series, Season, Episode, Category, PaginatedResponse, ChannelParams } from '@/types';

// Helper para transformar episódio do backend
const transformEpisode = (item: any, seasonNumber: number): Episode => ({
  id: item.id,
  name: item.name || `Episódio ${item.episode || item.number}`,
  number: item.episode || item.number || 1,
  season: seasonNumber,
  episode: item.episode || item.number || 1,
  streamUrl: item.streamUrl || item.url || '',
  quality: item.quality,
  duration: item.duration,
  thumbnail: item.logo || item.thumbnail,
});

// Helper para transformar temporada do backend
const transformSeason = (item: any): Season => ({
  id: String(item.number || item.id),
  number: item.number,
  name: item.name || `Temporada ${item.number}`,
  episodes: (item.episodes || []).map((ep: any) => transformEpisode(ep, item.number)),
});

// Helper para transformar série do backend
const transformSeries = (item: any): Series => ({
  id: item.id,
  name: item.name,
  logo: item.logo,
  poster: item.poster || item.logo,
  category: item.category || item.Category?.name || '',
  categoryId: item.categoryId || item.Category?.id || '',
  quality: item.quality,
  isFavorite: item.isFavorite || false,
  totalEpisodes: item.totalEpisodes || 0,
  totalSeasons: item.totalSeasons || 0,
  seasons: (item.seasons || []).map(transformSeason),
  year: item.year,
  rating: item.rating,
  genre: item.genre,
  description: item.description,
});

export const seriesService = {
  async getSeries(params?: ChannelParams): Promise<PaginatedResponse<Series>> {
    const response = await api.get<any>('/series', { params });
    const rawItems = response.data.data || response.data.items || [];

    return {
      items: rawItems.map(transformSeries),
      meta: response.data.meta,
      total: response.data.meta?.total,
      page: response.data.meta?.page,
      totalPages: response.data.meta?.totalPages,
    };
  },

  async getSeriesDetail(id: string, playlistId?: string): Promise<Series> {
    const response = await api.get<any>(`/series/${id}`, {
      params: playlistId ? { playlistId } : undefined,
    });
    return transformSeries(response.data);
  },

  async getSeriesCategories(playlistId?: string): Promise<Category[]> {
    const params: any = { type: 'SERIES' };
    if (playlistId) params.playlistId = playlistId;

    const response = await api.get<Category[]>('/categories', { params });
    return response.data;
  },

  async markEpisodeAsWatched(seriesId: string, episodeId: string): Promise<void> {
    await api.post(`/watch-history/${episodeId}`);
  },
};

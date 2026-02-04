import { api } from './api';
import type { Playlist } from '@/types';

export interface CreatePlaylistData {
  name: string;
  url: string;
  epgUrl?: string;
}

export const playlistsService = {
  async getPlaylists(): Promise<Playlist[]> {
    const response = await api.get<Playlist[]>('/playlists');
    return response.data;
  },

  async getPlaylist(id: string): Promise<Playlist> {
    const response = await api.get<Playlist>(`/playlists/${id}`);
    return response.data;
  },

  async createPlaylist(data: CreatePlaylistData): Promise<Playlist> {
    const response = await api.post<Playlist>('/playlists', data);
    return response.data;
  },

  async updatePlaylist(id: string, data: Partial<CreatePlaylistData>): Promise<Playlist> {
    const response = await api.patch<Playlist>(`/playlists/${id}`, data);
    return response.data;
  },

  async deletePlaylist(id: string): Promise<void> {
    await api.delete(`/playlists/${id}`);
  },

  async setActivePlaylist(id: string): Promise<void> {
    await api.post(`/playlists/${id}/activate`);
  },

  async refreshPlaylist(id: string): Promise<{ message: string; channelCount: number }> {
    const response = await api.post<{ message: string; channelCount: number }>(`/playlists/${id}/refresh`);
    return response.data;
  },
};

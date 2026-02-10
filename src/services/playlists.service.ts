import { api } from './api';
import { storage } from './storage';
import type { Playlist } from '@/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface CreatePlaylistData {
  name: string;
  url: string;
  epgUrl?: string;
}

export interface SSEProgress {
  phase: string;
  current: number;
  total: number;
  percent: number;
  result?: any;
  error?: string;
}

/**
 * Builds auth headers from storage (same as the Axios interceptor does).
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  const token = await storage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const profileId = await storage.getItem('selected_profile_id');
  if (profileId) {
    headers['x-profile-id'] = profileId;
  }
  return headers;
}

/**
 * Makes an SSE request using XMLHttpRequest to process events incrementally.
 * Unlike fetch + response.text(), XHR fires onprogress as data arrives,
 * avoiding a single massive memory allocation that causes OOM on large playlists.
 */
function requestSSE(
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: string,
  onProgress?: (progress: SSEProgress) => void,
  timeoutMs: number = 5 * 60 * 1000,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.timeout = timeoutMs;

    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value);
    }

    let lastIndex = 0;
    let lineBuffer = '';
    let settled = false;

    const finish = (value: any) => {
      if (settled) return;
      settled = true;
      // Defer abort to avoid issues when called from within XHR event handlers
      setTimeout(() => { try { xhr.abort(); } catch (_) {} }, 0);
      resolve(value);
    };

    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      setTimeout(() => { try { xhr.abort(); } catch (_) {} }, 0);
      reject(error);
    };

    const processAvailableData = () => {
      if (settled) return;

      let text: string;
      try {
        text = xhr.responseText;
      } catch (_) {
        return; // responseText not available yet
      }

      if (text.length <= lastIndex) return;

      const newText = text.substring(lastIndex);
      lastIndex = text.length;

      const textToParse = lineBuffer + newText;
      const lines = textToParse.split('\n');
      lineBuffer = lines.pop() || '';

      for (const line of lines) {
        if (settled) return;
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const data: SSEProgress = JSON.parse(trimmed.slice(6));
          if (data.phase === 'error') {
            fail(new Error(data.error || 'Unknown server error'));
            return;
          }
          onProgress?.(data);
          if (data.phase === 'done') {
            finish(data.result);
            return;
          }
        } catch (e: any) {
          if (e.message && !e.message.includes('Unexpected end of JSON input')) {
            fail(e);
            return;
          }
        }
      }

      // Also check lineBuffer — the done event might be there without a trailing newline
      if (!settled && lineBuffer.trim().startsWith('data: ')) {
        try {
          const data: SSEProgress = JSON.parse(lineBuffer.trim().slice(6));
          if (data.phase === 'done') {
            onProgress?.(data);
            finish(data.result);
            return;
          }
          if (data.phase === 'error') {
            fail(new Error(data.error || 'Unknown server error'));
            return;
          }
        } catch (_) {
          // Incomplete JSON, wait for more data
        }
      }
    };

    // Use onreadystatechange — most reliable in React Native for streaming
    // readyState 3 (LOADING) = new data available, readyState 4 (DONE) = complete
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 3 || xhr.readyState === 4) {
        processAvailableData();
      }
      if (xhr.readyState === 4 && !settled) {
        // Connection closed without receiving a done event — resolve anyway
        finish(null);
      }
    };

    // Also listen to onprogress as a secondary trigger
    xhr.onprogress = processAvailableData;

    xhr.onerror = () => {
      fail(new Error('Network error during SSE request'));
    };

    xhr.ontimeout = () => {
      fail(new Error('SSE request timed out'));
    };

    xhr.send(body || null);
  });
}

export const playlistsService = {
  async getPlaylists(): Promise<Playlist[]> {
    try {
      console.log('[PlaylistsService] Fetching playlists...');
      const response = await api.get<Playlist[]>('/playlist');
      console.log('[PlaylistsService] Playlists response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[PlaylistsService] Error fetching playlists:', error);
      throw error;
    }
  },

  async getPlaylist(id: string): Promise<Playlist> {
    const response = await api.get<Playlist>(`/playlist/${id}`);
    return response.data;
  },

  async createPlaylist(
    data: CreatePlaylistData,
    onProgress?: (progress: SSEProgress) => void,
  ): Promise<Playlist> {
    const headers = await getAuthHeaders();

    return requestSSE(
      `${API_URL}/playlist`,
      'POST',
      { 'Content-Type': 'application/json', ...headers },
      JSON.stringify(data),
      onProgress,
    );
  },

  async updatePlaylist(id: string, data: Partial<CreatePlaylistData>): Promise<Playlist> {
    const response = await api.patch<Playlist>(`/playlist/${id}`, data);
    return response.data;
  },

  async deletePlaylist(id: string): Promise<void> {
    await api.delete(`/playlist/${id}`);
  },

  async setActivePlaylist(id: string): Promise<void> {
    await api.post(`/playlist/${id}/activate`);
  },

  async refreshPlaylist(
    id: string,
    onProgress?: (progress: SSEProgress) => void,
  ): Promise<{ message: string; channelCount: number }> {
    const headers = await getAuthHeaders();

    return requestSSE(
      `${API_URL}/playlist/${id}/refresh`,
      'POST',
      headers,
      undefined,
      onProgress,
    );
  },
};

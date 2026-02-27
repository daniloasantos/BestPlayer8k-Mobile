import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { channelsService } from '@/services';
import type { Channel, ChannelParams, ChannelType, PaginatedResponse } from '@/types';
import { useAuthStore } from '@/stores';
import { useActivePlaylist } from './useFavorites';

export function useChannels(params?: ChannelParams, options?: { enabled?: boolean }) {
  const activePlaylist = useActivePlaylist();
  const playlistId = activePlaylist?.id;

  return useQuery({
    queryKey: ['channels', params, playlistId],
    queryFn: () => channelsService.getChannels({ ...params, playlistId }),
    staleTime: 60_000,
    enabled: options?.enabled !== false,
  });
}

export function useChannel(id: string, playlistId?: string) {
  const activePlaylist = useActivePlaylist();
  const effectivePlaylistId = playlistId || activePlaylist?.id;
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['channel', id, effectivePlaylistId],
    queryFn: () => channelsService.getChannel(id, effectivePlaylistId),
    enabled: !!id,
    staleTime: 60_000,
    placeholderData: () => {
      // Reutiliza dado já em cache das listagens para iniciar o player imediatamente
      const queries = queryClient.getQueriesData<PaginatedResponse<Channel>>({ queryKey: ['channels'] });
      for (const [, data] of queries) {
        const found = data?.items?.find((c: Channel) => c.id === id);
        if (found) return found;
      }
      return undefined;
    },
  });
}

export function useCategories(type?: ChannelType) {
  const activePlaylist = useActivePlaylist();
  const playlistId = activePlaylist?.id;

  return useQuery({
    queryKey: ['categories', type, playlistId],
    queryFn: () => channelsService.getCategories(type, playlistId),
  });
}

export function useRecentlyWatched(limit: number = 10, type?: ChannelType) {
  const selectedProfileId = useAuthStore((state) => state.selectedProfileId);
  const activePlaylist = useActivePlaylist();
  const playlistId = activePlaylist?.id;

  return useQuery({
    queryKey: ['recently-watched', limit, type, selectedProfileId, playlistId],
    queryFn: () => channelsService.getRecentlyWatched(limit, type, playlistId),
  });
}

export function useDashboardStats() {
  const selectedProfileId = useAuthStore((state) => state.selectedProfileId);
  const activePlaylist = useActivePlaylist();
  const playlistId = activePlaylist?.id;

  return useQuery({
    queryKey: ['dashboard-stats', selectedProfileId, playlistId],
    queryFn: () => channelsService.getDashboardStats(playlistId),
  });
}

export function useMarkAsWatched() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channelId: string) => channelsService.markAsWatched(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recently-watched'] });
    },
  });
}

export function useSearchChannels(query: string, type?: ChannelType | 'ALL') {
  const activePlaylist = useActivePlaylist();
  const playlistId = activePlaylist?.id;

  return useQuery({
    queryKey: ['search', query, type, playlistId],
    queryFn: () => channelsService.searchChannels(query, type, playlistId),
    enabled: query.length >= 2,
  });
}

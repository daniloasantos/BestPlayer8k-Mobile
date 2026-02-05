import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { channelsService } from '@/services';
import type { ChannelParams, ChannelType } from '@/types';
import { useAuthStore } from '@/stores';
import { useActivePlaylist } from './useFavorites';

export function useChannels(params?: ChannelParams) {
  const activePlaylist = useActivePlaylist();
  const playlistId = activePlaylist?.id;

  return useQuery({
    queryKey: ['channels', params, playlistId],
    queryFn: () => channelsService.getChannels({ ...params, playlistId }),
  });
}

export function useChannel(id: string, playlistId?: string) {
  const activePlaylist = useActivePlaylist();
  const effectivePlaylistId = playlistId || activePlaylist?.id;

  return useQuery({
    queryKey: ['channel', id, effectivePlaylistId],
    queryFn: () => channelsService.getChannel(id, effectivePlaylistId),
    enabled: !!id,
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

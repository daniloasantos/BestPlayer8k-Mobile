import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { channelsService } from '@/services';
import type { ChannelParams, ChannelType } from '@/types';

export function useChannels(params?: ChannelParams) {
  return useQuery({
    queryKey: ['channels', params],
    queryFn: () => channelsService.getChannels(params),
  });
}

export function useChannel(id: string) {
  return useQuery({
    queryKey: ['channel', id],
    queryFn: () => channelsService.getChannel(id),
    enabled: !!id,
  });
}

export function useCategories(type?: ChannelType) {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: () => channelsService.getCategories(type),
  });
}

export function useRecentlyWatched(limit: number = 10) {
  return useQuery({
    queryKey: ['recently-watched', limit],
    queryFn: () => channelsService.getRecentlyWatched(limit),
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => channelsService.getDashboardStats(),
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
  return useQuery({
    queryKey: ['search', query, type],
    queryFn: () => channelsService.searchChannels(query, type),
    enabled: query.length >= 2,
  });
}

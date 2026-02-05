import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seriesService, channelsService } from '@/services';
import type { ChannelParams } from '@/types';
import { useActivePlaylist } from './useFavorites';

export function useSeries(params?: ChannelParams) {
  const activePlaylist = useActivePlaylist();
  const playlistId = activePlaylist?.id;

  return useQuery({
    queryKey: ['series', params, playlistId],
    queryFn: () => seriesService.getSeries({ ...params, playlistId }),
  });
}

export function useSeriesDetail(id: string) {
  const activePlaylist = useActivePlaylist();
  const playlistId = activePlaylist?.id;

  return useQuery({
    queryKey: ['series-detail', id, playlistId],
    queryFn: () => seriesService.getSeriesDetail(id, playlistId),
    enabled: !!id,
  });
}

export function useSeriesCategories() {
  const activePlaylist = useActivePlaylist();
  const playlistId = activePlaylist?.id;

  return useQuery({
    queryKey: ['series-categories', playlistId],
    queryFn: () => seriesService.getSeriesCategories(playlistId),
  });
}

export function useMarkEpisodeAsWatched() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (episodeId: string) => channelsService.markAsWatched(episodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recently-watched'] });
    },
  });
}

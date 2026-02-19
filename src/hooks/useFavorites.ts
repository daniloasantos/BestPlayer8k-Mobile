import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { favoritesService } from '@/services';
import type { FavoritesStats } from '@/types';

import { useAuthStore } from '@/stores';
import { usePlaylists } from './usePlaylists';

// Hook para obter a playlist ativa
export function useActivePlaylist() {
  const { data: playlists } = usePlaylists();
  return useMemo(() => playlists?.find(p => p.isActive), [playlists]);
}

export function useFavorites() {
  const selectedProfileId = useAuthStore((state) => state.selectedProfileId);
  const activePlaylist = useActivePlaylist();

  return useQuery({
    queryKey: ['favorites', selectedProfileId, activePlaylist?.id],
    queryFn: () => favoritesService.getFavorites(activePlaylist?.id),
    enabled: !!selectedProfileId,
  });
}

export function useFavoritesStats() {
  const { data: favorites, isLoading } = useFavorites();

  const stats = useMemo((): FavoritesStats | undefined => {
    if (!favorites) return undefined;

    const live = favorites.filter(f => f.type === 'LIVE').length;
    const movies = favorites.filter(f => f.type === 'MOVIE').length;
    const series = favorites.filter(f => f.type === 'SERIES').length;
    const total4K = favorites.filter(f => f.quality === 'UHD_4K').length;
    const totalFHD = favorites.filter(f => f.quality === 'FHD').length;
    const totalHD = favorites.filter(f => f.quality === 'HD').length;

    return {
      total: favorites.length,
      live,
      movies,
      series,
      total4K,
      totalFHD,
      totalHD,
    };
  }, [favorites]);

  return {
    data: stats,
    isLoading,
  };
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const activePlaylist = useActivePlaylist();

  return useMutation({
    mutationFn: (channelId: string) => favoritesService.toggleFavorite(channelId, activePlaylist?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['recently-watched'] });
      queryClient.invalidateQueries({ queryKey: ['search'] });
      queryClient.invalidateQueries({ queryKey: ['series'] });
      queryClient.invalidateQueries({ queryKey: ['channel'] });
      queryClient.invalidateQueries({ queryKey: ['series-detail'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

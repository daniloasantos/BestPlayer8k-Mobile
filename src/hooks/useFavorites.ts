import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { favoritesService } from '@/services';
import type { FavoritesStats } from '@/types';

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesService.getFavorites(),
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

  return useMutation({
    mutationFn: (channelId: string) => favoritesService.toggleFavorite(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { favoritesService } from '@/services';
import type { FavoritesStats } from '@/types';

import { useAuthStore } from '@/stores';
import { usePlaylists } from './usePlaylists';

// Hook para obter a playlist ativa.
// Usa isActive do backend como fonte de verdade; fallback para a primeira playlist
// enquanto nenhuma está ativa (ex: antes da auto-ativação completar).
export function useActivePlaylist() {
  const { data: playlists } = usePlaylists();
  return useMemo(() => {
    if (!playlists || playlists.length === 0) return undefined;
    return playlists.find(p => p.isActive) ?? playlists[0];
  }, [playlists]);
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
    onMutate: async (channelId: string) => {
      await queryClient.cancelQueries({ queryKey: ['channels'] });
      await queryClient.cancelQueries({ queryKey: ['channel'] });
      await queryClient.cancelQueries({ queryKey: ['series'] });
      await queryClient.cancelQueries({ queryKey: ['series-detail'] });
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      await queryClient.cancelQueries({ queryKey: ['recently-watched'] });

      const snapshots: [unknown[], any][] = [];

      const flipById = (item: any) =>
        item.id === channelId ? { ...item, isFavorite: !item.isFavorite } : item;

      // Series are matched by channelId (firstChannelId) or by id as fallback
      const flipSeries = (item: any) =>
        (item.channelId === channelId || item.id === channelId)
          ? { ...item, isFavorite: !item.isFavorite }
          : item;

      // Paginated channels (movies, live)
      queryClient.getQueriesData<any>({ queryKey: ['channels'] }).forEach(([key, data]) => {
        if (!data?.items) return;
        snapshots.push([key as unknown[], data]);
        queryClient.setQueryData(key, { ...data, items: data.items.map(flipById) });
      });

      // Single channel detail
      queryClient.getQueriesData<any>({ queryKey: ['channel'] }).forEach(([key, data]) => {
        if (!data) return;
        snapshots.push([key as unknown[], data]);
        if (data.id === channelId) {
          queryClient.setQueryData(key, { ...data, isFavorite: !data.isFavorite });
        }
      });

      // Paginated series list
      queryClient.getQueriesData<any>({ queryKey: ['series'] }).forEach(([key, data]) => {
        if (!data?.items) return;
        snapshots.push([key as unknown[], data]);
        queryClient.setQueryData(key, { ...data, items: data.items.map(flipSeries) });
      });

      // Single series detail
      queryClient.getQueriesData<any>({ queryKey: ['series-detail'] }).forEach(([key, data]) => {
        if (!data) return;
        snapshots.push([key as unknown[], data]);
        if (data.channelId === channelId || data.id === channelId) {
          queryClient.setQueryData(key, { ...data, isFavorite: !data.isFavorite });
        }
      });

      // Favorites list (array of Channel)
      queryClient.getQueriesData<any>({ queryKey: ['favorites'] }).forEach(([key, data]) => {
        if (!Array.isArray(data)) return;
        snapshots.push([key as unknown[], data]);
        queryClient.setQueryData(key, data.map(flipById));
      });

      // Recently watched
      queryClient.getQueriesData<any>({ queryKey: ['recently-watched'] }).forEach(([key, data]) => {
        if (!Array.isArray(data)) return;
        snapshots.push([key as unknown[], data]);
        queryClient.setQueryData(key, data.map(flipById));
      });

      return { snapshots };
    },
    onError: (_err, _channelId, context) => {
      context?.snapshots?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
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

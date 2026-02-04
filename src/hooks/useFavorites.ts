import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesService } from '@/services';

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesService.getFavorites(),
  });
}

export function useFavoritesStats() {
  return useQuery({
    queryKey: ['favorites-stats'],
    queryFn: () => favoritesService.getFavoritesStats(),
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channelId: string) => favoritesService.toggleFavorite(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorites-stats'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });
}

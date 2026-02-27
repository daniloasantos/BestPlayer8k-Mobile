import { useQuery } from '@tanstack/react-query';
import { fetchMovieInfo } from '@/services/tmdb.service';

/**
 * Fetches movie synopsis and metadata from TMDB for a given channel title.
 * Only runs when `enabled` is true (e.g., channel type is MOVIE).
 */
export function useMovieInfo(title: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['movie-info', title],
    queryFn: () => fetchMovieInfo(title!),
    enabled: enabled && !!title,
    staleTime: 24 * 60 * 60 * 1000, // 24h — movie metadata rarely changes
    retry: false,
  });
}

import { useQuery } from '@tanstack/react-query';
import { fetchMovieInfo } from '@/services/tmdb.service';
import { useLanguage } from '@/contexts';

/**
 * Fetches movie synopsis and metadata from TMDB for a given channel title.
 * Only runs when `enabled` is true (e.g., channel type is MOVIE).
 * Uses the current app language to query TMDB in the user's preferred language.
 */
export function useMovieInfo(title: string | undefined, enabled = true) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ['movie-info', title, language],
    queryFn: () => fetchMovieInfo(title!, language),
    enabled: enabled && !!title,
    staleTime: 24 * 60 * 60 * 1000, // 24h — movie metadata rarely changes
    retry: false,
  });
}

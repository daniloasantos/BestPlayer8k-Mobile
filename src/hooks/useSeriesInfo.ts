import { useQuery } from '@tanstack/react-query';
import { fetchSeriesInfo } from '@/services/tmdb.service';
import { useLanguage } from '@/contexts';

/**
 * Fetches TV series synopsis and metadata from TMDB for a given series title.
 * Only runs when `enabled` is true and title is available.
 */
export function useSeriesInfo(title: string | undefined, enabled = true) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ['series-info', title, language],
    queryFn: () => fetchSeriesInfo(title!, language),
    enabled: enabled && !!title,
    staleTime: 24 * 60 * 60 * 1000, // 24h
    retry: false,
  });
}

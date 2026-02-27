import { useQuery } from '@tanstack/react-query';
import { fetchEpisodeInfo } from '@/services/tmdb.service';
import { useLanguage } from '@/contexts';

/**
 * Fetches episode synopsis and metadata from TMDB.
 * Requires the series title, season number, and episode number.
 * Only runs when all three are available.
 */
export function useEpisodeInfo(
  seriesTitle: string | undefined,
  seasonNumber: number | undefined,
  episodeNumber: number | undefined,
  enabled = true,
) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ['episode-info', seriesTitle, seasonNumber, episodeNumber, language],
    queryFn: () => fetchEpisodeInfo(seriesTitle!, seasonNumber!, episodeNumber!, language),
    enabled: enabled && !!seriesTitle && seasonNumber != null && episodeNumber != null,
    staleTime: 24 * 60 * 60 * 1000, // 24h
    retry: false,
  });
}

// TMDB (The Movie Database) API integration
// Get a free API key at https://www.themoviedb.org/settings/api
const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY ?? '';
const TMDB_BASE = 'https://api.themoviedb.org/3';

// Suffixes and noise commonly added by IPTV providers to movie names
const NOISE_RE =
  /\b(4K|UHD|FHD|FULL[\s_-]?HD|HD|SD|H\.?265|HEVC|H\.?264|AVC|HDR|DV|DOLBY|IMAX|DUAL|DUB|LEG|LEGENDADO|DUBLADO|NACIONAL|ORIGINAL|REMUX|BLURAY|BLU-RAY|WEBRIP|HDRIP|BDRIP|CAM|TS)\b/gi;
const BRACKET_RE = /[\[\(][^\]\)]{0,20}[\]\)]/g;

/** Maps app language code to TMDB locale string. */
const TMDB_LOCALE_MAP: Record<string, string> = {
  pt: 'pt-BR',
  en: 'en-US',
  es: 'es-MX',
};

/** Strips IPTV-specific noise from a raw channel name before searching. */
export function cleanMovieTitle(raw: string): string {
  return raw
    .replace(BRACKET_RE, ' ')   // [BR], (2023), etc.
    .replace(NOISE_RE, ' ')     // 4K, HD, DUBLADO, etc.
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export interface TmdbMovieInfo {
  tmdbId: number;
  title: string;
  originalTitle: string;
  overview: string;
  releaseYear: number | null;
  rating: number | null;   // 0-10
  genres: string[];
  posterUrl: string | null;
}

interface TmdbSearchResult {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  poster_path: string | null;
}

interface TmdbGenre {
  id: number;
  name: string;
}

// Per-language genre cache
const genreCacheByLocale = new Map<string, Map<number, string>>();

async function fetchGenres(locale: string): Promise<Map<number, string>> {
  if (genreCacheByLocale.has(locale)) {
    return genreCacheByLocale.get(locale)!;
  }
  const res = await fetch(
    `${TMDB_BASE}/genre/movie/list?api_key=${TMDB_API_KEY}&language=${locale}`,
  );
  if (!res.ok) return new Map();
  const data = await res.json() as { genres: TmdbGenre[] };
  const map = new Map(data.genres.map((g) => [g.id, g.name]));
  genreCacheByLocale.set(locale, map);
  return map;
}

async function searchMovies(query: string, language: string): Promise<TmdbSearchResult[]> {
  const url = `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=${language}&include_adult=false`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json() as { results: TmdbSearchResult[] };
  return data.results ?? [];
}

/**
 * Fetches movie info from TMDB for a given raw IPTV channel name.
 * Uses the provided app language for the query, falls back to en-US.
 * Returns null if the API key is not set or no result is found.
 */
export async function fetchMovieInfo(rawTitle: string, appLanguage = 'pt'): Promise<TmdbMovieInfo | null> {
  if (!TMDB_API_KEY) return null;

  const cleanTitle = cleanMovieTitle(rawTitle);
  if (!cleanTitle) return null;

  const preferredLocale = TMDB_LOCALE_MAP[appLanguage] ?? 'pt-BR';
  const fallbackLocale = 'en-US';

  const genreMap = await fetchGenres(preferredLocale);

  let results = await searchMovies(cleanTitle, preferredLocale);

  // Fallback: if first result has no overview, retry in English
  if ((!results.length || !results[0].overview) && preferredLocale !== fallbackLocale) {
    const enResults = await searchMovies(cleanTitle, fallbackLocale);
    if (enResults.length && enResults[0].overview) {
      results = enResults;
    }
  }

  const best = results.find((r) => r.overview) ?? results[0];
  if (!best) return null;

  const year = best.release_date ? parseInt(best.release_date.slice(0, 4), 10) : null;
  const genres = best.genre_ids
    .map((id) => genreMap.get(id) ?? '')
    .filter(Boolean)
    .slice(0, 3);

  return {
    tmdbId: best.id,
    title: best.title,
    originalTitle: best.original_title,
    overview: best.overview,
    releaseYear: Number.isNaN(year) ? null : year,
    rating: best.vote_count > 0 ? Math.round(best.vote_average * 10) / 10 : null,
    genres,
    posterUrl: best.poster_path
      ? `https://image.tmdb.org/t/p/w342${best.poster_path}`
      : null,
  };
}

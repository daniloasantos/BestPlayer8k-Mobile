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

// Per-language genre cache (movies)
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

// Per-language genre cache (TV)
const tvGenreCacheByLocale = new Map<string, Map<number, string>>();

async function fetchTvGenres(locale: string): Promise<Map<number, string>> {
  if (tvGenreCacheByLocale.has(locale)) {
    return tvGenreCacheByLocale.get(locale)!;
  }
  const res = await fetch(
    `${TMDB_BASE}/genre/tv/list?api_key=${TMDB_API_KEY}&language=${locale}`,
  );
  if (!res.ok) return new Map();
  const data = await res.json() as { genres: TmdbGenre[] };
  const map = new Map(data.genres.map((g) => [g.id, g.name]));
  tvGenreCacheByLocale.set(locale, map);
  return map;
}

interface TmdbTvResult {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  poster_path: string | null;
}

interface TmdbEpisodeResult {
  id: number;
  name: string;
  overview: string;
  air_date: string;
  vote_average: number;
  vote_count: number;
  still_path: string | null;
}

async function searchTvShows(query: string, language: string): Promise<TmdbTvResult[]> {
  const url = `${TMDB_BASE}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=${language}&include_adult=false`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json() as { results: TmdbTvResult[] };
  return data.results ?? [];
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

/**
 * Fetches TV series info from TMDB for a given raw IPTV series name.
 * Returns TmdbMovieInfo-compatible shape (releaseYear = first air year).
 */
export async function fetchSeriesInfo(rawTitle: string, appLanguage = 'pt'): Promise<TmdbMovieInfo | null> {
  if (!TMDB_API_KEY) return null;

  const cleanTitle = cleanMovieTitle(rawTitle);
  if (!cleanTitle) return null;

  const preferredLocale = TMDB_LOCALE_MAP[appLanguage] ?? 'pt-BR';
  const fallbackLocale = 'en-US';

  const genreMap = await fetchTvGenres(preferredLocale);

  let results = await searchTvShows(cleanTitle, preferredLocale);

  if ((!results.length || !results[0].overview) && preferredLocale !== fallbackLocale) {
    const enResults = await searchTvShows(cleanTitle, fallbackLocale);
    if (enResults.length && enResults[0].overview) {
      results = enResults;
    }
  }

  const best = results.find((r) => r.overview) ?? results[0];
  if (!best) return null;

  const year = best.first_air_date ? parseInt(best.first_air_date.slice(0, 4), 10) : null;
  const genres = best.genre_ids
    .map((id) => genreMap.get(id) ?? '')
    .filter(Boolean)
    .slice(0, 3);

  return {
    tmdbId: best.id,
    title: best.name,
    originalTitle: best.original_name,
    overview: best.overview,
    releaseYear: Number.isNaN(year) ? null : year,
    rating: best.vote_count > 0 ? Math.round(best.vote_average * 10) / 10 : null,
    genres,
    posterUrl: best.poster_path
      ? `https://image.tmdb.org/t/p/w342${best.poster_path}`
      : null,
  };
}

/**
 * Fetches specific episode info from TMDB.
 * First finds the TV show by title, then fetches the season/episode details.
 * Returns TmdbMovieInfo-compatible shape (releaseYear = air year, genres = []).
 */
export async function fetchEpisodeInfo(
  rawSeriesTitle: string,
  seasonNumber: number,
  episodeNumber: number,
  appLanguage = 'pt',
): Promise<TmdbMovieInfo | null> {
  if (!TMDB_API_KEY) return null;

  const cleanTitle = cleanMovieTitle(rawSeriesTitle);
  if (!cleanTitle) return null;

  const preferredLocale = TMDB_LOCALE_MAP[appLanguage] ?? 'pt-BR';
  const fallbackLocale = 'en-US';

  // Find the TV show
  let tvResults = await searchTvShows(cleanTitle, preferredLocale);
  if (!tvResults.length && preferredLocale !== fallbackLocale) {
    tvResults = await searchTvShows(cleanTitle, fallbackLocale);
  }

  const tvShow = tvResults[0];
  if (!tvShow) return null;

  // Fetch episode details
  const fetchEp = async (locale: string): Promise<TmdbEpisodeResult | null> => {
    const url = `${TMDB_BASE}/tv/${tvShow.id}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${TMDB_API_KEY}&language=${locale}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json() as Promise<TmdbEpisodeResult>;
  };

  let episode = await fetchEp(preferredLocale);
  if (!episode?.overview && preferredLocale !== fallbackLocale) {
    const enEp = await fetchEp(fallbackLocale);
    if (enEp?.overview) episode = enEp;
  }

  if (!episode?.overview) return null;

  const year = episode.air_date ? parseInt(episode.air_date.slice(0, 4), 10) : null;

  return {
    tmdbId: episode.id,
    title: episode.name,
    originalTitle: episode.name,
    overview: episode.overview,
    releaseYear: Number.isNaN(year) ? null : year,
    rating: episode.vote_count > 0 ? Math.round(episode.vote_average * 10) / 10 : null,
    genres: [],
    posterUrl: episode.still_path
      ? `https://image.tmdb.org/t/p/w780${episode.still_path}`
      : null,
  };
}

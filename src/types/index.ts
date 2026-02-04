// User types
export interface User {
  id: string;
  email: string;
  role: string;
  acceptedTermsVersion: string | null;
  profiles: Profile[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string | null;
  isPrimary: boolean;
}

// Content types
export type QualityLevel = 'UHD_4K' | 'FHD' | 'HD' | 'SD' | 'H265';
export type ChannelType = 'LIVE' | 'MOVIE' | 'SERIES';

export interface Channel {
  id: string;
  name: string;
  logo: string | null;
  quality: QualityLevel;
  category: string;
  categoryId: string;
  streamUrl: string;
  isFavorite: boolean;
  type: ChannelType;
  lastWatched?: string;
  description?: string;
  poster?: string;
  year?: number;
  rating?: number;
  genre?: string;
  duration?: number;
  epgData?: EpgData;
}

export interface EpgData {
  currentProgram: string;
  nextProgram: string;
  startTime: string;
  endTime: string;
  progress: number;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  channelCount?: number;
  count?: number;
  type?: ChannelType;
}

export interface Movie {
  id: string;
  name: string;
  logo: string | null;
  poster?: string | null;
  quality: QualityLevel;
  category: string;
  categoryId: string;
  streamUrl: string;
  isFavorite: boolean;
  year?: number;
  duration?: number;
  rating?: number;
  genre?: string;
  description?: string;
}

export interface Series {
  id: string;
  name: string;
  logo: string | null;
  poster?: string | null;
  category: string;
  categoryId: string;
  quality: QualityLevel;
  isFavorite: boolean;
  totalEpisodes: number;
  totalSeasons: number;
  seasons?: Season[];
  year?: number;
  rating?: number;
  genre?: string;
  description?: string;
}

export interface Season {
  id: string;
  number: number;
  name?: string;
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  name?: string;
  number: number;
  season?: number;
  episode?: number;
  streamUrl: string;
  quality?: QualityLevel;
  duration?: number;
  thumbnail?: string;
}

// Playlist types
export interface Playlist {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  channelCount?: number;
  lastUpdated?: string;
  lastSync?: string;
  epgUrl?: string;
}

// API Response types
export interface PaginatedResponse<T> {
  items: T[];
  data?: T[];
  meta?: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
  total?: number;
  page?: number;
  perPage?: number;
  totalPages?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Request params
export interface ChannelParams {
  type?: ChannelType;
  categoryId?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  favorites?: boolean;
}

export interface SearchParams {
  query: string;
  type?: ChannelType | 'ALL';
  limit?: number;
}

// Stats
export interface DashboardStats {
  totalChannels: number;
  totalMovies: number;
  totalSeries: number;
  totalFavorites: number;
  total4K: number;
  totalFHD: number;
  recentlyWatched: Channel[];
}

export interface FavoritesStats {
  total: number;
  live: number;
  movies: number;
  series: number;
  total4K: number;
  totalFHD: number;
  totalHD: number;
}

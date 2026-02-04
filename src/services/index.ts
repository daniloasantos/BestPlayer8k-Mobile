export { api, getErrorMessage } from './api';
export type { ApiError } from './api';

export { storage } from './storage';

export { authService } from './auth.service';
export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RegisterResponse,
  VerifyEmailRequest,
} from './auth.service';

export { channelsService } from './channels.service';
export { seriesService } from './series.service';
export { favoritesService } from './favorites.service';
export { playlistsService } from './playlists.service';
export type { CreatePlaylistData } from './playlists.service';

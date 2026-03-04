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

export { subscriptionService } from './subscription.service';
export type {
  Plan,
  Subscription,
  AccessStatus,
  CheckoutResponse,
  SubscriptionStatus,
  PaymentMethod,
  PaymentStatus,
} from './subscription.service';

export { trialService } from './trial.service';
export type { TrialStatus } from './trial.service';

export { paymentService } from './payment.service';
export type { Payment, PaginatedPayments } from './payment.service';

export { notificationsService } from './notifications.service';
export type { PushToken } from './notifications.service';

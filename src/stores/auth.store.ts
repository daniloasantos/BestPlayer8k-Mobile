import { create } from 'zustand';
import { authService, RegisterResponse } from '@/services';
import { storage } from '@/services/storage';
import type { User, Profile } from '@/types';
import type { AccessStatus } from '@/services/subscription.service';
import { notificationsService } from '@/services/notifications.service';

const SELECTED_PROFILE_KEY = 'selected_profile_id';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  pendingVerificationEmail: string | null;
  selectedProfileId: string | null;
  subscriptionStatus: AccessStatus | null;

  // Actions
  setUser: (user: User | null) => void;
  setSubscriptionStatus: (status: AccessStatus | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearPendingVerification: () => void;
  selectProfile: (profileId: string) => Promise<void>;
  getCurrentProfile: () => Profile | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  pendingVerificationEmail: null,
  selectedProfileId: null,
  subscriptionStatus: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setSubscriptionStatus: (subscriptionStatus) => set({ subscriptionStatus }),

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await authService.login({ email, password });
      // Carregar perfil selecionado do storage ou usar o primário
      const savedProfileId = await storage.getItem(SELECTED_PROFILE_KEY);
      const profiles = response.user.profiles || [];
      const validProfileId = profiles.find(p => p.id === savedProfileId)?.id
        || profiles.find(p => p.isPrimary)?.id
        || profiles[0]?.id
        || null;

      // Salvar profileId no storage para o interceptor do Axios incluir o header x-profile-id
      if (validProfileId) {
        await storage.setItem(SELECTED_PROFILE_KEY, validProfileId);
      }

      set({
        user: response.user,
        isAuthenticated: true,
        pendingVerificationEmail: null,
        selectedProfileId: validProfileId,
      });
      // Register push token (best-effort, non-blocking)
      notificationsService.registerPushToken().catch(() => {});
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await authService.register({ email, password });
      set({ pendingVerificationEmail: email });
      return response;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      await storage.removeItem(SELECTED_PROFILE_KEY);
      set({ user: null, isAuthenticated: false, selectedProfileId: null, subscriptionStatus: null });
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        // Buscar dados do usuário do servidor
        const user = await authService.getMe();

        // Carregar perfil selecionado do storage ou usar o primário
        const savedProfileId = await storage.getItem(SELECTED_PROFILE_KEY);
        const profiles = user.profiles || [];
        const validProfileId = profiles.find(p => p.id === savedProfileId)?.id
          || profiles.find(p => p.isPrimary)?.id
          || profiles[0]?.id
          || null;

        // Salvar profileId no storage se mudou
        if (validProfileId && validProfileId !== savedProfileId) {
          await storage.setItem(SELECTED_PROFILE_KEY, validProfileId);
        }

        set({
          user,
          isAuthenticated: true,
          selectedProfileId: validProfileId,
        });
      } else {
        set({ user: null, isAuthenticated: false, selectedProfileId: null });
      }
    } catch {
      // Token inválido ou expirado
      await storage.removeItem('auth_token');
      set({ user: null, isAuthenticated: false, selectedProfileId: null });
    } finally {
      set({ isLoading: false });
    }
  },

  clearPendingVerification: () => set({ pendingVerificationEmail: null }),

  selectProfile: async (profileId: string) => {
    const { user } = get();
    if (!user?.profiles?.find(p => p.id === profileId)) return;

    await storage.setItem(SELECTED_PROFILE_KEY, profileId);
    set({ selectedProfileId: profileId });
  },

  getCurrentProfile: () => {
    const { user, selectedProfileId } = get();
    if (!user?.profiles) return null;

    return user.profiles.find(p => p.id === selectedProfileId)
      || user.profiles.find(p => p.isPrimary)
      || user.profiles[0]
      || null;
  },
}));

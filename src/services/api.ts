import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from './storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adiciona token de autenticação e profileId
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await storage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Adiciona o profileId selecionado ao header
    const profileId = await storage.getItem('selected_profile_id');
    if (profileId) {
      config.headers['x-profile-id'] = profileId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Emitter simples para eventos de assinatura bloqueada (substitui window.dispatchEvent no RN)
type SubscriptionBlockedListener = (code: string) => void;
const subscriptionBlockedListeners: SubscriptionBlockedListener[] = [];

export const subscriptionEvents = {
  onBlocked(listener: SubscriptionBlockedListener) {
    subscriptionBlockedListeners.push(listener);
    return () => {
      const idx = subscriptionBlockedListeners.indexOf(listener);
      if (idx !== -1) subscriptionBlockedListeners.splice(idx, 1);
    };
  },
  emit(code: string) {
    subscriptionBlockedListeners.forEach((fn) => fn(code));
  },
};

// Response interceptor - trata erros globalmente
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await storage.removeItem('auth_token');
    }
    if (error.response?.status === 403) {
      const data = error.response.data as { code?: string } | undefined;
      const code = data?.code || 'SUBSCRIPTION_REQUIRED';
      subscriptionEvents.emit(code);
    }
    return Promise.reject(error);
  }
);

// Tipos de erro da API
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// Helper para extrair mensagem de erro
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'Erro de conexão';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Erro desconhecido';
}

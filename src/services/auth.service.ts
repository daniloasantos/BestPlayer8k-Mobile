import * as SecureStore from 'expo-secure-store';
import { api } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    await SecureStore.setItemAsync('auth_token', response.data.token);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    await SecureStore.setItemAsync('auth_token', response.data.token);
    return response.data;
  },

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('auth_token');
  },

  async getMe(): Promise<AuthResponse['user']> {
    const response = await api.get<AuthResponse['user']>('/auth/me');
    return response.data;
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync('auth_token');
    return !!token;
  },
};

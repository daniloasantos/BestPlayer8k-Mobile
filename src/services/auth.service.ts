import { api } from './api';
import { storage } from './storage';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar: string | null;
  isPrimary: boolean;
}

export interface User {
  id: string;
  email: string;
  role: string;
  acceptedTermsVersion: string | null;
  profiles: Profile[];
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  emailVerificationRequired: boolean;
}

export interface VerifyEmailRequest {
  token: string;
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    await storage.setItem('auth_token', response.data.access_token);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  async verifyEmail(data: VerifyEmailRequest): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/verify-email', data);
    return response.data;
  },

  async resendVerification(email: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/resend-verification', { email });
    return response.data;
  },

  async logout(): Promise<void> {
    await storage.removeItem('auth_token');
  },

  async getToken(): Promise<string | null> {
    return await storage.getItem('auth_token');
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await storage.getItem('auth_token');
    return !!token;
  },
};

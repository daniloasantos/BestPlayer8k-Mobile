import { api } from './api';

export interface TrialStatus {
  eligible: boolean;
  hasUsedTrial: boolean;
  isActive: boolean;
  expiresAt: string | null;
  daysRemaining: number | null;
}

export const trialService = {
  async getStatus(): Promise<TrialStatus> {
    const response = await api.get<TrialStatus>('/trial/status');
    return response.data;
  },

  async activate(platform: string = 'mobile'): Promise<{ message: string; expiresAt: string }> {
    const response = await api.post<{ message: string; expiresAt: string }>('/trial/activate', { platform });
    return response.data;
  },
};

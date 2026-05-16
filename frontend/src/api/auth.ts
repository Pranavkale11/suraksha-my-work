import { apiClient } from './client';

export const authApi = {
  register: async (data: any) => {
    const res = await apiClient.post('/api/auth/register', data);
    return res.data;
  },
  
  enrollRound: async (roundNumber: number, data: any) => {
    const res = await apiClient.post(`/api/auth/enrollment/round/${roundNumber}`, data);
    return res.data;
  },
  
  login: async (credentials: any, behavioralData: any) => {
    const res = await apiClient.post('/api/auth/login', {
      ...credentials,
      behavioral_data: behavioralData
    });
    return res.data;
  },
  
  verifySession: async (sessionId: string) => {
    const res = await apiClient.post('/api/auth/session/verify', { session_id: sessionId });
    return res.data;
  }
};

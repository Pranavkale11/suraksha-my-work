import { apiClient } from './client';

export const gapsApi = {
  detect: async (circularId: string) => {
    const res = await apiClient.post(`/api/gaps/detect/${encodeURIComponent(circularId)}`);
    return res.data;
  },

  queue: async () => {
    const res = await apiClient.get('/api/gaps/queue');
    return res.data;
  },

  approve: async (gapId: string) => {
    const res = await apiClient.post(`/api/gaps/${gapId}/approve`);
    return res.data;
  },

  dismiss: async (gapId: string) => {
    const res = await apiClient.post(`/api/gaps/${gapId}/dismiss`);
    return res.data;
  },

  escalate: async (gapId: string) => {
    const res = await apiClient.post(`/api/gaps/${gapId}/escalate`);
    return res.data;
  }
};

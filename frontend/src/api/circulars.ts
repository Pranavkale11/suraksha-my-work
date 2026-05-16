import { apiClient } from './client';

export const circularsApi = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/api/circulars/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  list: async (filters?: { status?: string, issuer?: string, search?: string }) => {
    const res = await apiClient.get('/api/circulars', { params: filters });
    return res.data;
  },

  detail: async (id: string) => {
    const res = await apiClient.get(`/api/circulars/${id}`);
    return res.data;
  },

  reparse: async (id: string) => {
    const res = await apiClient.post(`/api/circulars/${id}/reparse`);
    return res.data;
  },

  download: async (id: string) => {
    const res = await apiClient.get(`/api/circulars/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${id}.pdf`); // Simplification for demo
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};

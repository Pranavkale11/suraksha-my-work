import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// For request deduplication
const pendingRequests = new Map();

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // 1. Attach JWT
  const token = localStorage.getItem('jwt_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 2. Request deduplication
  const requestKey = `${config.method}:${config.url}`;
  if (pendingRequests.has(requestKey)) {
    const controller = pendingRequests.get(requestKey);
    controller.abort();
  }
  const controller = new AbortController();
  config.signal = controller.signal;
  pendingRequests.set(requestKey, controller);

  // 3. Attach metadata for logging
  (config as any).metadata = { startTime: Date.now() };

  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const requestKey = `${response.config.method}:${response.config.url}`;
    pendingRequests.delete(requestKey);

    // 1. Judge Logger
    if ((window as any).__JUDGE_MODE_ENABLED) {
      const event = new CustomEvent('api_call_logged', {
        detail: {
          method: response.config.method?.toUpperCase(),
          url: response.config.url,
          status: response.status,
          duration: Date.now() - (response.config as any).metadata.startTime,
          requestBody: response.config.data,
          responseBody: response.data,
        }
      });
      window.dispatchEvent(event);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (originalRequest) {
      const requestKey = `${originalRequest.method}:${originalRequest.url}`;
      pendingRequests.delete(requestKey);
    }

    // Judge Logger for errors
    if ((window as any).__JUDGE_MODE_ENABLED && originalRequest) {
      const event = new CustomEvent('api_call_logged', {
        detail: {
          method: originalRequest.method?.toUpperCase(),
          url: originalRequest.url,
          status: error.response?.status || 0,
          duration: Date.now() - (originalRequest as any).metadata.startTime,
          requestBody: originalRequest.data,
          responseBody: error.response?.data || error.message,
        }
      });
      window.dispatchEvent(event);
    }

    // Network error -> retry once
    if (!error.response && !originalRequest._retry && error.code !== 'ERR_CANCELED') {
      originalRequest._retry = true;
      console.warn("Network error. Retrying request...", originalRequest.url);
      
      // Basic toast notification hook-in (to be caught globally)
      const event = new CustomEvent('toast_notification', {
        detail: { type: 'warning', message: "Connection lost — retrying..." }
      });
      window.dispatchEvent(event);

      return apiClient(originalRequest);
    }

    // 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }

    // 500 Internal Server Error
    if (error.response?.status === 500) {
      const event = new CustomEvent('toast_notification', {
        detail: { type: 'error', message: "Server error — check Judge Mode for details" }
      });
      window.dispatchEvent(event);
    }

    return Promise.reject(error);
  }
);

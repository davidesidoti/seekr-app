import axios from 'axios';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores';

export const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  // URLSearchParams (available in RN) encodes spaces as '+', but Jellyseerr
  // expects '%20'. Force encodeURIComponent-based serialization.
  paramsSerializer: (params) =>
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&'),
});

// Request interceptor: inject dynamic base URL and auth
api.interceptors.request.use((config) => {
  const { serverUrl, apiKey } = useAuthStore.getState();

  if (serverUrl) {
    config.baseURL = `${serverUrl}/api/v1`;
  }

  if (apiKey) {
    config.headers['X-Api-Key'] = apiKey;
  }

  return config;
});

// Response interceptor: handle 401 → logout + redirect
// Only redirects when the user is already authenticated (session expired).
// During login, a 401 means wrong credentials — let the screen handle it.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      if (useAuthStore.getState().isAuthenticated) {
        useAuthStore.getState().logout();
        setTimeout(() => {
          router.replace('/(auth)');
        }, 0);
      }
    }
    return Promise.reject(error);
  },
);

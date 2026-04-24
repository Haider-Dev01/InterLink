import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the access token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh and global error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Show toast for network errors
    if (!error.response) {
      console.error('Connexion impossible au serveur backend.');
      // Here you could trigger a global toast if available in UI state
      return Promise.reject(error);
    }

    const status = error.response?.status;

    // 401 Unauthorized handling (token expiration)
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const res = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.data?.accessToken;
        
        if (newAccessToken) {
          useAuthStore.getState().setAccessToken(newAccessToken);
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, just clear auth state.
        // DO NOT hard redirect to /login here, as it breaks public routes like Landing Page.
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    // Optional global handling for other statuses
    if (status === 403) {
      console.error('Accès refusé');
    }

    return Promise.reject(error);
  }
);

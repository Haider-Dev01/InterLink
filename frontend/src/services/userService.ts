import { useAuthStore } from '../store/authStore';
import { api } from './api';

async function fetchJson(path: string) {
  const token = useAuthStore.getState().accessToken;
  const response = await fetch(`${api.defaults.baseURL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

export const userService = {
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  getById: async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  getByIdPublic: async (userId: string) => {
    return fetchJson(`/users/${userId}`);
  },

  getByIdPublicLegacy: async (userId: string) => {
    return fetchJson(`/users/${userId}/profile`);
  },

  updateMe: async (data: Record<string, unknown>) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },
};

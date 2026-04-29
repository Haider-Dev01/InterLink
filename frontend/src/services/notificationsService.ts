import { api } from './api';

export const notificationsService = {
  list: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markRead: async (id: string) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },
};

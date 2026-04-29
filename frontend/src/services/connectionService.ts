import { api } from './api';

export const connectionService = {
  requestConnection: async (receiverId: string) => {
    const response = await api.post('/connections/request', { receiverId });
    return response.data;
  },

  acceptConnection: async (requesterId: string) => {
    const response = await api.post('/connections/accept', { requesterId });
    return response.data;
  },

  rejectConnection: async (requesterId: string) => {
    const response = await api.post('/connections/reject', { requesterId });
    return response.data;
  },

  getConnections: async (targetUserId?: string) => {
    const response = await api.get('/connections', {
      params: targetUserId ? { userId: targetUserId } : undefined,
    });
    return response.data;
  },
};

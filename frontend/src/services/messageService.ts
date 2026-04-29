import { api } from './api';

export const messageService = {
  sendMessage: async (receiverId: string, content: string) => {
    const response = await api.post('/messages/send', { receiverId, content });
    return response.data;
  },

  getConversation: async (userId: string) => {
    const response = await api.get(`/messages/${userId}`);
    return response.data;
  },
};

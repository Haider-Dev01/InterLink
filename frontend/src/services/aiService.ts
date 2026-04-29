import { api } from './api';

export const aiService = {
  analyzeCv: async (file?: File) => {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }

    const response = await api.post('/ai/analyze-cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  optimizeCv: async (payload?: { text?: string; targetRole?: string; focusSkills?: string[] }) => {
    const response = await api.post('/ai/optimize-cv', payload ?? {});
    return response.data;
  },

  getCoachingSession: async () => {
    const response = await api.get('/ai/chat/history');
    return response.data;
  },

  continueCoachingSession: async (prompt: string) => {
    const response = await api.post('/ai/chat', { message: prompt });
    return response.data;
  },

  getAiChatHistory: async () => {
    const response = await api.get('/ai/chat/history');
    return response.data;
  },

  sendAiChatMessage: async (message: string) => {
    const response = await api.post('/ai/chat', { message });
    return response.data;
  },
};

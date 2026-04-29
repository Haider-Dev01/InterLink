import { api } from './api';

export const aiAdviceService = {
  getDailyAdvice: async () => {
    const response = await api.get('/ai/daily-advice');
    return response.data;
  },
};

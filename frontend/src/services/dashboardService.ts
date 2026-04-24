import { api } from './api';

export const dashboardService = {
  getPublishedOffersCount: async () => {
    const response = await api.get('/offers', { params: { status: 'PUBLISHED', count: true } });
    return response.data;
  },
  
  getTotalMatchesCount: async () => {
    const response = await api.get('/matches/total', { params: { role: 'recruiter' } });
    return response.data;
  },
  
  getInterviewsCount: async () => {
    const response = await api.get('/applications', { params: { status: 'INTERVIEW', count: true } });
    return response.data;
  }
};

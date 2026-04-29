import { api } from './api';

export const dashboardCandidateService = {
  getRecommendedJobs: async () => {
    const response = await api.get('/jobs/recommended');
    return response.data;
  },

  getActiveApplications: async () => {
    const response = await api.get('/applications/active');
    return response.data;
  },

  getUpcomingInterviews: async () => {
    const response = await api.get('/interviews/upcoming');
    return response.data;
  },

  getUserStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },
};

import { api } from './api';

export const recruiterService = {
  getDashboard: async () => {
    const response = await api.get('/recruiter/dashboard');
    return response.data;
  },

  getOverview: async () => {
    const response = await api.get('/recruiter/overview');
    return response.data;
  },

  getApplications: async (offerId?: string) => {
    const response = await api.get('/applications/recruiter', {
      params: offerId ? { offerId } : undefined,
    });
    return response.data;
  },

  getAiReport: async (prompt?: string) => {
    const response = await api.post('/ai/recruiter-report', prompt ? { prompt } : {});
    return response.data;
  },
};

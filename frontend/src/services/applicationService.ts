import { api } from './api';

export const applicationService = {
  apply: async (data: any) => {
    const response = await api.post('/applications', data);
    return response.data;
  },

  getMyApplications: async () => {
    const response = await api.get('/applications/my');
    return response.data;
  },

  getOfferApplications: async (offerId: string) => {
    const response = await api.get(`/applications/offer/${offerId}`);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/applications/${id}/status`, { status });
    return response.data;
  },

  withdraw: async (id: string) => {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },
};

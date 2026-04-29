import { api } from './api';

export const offerService = {
  createOffer: async (data: any) => {
    const response = await api.post('/offers', data);
    return response.data;
  },

  createJob: async (data: any) => {
    const response = await api.post('/jobs', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  getOffers: async (params?: any) => {
    const response = await api.get('/offers', { params });
    return response.data;
  },

  getMyOffers: async () => {
    const response = await api.get('/offers/my');
    return response.data;
  },

  getMyJobs: async () => {
    const response = await api.get('/jobs/my');
    return response.data;
  },

  getOfferById: async (id: string) => {
    const response = await api.get(`/offers/${id}`);
    return response.data;
  },

  getJobById: async (id: string) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  updateOffer: async (id: string, data: any) => {
    const response = await api.put(`/offers/${id}`, data);
    return response.data;
  },

  updateJob: async (id: string, data: any) => {
    const response = await api.put(`/jobs/${id}`, data);
    return response.data;
  },

  publishOffer: async (id: string) => {
    const response = await api.patch(`/offers/${id}/publish`);
    return response.data;
  },

  archiveOffer: async (id: string) => {
    const response = await api.patch(`/offers/${id}/archive`);
    return response.data;
  },

  deleteJob: async (id: string) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  getOfferMatches: async (id: string) => {
    const response = await api.get(`/offers/${id}/matches`);
    return response.data;
  },
};

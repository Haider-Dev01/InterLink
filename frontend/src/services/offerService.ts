import { api } from './api';

export const offerService = {
  createOffer: async (data: any) => {
    const response = await api.post('/offers', data);
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

  getOfferById: async (id: string) => {
    const response = await api.get(`/offers/${id}`);
    return response.data;
  },

  updateOffer: async (id: string, data: any) => {
    const response = await api.put(`/offers/${id}`, data);
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

  getOfferMatches: async (id: string) => {
    const response = await api.get(`/offers/${id}/matches`);
    return response.data;
  },
};

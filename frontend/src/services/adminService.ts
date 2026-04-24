import { api } from './api';

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  
  getOffers: async () => {
    const response = await api.get('/admin/offers');
    return response.data;
  },

  updateUserStatus: async (userId: string, status: string) => {
    const response = await api.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  updateOfferStatus: async (offerId: string, status: string) => {
    const response = await api.patch(`/admin/offers/${offerId}/status`, { status });
    return response.data;
  }
};

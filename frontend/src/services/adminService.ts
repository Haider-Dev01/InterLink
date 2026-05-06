import { api } from './api';

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  getUsers: async (page = 1, limit = 100) => {
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  getOffers: async (page = 1, limit = 100) => {
    const response = await api.get(`/admin/offers?page=${page}&limit=${limit}`);
    return response.data;
  },

  banUser: async (userId: string) => {
    const response = await api.patch(`/admin/users/${userId}/ban`);
    return response.data;
  },

  unbanUser: async (userId: string) => {
    const response = await api.patch(`/admin/users/${userId}/unban`);
    return response.data;
  },

  getPendingCompanies: async () => {
    const response = await api.get('/admin/companies/pending');
    return response.data;
  },

  verifyCompany: async (companyId: string) => {
    const response = await api.patch(`/admin/companies/${companyId}/verify`);
    return response.data;
  },

  rejectCompany: async (companyId: string, reason: string) => {
    const response = await api.patch(`/admin/companies/${companyId}/reject`, { reason });
    return response.data;
  },

  updateOfferStatus: async (offerId: string, status: string) => {
    const response = await api.patch(`/admin/offers/${offerId}/status`, { status });
    return response.data;
  },

  toggleOfferFeatured: async (offerId: string, isFeatured: boolean) => {
    const response = await api.patch(`/admin/offers/${offerId}/featured`, { isFeatured });
    return response.data;
  },

  getUserLogs: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}/logs`);
    return response.data;
  }
};

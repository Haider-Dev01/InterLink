import { api } from './api';

export const companyService = {
  getCompanyById: async (id: string) => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },
};

import { api } from './api';

export type GlobalSearchType = 'all' | 'users' | 'jobs' | 'companies';

export type SearchUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'candidate' | 'recruiter' | 'admin';
  profileImage: string | null;
};

export type SearchJob = {
  id: string;
  title: string;
  location: string | null;
  publishedAt: string | null;
  company: {
    id: string;
    name: string;
  };
};

export type SearchCompany = {
  id: string;
  name: string;
  industry: string | null;
  isVerified: boolean;
};

export type GlobalSearchResponse = {
  success: boolean;
  data: {
    query: string;
    type: GlobalSearchType;
    users: SearchUser[];
    jobs: SearchJob[];
    companies: SearchCompany[];
    results: Array<Record<string, unknown>>;
  };
};

export const searchService = {
  search: async (query: string, type: GlobalSearchType = 'all', limit = 8): Promise<GlobalSearchResponse> => {
    const response = await api.get<GlobalSearchResponse>('/search', {
      params: { query, type, limit },
    });
    return response.data;
  },

  searchUsers: async (query: string): Promise<GlobalSearchResponse> => {
    return searchService.search(query, 'users', 8);
  },
};

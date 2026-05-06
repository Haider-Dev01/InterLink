import { api } from './api';

export const bookmarkService = {
  bookmarkOffer: async (offerId: string) => {
    const response = await api.post(`/bookmarks/${offerId}`);
    return response.data;
  },

  removeBookmark: async (offerId: string) => {
    const response = await api.delete(`/bookmarks/${offerId}`);
    return response.data;
  },

  getBookmarks: async () => {
    const response = await api.get('/bookmarks');
    return response.data;
  },
};

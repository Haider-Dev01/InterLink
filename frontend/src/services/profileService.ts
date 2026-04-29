import { api } from './api';

export const profileService = {
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateMe: async (data: any) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  getByUserId: async (userId: string) => {
    const response = await api.get(`/users/${userId}/profile`);
    return response.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

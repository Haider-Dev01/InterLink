import { api } from './api';

export const profileService = {
  getMe: async () => {
    const response = await api.get('/profile/me');
    return response.data;
  },

  updateMe: async (data: any) => {
    const response = await api.patch('/profile/me', data);
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

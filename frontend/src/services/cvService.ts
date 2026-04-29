import { api } from './api';

export const cvService = {
  uploadCv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/cv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMyCv: async () => {
    const response = await api.get('/cv/my-cv');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/cv/me');
    return response.data;
  },

  getSkills: async () => {
    const response = await api.get('/cv/skills');
    return response.data;
  },
};

import api from './api'
import { useAuthStore } from '../stores/authStore'

export const authService = {
  async login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password })
    const { accessToken, user } = res.data.data
    useAuthStore.getState().setAuth(accessToken, user)
    return user
  },

  async register(data: {
    email: string
    password: string
    firstName: string
    lastName: string
    role: 'candidate' | 'recruiter'
  }) {
    const res = await api.post('/auth/register', data)
    const { accessToken, user } = res.data.data
    useAuthStore.getState().setAuth(accessToken, user)
    return user
  },

  async logout() {
    await api.post('/auth/logout')
    useAuthStore.getState().logout()
  },

  async refreshToken() {
    const res = await api.post('/auth/refresh')
    const { accessToken } = res.data.data
    useAuthStore.getState().setAccessToken(accessToken)
    return accessToken
  },

  async getMe() {
    const res = await api.get('/auth/me')
    return res.data.data.user
  }
}

import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // pour httpOnly cookie refresh token
})

// Request interceptor : ajouter access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor : refresh automatique si 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Note: TypeScript doesn't know about `_retry` on config naturally, so we cast config.
    const originalRequest = error.config
    
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const res = await axios.post('http://localhost:3000/api/auth/refresh',
          {}, { withCredentials: true })
        const newToken = res.data.data.accessToken
        useAuthStore.getState().setAccessToken(newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

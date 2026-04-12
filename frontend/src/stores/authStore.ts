import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  accessToken: string | null
  user: User | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User) => void
  setAccessToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  setAuth: (token, user) => set({
    accessToken: token,
    user,
    isAuthenticated: true
  }),
  setAccessToken: (token) => set({ accessToken: token }),
  logout: () => set({
    accessToken: null,
    user: null,
    isAuthenticated: false
  }),
}))

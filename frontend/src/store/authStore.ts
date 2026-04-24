import { create } from 'zustand';
import { authService } from '../services/authService';

export type AuthState = {
  accessToken: string | null;
  user: Record<string, any> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAccessToken: (token: string | null) => void;
  setUser: (user: Record<string, any> | null) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  setAccessToken: (token) => set({ accessToken: token, isAuthenticated: !!token }),
  
  setUser: (user) => set({ user }),
  
  logout: async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      set({ accessToken: null, user: null, isAuthenticated: false });
      // clear any other stores if necessary
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await authService.getMe();
      if (response.success && response.data) {
        set({ user: response.data.user, isAuthenticated: true });
        // The access token is usually managed via memory, but if we need to fetch it via refresh,
        // it should be handled in the api interceptor which will refresh token if we call getMe and it returns 401.
      } else {
        set({ user: null, isAuthenticated: false, accessToken: null });
      }
    } catch (err) {
      set({ user: null, isAuthenticated: false, accessToken: null });
    } finally {
      set({ isLoading: false });
    }
  }
}));

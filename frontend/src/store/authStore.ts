import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import { api } from '../services/api';

function normalizeUser(user: Record<string, any> | null) {
  if (!user) return null;

  const profile = user.profile ?? {};
  const company = user.company ?? profile.company ?? null;
  const firstName = user.firstName ?? profile.firstName ?? '';
  const lastName = user.lastName ?? profile.lastName ?? '';

  return {
    ...user,
    company,
    firstName,
    lastName,
    avatar: user.avatar ?? profile.avatarUrl ?? profile.avatar ?? null,
    bio: user.bio ?? profile.bio ?? '',
    profile: {
      ...profile,
      company,
      avatarUrl: profile.avatarUrl ?? user.avatar ?? null,
    },
  };
}

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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setAccessToken: (token) => set({ accessToken: token, isAuthenticated: !!token }),

      setUser: (user) =>
        set((state) => ({
          user: normalizeUser(user),
          isAuthenticated: Boolean(state.accessToken || user),
        })),

      logout: async () => {
        try {
          await authService.logout();
        } catch (err) {
          console.error('Logout error', err);
        } finally {
          set({ accessToken: null, user: null, isAuthenticated: false });
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/users/me');
          const payload = response.data;
          if (payload.success && payload.data) {
            set((state) => ({
              user: normalizeUser(payload.data.user),
              isAuthenticated: true,
              accessToken: state.accessToken,
            }));
          } else {
            set({ user: null, isAuthenticated: false, accessToken: null });
          }
        } catch (err) {
          set({ user: null, isAuthenticated: false, accessToken: null });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'interlink-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

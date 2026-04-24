import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

/**
 * Runs checkAuth once at app startup to restore session from httpOnly cookie.
 * Must be placed inside <BrowserRouter> but outside protected routes.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/authStore';

export function RouteStateSync() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    useAppStore.getState().setCurrentPath(location.pathname);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const role = (user.role || '').toLowerCase();
    useAppStore.getState().setUser({
      firstName: user.firstName || user.profile?.firstName || '',
      lastName: user.lastName || user.profile?.lastName || '',
      email: user.email || '',
      role: user.role || '',
    });

    if (role === 'recruiter' || role === 'candidate' || role === 'admin') {
      useAppStore.getState().setUserType(role === 'candidate' ? 'student' : role);
    }
  }, [user]);

  return null;
}

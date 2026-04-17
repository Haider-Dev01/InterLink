import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useAppStore } from '../store/useAppStore';

export function RouteStateSync() {
  const location = useLocation();

  useEffect(() => {
    useAppStore.getState().setCurrentPath(location.pathname);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}

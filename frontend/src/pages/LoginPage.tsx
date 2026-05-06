import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TemplatePage } from '../components/TemplatePage';
import { setupLoginPage } from '../lib/pageBehaviors';
import { loginHtml } from '../lib/pageSources';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    // Component mounted
  }, []);

  const getDashboardPath = (role: string | undefined) => {
    const normalizedRole = (role || '').toLowerCase();
    if (normalizedRole === 'recruiter') return '/recruiter/dashboard';
    if (normalizedRole === 'admin') return '/admin/dashboard';
    return '/candidate/dashboard';
  };

  const handleLogin = async (credentials: any) => {
    setError(null);
    const res = await authService.login(credentials);
    if (res.success && res.data) {
      const { user, accessToken } = res.data;
      
      // Cas spécifique recruteur non validé
      if (user.role?.toLowerCase() === 'recruiter' && user.isVerified === false) {
        console.warn("Compte recruteur en attente de validation");
      }

      setAccessToken(accessToken);
      setUser(user);

      navigate(getDashboardPath(user.role), { replace: true });
    } else {
      setError(res.error || 'Identifiants invalides');
    }
    return res;
  };

  return (
    <TemplatePage
      pageKey="login"
      rawHtml={loginHtml}
      setup={(args) => setupLoginPage({ ...args, onLogin: handleLogin, error })}
    />
  );
}

import { useNavigate } from 'react-router-dom';
import { TemplatePage } from '../components/TemplatePage';
import { setupRegisterPage } from '../lib/pageBehaviors';
import { registerHtml } from '../lib/pageSources';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

export default function SignupPage() {
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  const handleRegister = async (data: any) => {
    const res = await authService.register(data);
    if (res.success && res.data) {
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
      await checkAuth();

      // Redirect based on role returned by API
      const role: string = res.data.user?.role?.toLowerCase() ?? '';
      if (role === 'recruiter') navigate('/recruiter/dashboard', { replace: true });
      else if (role === 'admin') navigate('/admin/dashboard', { replace: true });
      else navigate('/candidate/dashboard', { replace: true });
    }
    return res;
  };

  return (
    <TemplatePage
      pageKey="signup"
      rawHtml={registerHtml}
      setup={(args) => setupRegisterPage({ ...args, onRegister: handleRegister })}
    />
  );
}

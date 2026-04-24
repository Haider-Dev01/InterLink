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

  const handleLogin = async (credentials: any) => {
    const res = await authService.login(credentials);
    if (res.success && res.data) {
      const { user, accessToken } = res.data;
      
      // Cas spécifique recruteur non validé
      if (user.role?.toLowerCase() === 'recruiter' && user.isVerified === false) {
        // Optionnel : afficher un message spécifique ou rediriger vers une page d'attente
        console.warn("Compte recruteur en attente de validation");
      }

      setAccessToken(accessToken);
      setUser(user);

      // Redirect based on actual role from the API
      const role = user.role?.toLowerCase();
      if (role === 'recruiter') navigate('/recruiter/dashboard', { replace: true });
      else if (role === 'admin') navigate('/admin/dashboard', { replace: true });
      else navigate('/candidate/dashboard', { replace: true });
    }
    return res;
  };

  return (
    <TemplatePage
      pageKey="login"
      rawHtml={loginHtml}
      setup={(args) => setupLoginPage({ ...args, onLogin: handleLogin })}
    />
  );
}

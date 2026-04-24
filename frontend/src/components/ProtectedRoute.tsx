import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Protects routes by requiring authentication and optionally a specific role.
 * Roles from backend: 'candidate' | 'recruiter' | 'admin'
 */
export const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-bold text-on-surface-variant">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Normalisation des rôles pour la comparaison (minuscules)
  const userRole = user?.role?.toLowerCase();
  const normalizedAllowedRoles = allowedRoles?.map(r => r.toLowerCase());

  if (normalizedAllowedRoles && userRole && !normalizedAllowedRoles.includes(userRole)) {
    // Redirection vers le dashboard approprié si le rôle ne correspond pas à la route tentée
    if (userRole === 'recruiter') return <Navigate to="/recruiter/dashboard" replace />;
    if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/candidate/dashboard" replace />;
  }

  // Cas spécifique recruteur non validé
  if (userRole === 'recruiter' && user?.isVerified === false) {
    // Si la route n'est pas déjà les paramètres ou une page d'attente
    // Pour l'instant on laisse passer mais on pourra ajouter une redirection ici
    // return <Navigate to="/recruiter/pending-validation" replace />;
  }

  return <Outlet />;
};

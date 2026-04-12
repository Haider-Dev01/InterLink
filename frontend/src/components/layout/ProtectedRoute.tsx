import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

interface Props {
  children: React.ReactNode
  allowedRoles?: ('candidate' | 'recruiter' | 'admin')[]
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    if (user.role === 'recruiter') return <Navigate to="/recruiter" replace />
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

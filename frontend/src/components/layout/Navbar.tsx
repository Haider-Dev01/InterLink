import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { authService } from '../../services/authService'
import { Button } from '../ui/button'

export function Navbar() {
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (e) {
      console.error(e)
    } finally {
      // Store state is cleared by the service
      navigate('/login')
    }
  }

  return (
    <nav className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-bold">InternLink</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Register</Button>
              </Link>
            </>
          ) : (
            <>
              <div className="hidden sm:flex flex-col items-end mr-4">
                <span className="text-sm font-medium">{user?.profile?.firstName} {user?.profile?.lastName}</span>
                <span className="text-xs text-slate-500 capitalize">{user?.role}</span>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

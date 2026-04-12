import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardCandidatePage } from './pages/DashboardCandidatePage'
import { DashboardRecruiterPage } from './pages/DashboardRecruiterPage'
import { DashboardAdminPage } from './pages/DashboardAdminPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { Layout } from './components/layout/Layout'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Candidat */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <Layout><DashboardCandidatePage /></Layout>
            </ProtectedRoute>
          } />

          {/* Recruteur */}
          <Route path="/recruiter" element={
            <ProtectedRoute allowedRoles={['recruiter']}>
              <Layout><DashboardRecruiterPage /></Layout>
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout><DashboardAdminPage /></Layout>
            </ProtectedRoute>
          } />

          {/* Redirections */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { RouteStateSync } from './components/RouteStateSync';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './components/AuthProvider';
import { useAuthStore } from './store/authStore';
import { PublicLayout } from './components/PublicLayout';

// Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const AssistantPage = lazy(() => import('./pages/AssistantPage'));
const AnalyseCvPage = lazy(() => import('./pages/AnalyseCvPage'));
const DashboardCandidatPage = lazy(() => import('./pages/DashboardCandidatPage'));
const DashboardRecruiteurPage = lazy(() => import('./pages/DashboardRecruiter'));
const DashboardAdministrateurPage = lazy(() => import('./pages/DashboardAdministrateurPage'));
const AdminUtilisateursPage = lazy(() => import('./pages/AdminUtilisateursPage'));
const AdminOffresPage = lazy(() => import('./pages/AdminOffresPage'));
const UserSettingsPage = lazy(() => import('./pages/UserSettingsPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/AdminAnalyticsPage'));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'));
const CandidateApplicationsPage = lazy(() => import('./pages/CandidateApplicationsPage'));
const CandidateSavedOffersPage = lazy(() => import('./pages/CandidateSavedOffersPage'));
const CandidateCvNexusPage = lazy(() => import('./pages/CandidateCvNexusPage'));
const CandidateCoachingPage = lazy(() => import('./pages/CandidateCoachingPage'));
const CandidateFindInternshipPage = lazy(() => import('./pages/CandidateFindInternshipPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const SocialChatPage = lazy(() => import('./pages/SocialChatPage'));
const JobDetailsPage = lazy(() => import('./pages/JobDetailsPage'));
const RecruiterOffersPage = lazy(() => import('./pages/RecruiterOffersPage'));
const RecruiterCreateOfferPage = lazy(() => import('./pages/RecruiterCreateOfferPage'));
const RecruiterEditOfferPage = lazy(() => import('./pages/RecruiterEditOfferPage'));
const RecruiterCandidatesPage = lazy(() => import('./pages/RecruiterCandidatesPage'));
const RecruiterReportsPage = lazy(() => import('./pages/RecruiterReportsPage'));
const RecruiterOverviewPage = lazy(() => import('./pages/RecruiterOverviewPage'));
const CandidatesPage = lazy(() => import('./pages/CandidatesPage'));
const RecruitersPage = lazy(() => import('./pages/RecruitersPage'));
const CompanyDetailsPage = lazy(() => import('./pages/CompanyDetailsPage'));

function AppFallback() {
  return <div className="min-h-screen bg-surface" />;
}

/**
 * Gère la page d'accueil avec redirection automatique si déjà connecté
 */
function Home() {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  // On attend que checkAuth() soit terminé pour décider de la redirection
  if (isLoading) return <AppFallback />;

  if (isAuthenticated && user) {
    const role = user.role?.toLowerCase();
    if (role === 'recruiter') return <Navigate to="/recruiter/dashboard" replace />;
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/candidate/dashboard" replace />;
  }

  return <LandingPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RouteStateSync />
        <Suspense fallback={<AppFallback />}>
          <Routes>
            {/* Route d'accueil : Landing Page ou Dashboard */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/index.html" element={<PublicLayout><Home /></PublicLayout>} />
            
            {/* Authentification publique */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<SignupPage />} />
            
            {/* Pages publiques additionnelles */}
            <Route path="/candidats" element={<PublicLayout><CandidatesPage /></PublicLayout>} />
            <Route path="/recruteurs" element={<PublicLayout><RecruitersPage /></PublicLayout>} />
            <Route path="/assistant-ia" element={<PublicLayout><AssistantPage /></PublicLayout>} />
            <Route path="/analyse-cv" element={<PublicLayout><AnalyseCvPage /></PublicLayout>} />

            {/* Alias pour dashboard général */}
            <Route path="/dashboard" element={<Navigate to="/candidate/dashboard" replace />} />
            <Route path="/dashboard-candidat" element={<Navigate to="/candidate/dashboard" replace />} />
            <Route path="/dashboard-candidat/candidatures" element={<Navigate to="/candidate/dashboard/candidatures" replace />} />
            <Route path="/dashboard-candidat/offres-sauvegardees" element={<Navigate to="/candidate/dashboard/offres-sauvegardees" replace />} />
            <Route path="/dashboard-candidat/cv-nexus" element={<Navigate to="/candidate/dashboard/cv-nexus" replace />} />
            <Route path="/dashboard-candidat/coaching-ia" element={<Navigate to="/candidate/dashboard/coaching-ia" replace />} />
            <Route path="/dashboard-candidat/analyse-cv" element={<Navigate to="/candidate/dashboard/analyse-cv" replace />} />
            <Route path="/dashboard-candidat/trouver-stage" element={<Navigate to="/candidate/dashboard/trouver-stage" replace />} />

            {/* Espace Candidat (Protégé) */}
            <Route element={<ProtectedRoute allowedRoles={['candidate']} />}>
              <Route path="/candidate/dashboard" element={<DashboardCandidatPage />} />
              <Route path="/candidate/dashboard/candidatures" element={<CandidateApplicationsPage />} />
              <Route path="/candidate/dashboard/offres-sauvegardees" element={<CandidateSavedOffersPage />} />
              <Route path="/candidate/dashboard/cv-nexus" element={<CandidateCvNexusPage />} />
              <Route path="/candidate/dashboard/coaching-ia" element={<CandidateCoachingPage />} />
              <Route path="/coaching-ia/session" element={<CandidateCoachingPage />} />
              <Route path="/candidate/dashboard/analyse-cv" element={<AnalyseCvPage />} />
              <Route path="/candidate/dashboard/trouver-stage" element={<CandidateFindInternshipPage />} />
              <Route path="/candidatures" element={<CandidateApplicationsPage />} />
              <Route path="/cv-nexus" element={<CandidateCvNexusPage />} />
              <Route path="/offres-sauvegardees" element={<CandidateSavedOffersPage />} />
              <Route path="/coaching-ia" element={<CandidateCoachingPage />} />
              <Route path="/trouver-stage" element={<CandidateFindInternshipPage />} />
            </Route>

            <Route path="/job/:id" element={<JobDetailsPage />} />
            <Route path="/company/:id" element={<PublicLayout><CompanyDetailsPage /></PublicLayout>} />

            {/* Espace Recruteur (Protégé) */}
            <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
              <Route path="/dashboard-recruteur" element={<DashboardRecruiteurPage />} />
              <Route path="/dashboard_recruteur.html" element={<DashboardRecruiteurPage />} />
              <Route path="/dashboard-recruteur/overview" element={<RecruiterOverviewPage />} />
              <Route path="/dashboard-recruteur/offres" element={<RecruiterOffersPage />} />
              <Route path="/dashboard-recruteur/candidats" element={<RecruiterCandidatesPage />} />
              <Route path="/dashboard-recruteur/rapports-ia" element={<RecruiterReportsPage />} />
              <Route path="/dashboard-recruteur/creer-offre" element={<RecruiterCreateOfferPage />} />
              <Route path="/dashboard-recruteur/offres/:id/edit" element={<RecruiterEditOfferPage />} />
              <Route path="/recruiter" element={<Navigate to="/recruiter/dashboard" replace />} />
              <Route path="/recruiter/dashboard" element={<DashboardRecruiteurPage />} />
              <Route path="/recruiter/overview" element={<RecruiterOverviewPage />} />
              <Route path="/recruiter/jobs" element={<RecruiterOffersPage />} />
              <Route path="/recruiter/jobs/new" element={<RecruiterCreateOfferPage />} />
              <Route path="/recruiter/jobs/:id/edit" element={<RecruiterEditOfferPage />} />
              <Route path="/recruiter/candidates" element={<RecruiterCandidatesPage />} />
              <Route path="/recruiter/ai-reports" element={<RecruiterReportsPage />} />
              <Route path="/recruiter/offers" element={<Navigate to="/recruiter/jobs" replace />} />
              <Route path="/recruiter/offers/new" element={<Navigate to="/recruiter/jobs/new" replace />} />
              <Route path="/recruiter/offers/:id/edit" element={<RecruiterEditOfferPage />} />
              <Route path="/recruiter/reports" element={<Navigate to="/recruiter/ai-reports" replace />} />
            </Route>


            {/* Espace Admin (Protégé) */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<DashboardAdministrateurPage />} />
              <Route path="/admin/dashboard/analytique-ia" element={<AdminAnalyticsPage />} />
              <Route path="/admin/dashboard/parametres" element={<AdminSettingsPage />} />
              <Route path="/admin/dashboard/utilisateurs" element={<AdminUtilisateursPage />} />
              <Route path="/admin/dashboard/offres" element={<AdminOffresPage />} />
            </Route>

            {/* Paramètres (Tous rôles connectés) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/user-settings" element={<UserSettingsPage />} />
              <Route path="/parametres" element={<UserSettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/me" element={<ProfilePage />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/messages" element={<SocialChatPage />} />
              <Route path="/messages/:userId" element={<SocialChatPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>

            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

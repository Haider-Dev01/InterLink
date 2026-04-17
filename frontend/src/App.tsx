import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { RouteStateSync } from './components/RouteStateSync';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const AssistantPage = lazy(() => import('./pages/AssistantPage'));
const AnalyseCvPage = lazy(() => import('./pages/AnalyseCvPage'));
const DashboardCandidatPage = lazy(() => import('./pages/DashboardCandidatPage'));
const DashboardRecruteurPage = lazy(() => import('./pages/DashboardRecruteurPage'));
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
const RecruiterOffersPage = lazy(() => import('./pages/RecruiterOffersPage'));
const RecruiterCandidatesPage = lazy(() => import('./pages/RecruiterCandidatesPage'));
const RecruiterReportsPage = lazy(() => import('./pages/RecruiterReportsPage'));
const RecruiterCreateOfferPage = lazy(() => import('./pages/RecruiterCreateOfferPage'));
const CandidatesPage = lazy(() => import('./pages/CandidatesPage'));
const RecruitersPage = lazy(() => import('./pages/RecruitersPage'));

function AppFallback() {
  return <div className="min-h-screen bg-surface" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteStateSync />
      <Suspense fallback={<AppFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/index.html" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/landing_page.html" element={<LandingPage />} />
          <Route path="/candidats" element={<CandidatesPage />} />
          <Route path="/recruteurs" element={<RecruitersPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/login.html" element={<LoginPage />} />

          <Route path="/signup" element={<SignupPage />} />
          <Route path="/register" element={<SignupPage />} />
          <Route path="/register.html" element={<SignupPage />} />
          <Route path="/inscription.html" element={<SignupPage />} />

          <Route path="/assistant-ia" element={<AssistantPage />} />
          <Route path="/assistant_ia.html" element={<AssistantPage />} />

          <Route path="/analyse-cv" element={<AnalyseCvPage />} />
          <Route path="/analyse_cv.html" element={<AnalyseCvPage />} />

          <Route path="/dashboard" element={<Navigate to="/dashboard-candidat" replace />} />
          <Route path="/dashboard-candidat" element={<DashboardCandidatPage />} />
          <Route path="/daboard_candidat.html" element={<DashboardCandidatPage />} />
          <Route path="/dashboard-candidat/candidatures" element={<CandidateApplicationsPage />} />
          <Route path="/dashboard-candidat/offres-sauvegardees" element={<CandidateSavedOffersPage />} />
          <Route path="/dashboard-candidat/cv-nexus" element={<CandidateCvNexusPage />} />
          <Route path="/dashboard-candidat/coaching-ia" element={<CandidateCoachingPage />} />
          <Route path="/dashboard-candidat/analyse-cv" element={<AnalyseCvPage />} />
          <Route path="/dashboard-candidat/trouver-stage" element={<CandidateFindInternshipPage />} />

          <Route path="/dashboard-recruteur" element={<DashboardRecruteurPage />} />
          <Route path="/dashboard_recruteur.html" element={<DashboardRecruteurPage />} />
          <Route path="/dashboard-recruteur/offres" element={<RecruiterOffersPage />} />
          <Route path="/dashboard-recruteur/candidats" element={<RecruiterCandidatesPage />} />
          <Route path="/dashboard-recruteur/rapports-ia" element={<RecruiterReportsPage />} />
          <Route path="/dashboard-recruteur/creer-offre" element={<RecruiterCreateOfferPage />} />

          <Route path="/dashboard-administrateur" element={<DashboardAdministrateurPage />} />
          <Route path="/dashboard_administrateur.html" element={<DashboardAdministrateurPage />} />
          <Route path="/dashboard-administrateur/analytique-ia" element={<AdminAnalyticsPage />} />
          <Route path="/dashboard-administrateur/parametres" element={<AdminSettingsPage />} />
          <Route path="/dashboard-administrateur/utilisateurs" element={<AdminUtilisateursPage />} />
          <Route path="/dashboard-administrateur/offres" element={<AdminOffresPage />} />

          <Route path="/admin-utilisateurs" element={<AdminUtilisateursPage />} />
          <Route path="/admin_utilisateurs.html" element={<AdminUtilisateursPage />} />

          <Route path="/admin-offres" element={<AdminOffresPage />} />
          <Route path="/admin_offres.html" element={<AdminOffresPage />} />

          <Route path="/user-settings" element={<UserSettingsPage />} />
          <Route path="/parametres" element={<UserSettingsPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { recruiterNavItems } from '../lib/data/dashboardData';
import { useUserSearch } from '../lib/useUserSearch';
import { useAuthStore } from '../store/authStore';
import { DashboardShell } from './dashboard/DashboardShell';

export function RecruiterLayout({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { searchResults, setSearchInput, clearSearch } = useUserSearch();
  const fullName = `${user?.firstName || user?.profile?.firstName || ''} ${user?.lastName || user?.profile?.lastName || ''}`.trim();
  const avatarSrc =
    user?.avatar ||
    user?.profile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'Recruteur')}&background=00288e&color=fff&rounded=true`;

  const handleAvatarClick = () => {
    navigate('/profile/me');
  };

  const profile = user
    ? {
        name: fullName || user.email || 'Recruteur',
        role:
          user.company?.name
          || user.profile?.company?.name
          || 'Entreprise non assignée',
        image: avatarSrc,
      }
    : undefined;

  const action = {
    label: 'Nouvelle Offre',
    icon: 'add_circle',
    to: '/recruiter/jobs/new',
  };

  return (
    <>
      <DashboardShell
        variant="glass"
        sectionLabel="Espace Recruteur"
        title={`Bonjour, ${fullName || user?.email || 'Recruteur'}`}
        searchPlaceholder="Chercher un talent, un CV..."
        onSearchChange={setSearchInput}
        onSearchResultClick={(result) => {
          clearSearch();
          if (result.to) {
            navigate(result.to);
          }
        }}
        navItems={recruiterNavItems}
        profile={profile}
        searchResults={searchResults}
        onAvatarClick={handleAvatarClick}
        action={action}
      >
        {children}
      </DashboardShell>
    </>
  );
}

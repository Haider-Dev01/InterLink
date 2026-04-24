import { useRef, type ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import { DashboardShell } from './dashboard/DashboardShell';
import { profileService } from '../services/profileService';

export function RecruiterLayout({ children }: { children: ReactNode }) {
  const { user, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      try {
        const data = await profileService.uploadAvatar(file);
        // Assuming data.user contains the updated user with the new avatar
        setUser({ ...user, avatar: data.user?.avatar || data.avatar });
      } catch (error) {
        console.error('Failed to upload avatar', error);
      }
    }
  };

  const profile = user ? {
    name: `${user.firstName || 'Recruteur'} ${user.lastName || ''}`.trim(),
    role: user.jobTitle || 'RH Manager',
    image: user.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
  } : undefined;

  const navItems = [
    { label: 'Vue d\'ensemble', icon: 'dashboard', to: '/recruiter/dashboard' },
    { label: 'Mes Offres', icon: 'work', to: '/recruiter/offers' },
    { label: 'Candidats', icon: 'group', to: '/recruiter/candidates' },
    { label: 'Rapports IA', icon: 'analytics', to: '/recruiter/reports' },
  ];

  const action = {
    label: 'Nouvelle Offre',
    icon: 'add_circle',
    to: '/recruiter/offers/new'
  };

  return (
    <>
      <DashboardShell
        variant="glass"
        sectionLabel="Espace Recruteur"
        title={`Bonjour, ${user?.firstName || 'Recruteur'}`}
        searchPlaceholder="Chercher un talent, un CV..."
        navItems={navItems}
        profile={profile}
        onAvatarClick={handleAvatarClick}
        action={action}
      >
        {children}
      </DashboardShell>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </>
  );
}

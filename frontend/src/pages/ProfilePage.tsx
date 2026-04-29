import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { DashboardShell } from '../components/dashboard/DashboardShell';
import { SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { buildDashboardProfile } from '../lib/userProfile';
import { useReactPageAnimations } from '../lib/reactPageAnimations';
import { connectionService } from '../services/connectionService';
import { profileService } from '../services/profileService';
import { userService } from '../services/userService';
import { useAuthStore } from '../store/authStore';

function extractUserPayload(response: any) {
  return response?.data?.user ?? response?.user ?? null;
}

type ConnectionTarget = {
  userId: string;
  status: 'none' | 'pending' | 'accepted' | 'rejected';
  direction: 'incoming' | 'outgoing' | null;
  canMessage: boolean;
};

export default function ProfilePage() {
  const rootRef = useRef(null);
  useReactPageAnimations(rootRef);
  const navigate = useNavigate();
  const { id, userId } = useParams();
  const routeUserId = id ?? userId;
  const authUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const normalizedUserId = routeUserId === 'me' ? authUser?.id : routeUserId;
  const isOwnProfile = !routeUserId || routeUserId === 'me' || routeUserId === authUser?.id;

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    linkedinUrl: '',
    githubUsername: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [viewedUser, setViewedUser] = useState<Record<string, any> | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionTarget | null>(null);
  const [isLoadingConnection, setIsLoadingConnection] = useState(false);
  const [connectionActionLoading, setConnectionActionLoading] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!isOwnProfile && !normalizedUserId) {
        return;
      }

      setIsLoadingProfile(true);
      setLoadError(null);

      try {
        let user: Record<string, any> | null = null;

        if (isOwnProfile) {
          user = authUser ?? null;
          if (!user) {
            const response = await userService.getMe();
            user = extractUserPayload(response);
          }
        } else {
          const response = await userService.getById(normalizedUserId!);
          user = extractUserPayload(response);
        }

        if (!active) {
          return;
        }

        if (!user) {
          throw new Error('Aucune donnee utilisateur recue depuis le backend.');
        }

        const profile = user.profile;

        setViewedUser(user);
        setForm({
          firstName: profile?.firstName || user.firstName || '',
          lastName: profile?.lastName || user.lastName || '',
          bio: profile?.bio || user.bio || '',
          location: user?.location || '',
          linkedinUrl: profile?.linkedinUrl || '',
          githubUsername: profile?.githubUsername || '',
        });

        if (isOwnProfile) {
          setUser(user);
        }
      } catch (error) {
        if (!active) {
          return;
        }

        console.error('Failed to load profile', error);
        setViewedUser(null);
        const backendMessage = (error as any)?.response?.data?.message;
        setLoadError(backendMessage || 'Impossible de charger ce profil depuis le backend.');
      } finally {
        if (active) {
          setIsLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [isOwnProfile, normalizedUserId, setUser, authUser]);

  const refreshConnectionState = async (targetUserId: string) => {
    const response = await connectionService.getConnections(targetUserId);
    setConnectionState((response.data?.target ?? null) as ConnectionTarget | null);
  };

  useEffect(() => {
    let active = true;

    async function loadConnectionState() {
      if (isOwnProfile || !normalizedUserId) {
        setConnectionState(null);
        setConnectionMessage(null);
        setIsLoadingConnection(false);
        return;
      }

      setIsLoadingConnection(true);
      try {
        const response = await connectionService.getConnections(normalizedUserId);
        if (!active) {
          return;
        }
        setConnectionState((response.data?.target ?? null) as ConnectionTarget | null);
      } catch (error: any) {
        if (!active) {
          return;
        }
        setConnectionMessage(error?.response?.data?.message || 'Etat de connexion indisponible.');
      } finally {
        if (active) {
          setIsLoadingConnection(false);
        }
      }
    }

    loadConnectionState();
    return () => {
      active = false;
    };
  }, [isOwnProfile, normalizedUserId]);

  const viewerProfile = useMemo(() => buildDashboardProfile(authUser), [authUser]);

  const displayedProfile = useMemo(() => {
    const baseUser = viewedUser ?? (isOwnProfile ? authUser : null);

    return buildDashboardProfile({
      ...baseUser,
      firstName: form.firstName || baseUser?.firstName || baseUser?.profile?.firstName,
      lastName: form.lastName || baseUser?.lastName || baseUser?.profile?.lastName,
      avatar: baseUser?.avatar || baseUser?.profile?.avatarUrl,
      role: baseUser?.role,
      email: baseUser?.email,
    });
  }, [form.firstName, form.lastName, authUser, viewedUser, isOwnProfile]);

  const updateField = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const homePath = useMemo(() => {
    const role = (authUser?.role || '').toLowerCase();
    if (role === 'recruiter') return '/recruiter/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/candidate/dashboard';
  }, [authUser?.role]);

  const navItems = useMemo(
    () => [
      { label: 'Tableau de bord', icon: 'dashboard', to: homePath },
      { label: 'Mon profil', icon: 'person', to: '/profile/me' },
      { label: 'Messagerie', icon: 'chat', to: '/messages' },
    ],
    [homePath],
  );

  const sectionLabel = useMemo(() => {
    const role = (authUser?.role || '').toLowerCase();
    if (role === 'recruiter') return 'Espace Recruteur';
    if (role === 'admin') return 'Espace Admin';
    return 'Espace Candidat';
  }, [authUser?.role]);

  const handleSave = async () => {
    try {
      if (!isOwnProfile) {
        return;
      }

      setSaving(true);
      const response = await userService.updateMe(form);
      setUser(response.data?.user ?? null);
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !isOwnProfile) {
      return;
    }

    try {
      setUploadingAvatar(true);
      const response = await profileService.uploadAvatar(file);
      setUser({
        ...authUser,
        profile: response.data?.profile,
        avatar: response.data?.avatarUrl ?? response.data?.profile?.avatarUrl ?? authUser?.avatar,
      });
    } catch (error) {
      console.error('Failed to upload avatar', error);
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const handleConnectionRequest = async () => {
    if (!normalizedUserId) {
      return;
    }

    try {
      setConnectionActionLoading(true);
      setConnectionMessage(null);
      await connectionService.requestConnection(normalizedUserId);
      await refreshConnectionState(normalizedUserId);
      setConnectionMessage('Invitation envoyee.');
    } catch (error: any) {
      setConnectionMessage(error?.response?.data?.message || 'Impossible d envoyer l invitation.');
    } finally {
      setConnectionActionLoading(false);
    }
  };

  const handleAcceptConnection = async () => {
    if (!normalizedUserId) {
      return;
    }

    try {
      setConnectionActionLoading(true);
      setConnectionMessage(null);
      await connectionService.acceptConnection(normalizedUserId);
      await refreshConnectionState(normalizedUserId);
      setConnectionMessage('Connexion acceptee.');
    } catch (error: any) {
      setConnectionMessage(error?.response?.data?.message || 'Impossible d accepter la connexion.');
    } finally {
      setConnectionActionLoading(false);
    }
  };

  const handleRejectConnection = async () => {
    if (!normalizedUserId) {
      return;
    }

    try {
      setConnectionActionLoading(true);
      setConnectionMessage(null);
      await connectionService.rejectConnection(normalizedUserId);
      await refreshConnectionState(normalizedUserId);
      setConnectionMessage('Invitation refusee.');
    } catch (error: any) {
      setConnectionMessage(error?.response?.data?.message || 'Impossible de refuser cette invitation.');
    } finally {
      setConnectionActionLoading(false);
    }
  };

  return (
    <div ref={rootRef}>
      <DashboardShell
        action={{ icon: 'home', label: 'Retour dashboard', to: homePath }}
        navItems={navItems}
        onAvatarClick={() => navigate('/profile/me')}
        onNotificationsClick={() => navigate('/notifications')}
        profile={viewerProfile}
        sectionLabel={sectionLabel}
        title={isOwnProfile ? 'Mon profil' : 'Profil utilisateur'}
      >
        <SurfaceCard className="p-8" data-animate="card">
          {isLoadingProfile ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <p className="text-sm font-bold text-on-surface-variant">Chargement du profil...</p>
            </div>
          ) : loadError ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-center">
              <p className="text-lg font-black text-on-surface">Profil indisponible</p>
              <p className="text-sm text-on-surface-variant">{loadError}</p>
            </div>
          ) : (
            <>
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
                <div className="h-24 w-24 overflow-hidden rounded-full border border-surface-variant bg-surface shadow-sm">
                  <img alt={displayedProfile.name} className="h-full w-full object-cover" src={displayedProfile.image} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-on-surface">{displayedProfile.name}</p>
                  <p className="text-xs uppercase tracking-widest text-on-surface-variant">Vue de profil</p>
                  {isOwnProfile ? (
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-surface-variant px-4 py-2 text-sm font-bold text-on-surface">
                      <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                      <span>{uploadingAvatar ? 'Upload...' : 'Changer la photo'}</span>
                      <input accept=".png,.jpg,.jpeg,.webp" className="hidden" disabled={uploadingAvatar} onChange={handleAvatarUpload} type="file" />
                    </label>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-on-surface-variant">Consultation publique du profil</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {isLoadingConnection ? (
                          <span className="text-xs text-on-surface-variant">Verification du reseau...</span>
                        ) : connectionState?.canMessage ? (
                          <button
                            className="interactive-scale rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white"
                            onClick={() => navigate(`/messages/${normalizedUserId}`)}
                            type="button"
                          >
                            Message
                          </button>
                        ) : connectionState?.status === 'pending' && connectionState.direction === 'incoming' ? (
                          <>
                            <button
                              className="interactive-scale rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                              disabled={connectionActionLoading}
                              onClick={handleAcceptConnection}
                              type="button"
                            >
                              Accepter
                            </button>
                            <button
                              className="interactive-scale rounded-xl border border-surface-variant px-4 py-2 text-sm font-bold text-on-surface disabled:opacity-60"
                              disabled={connectionActionLoading}
                              onClick={handleRejectConnection}
                              type="button"
                            >
                              Refuser
                            </button>
                          </>
                        ) : connectionState?.status === 'pending' && connectionState.direction === 'outgoing' ? (
                          <button className="rounded-xl border border-surface-variant px-4 py-2 text-sm font-bold text-on-surface-variant" disabled type="button">
                            Invitation envoyee
                          </button>
                        ) : (
                          <button
                            className="interactive-scale rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                            disabled={connectionActionLoading}
                            onClick={handleConnectionRequest}
                            type="button"
                          >
                            {connectionActionLoading ? 'Envoi...' : 'Connect'}
                          </button>
                        )}

                      </div>
                      {connectionMessage ? <p className="text-xs text-on-surface-variant">{connectionMessage}</p> : null}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Prenom</span>
                  <input className="w-full rounded-xl border border-surface-variant bg-surface px-4 py-3" disabled={!isOwnProfile} onChange={(e) => updateField('firstName', e.target.value)} value={form.firstName} />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Nom</span>
                  <input className="w-full rounded-xl border border-surface-variant bg-surface px-4 py-3" disabled={!isOwnProfile} onChange={(e) => updateField('lastName', e.target.value)} value={form.lastName} />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Bio</span>
                  <textarea className="min-h-28 w-full rounded-xl border border-surface-variant bg-surface px-4 py-3" disabled={!isOwnProfile} onChange={(e) => updateField('bio', e.target.value)} value={form.bio} />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Ville</span>
                  <input className="w-full rounded-xl border border-surface-variant bg-surface px-4 py-3" disabled={!isOwnProfile} onChange={(e) => updateField('location', e.target.value)} value={form.location} />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant">LinkedIn</span>
                  <input className="w-full rounded-xl border border-surface-variant bg-surface px-4 py-3" disabled={!isOwnProfile} onChange={(e) => updateField('linkedinUrl', e.target.value)} value={form.linkedinUrl} />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant">GitHub</span>
                  <input className="w-full rounded-xl border border-surface-variant bg-surface px-4 py-3" disabled={!isOwnProfile} onChange={(e) => updateField('githubUsername', e.target.value)} value={form.githubUsername} />
                </label>
              </div>

              {isOwnProfile ? (
                <div className="mt-8 flex justify-end">
                  <button className="interactive-scale rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white" disabled={saving} onClick={handleSave} type="button">
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </SurfaceCard>
      </DashboardShell>
    </div>
  );
}

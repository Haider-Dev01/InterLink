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
import { cvService } from '../services/cvService';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

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
  const [uploadingCv, setUploadingCv] = useState(false);
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

      // Optimization: if it's own profile and we already have authUser, don't show loading spinner
      // unless we are explicitly fetching (which we do once at mount or if data is missing)
      const needsFetch = !isOwnProfile || !authUser;
      if (needsFetch) {
        setIsLoadingProfile(true);
      }
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

        // We only call setUser if we actually fetched from backend 
        // to avoid triggering redundant store updates and potential loops
        if (isOwnProfile && !authUser) {
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
  }, [isOwnProfile, normalizedUserId]);

  // Sync own profile data when authUser updates (e.g. via CV parsing)
  useEffect(() => {
    if (isOwnProfile && authUser) {
      const profile = authUser.profile;
      setForm((prev) => ({
        ...prev,
        firstName: prev.firstName || profile?.firstName || authUser.firstName || '',
        lastName: prev.lastName || profile?.lastName || authUser.lastName || '',
        bio: prev.bio || profile?.bio || authUser.bio || '',
        location: prev.location || authUser.location || '',
        linkedinUrl: prev.linkedinUrl || profile?.linkedinUrl || '',
        githubUsername: prev.githubUsername || profile?.githubUsername || '',
      }));
    }
  }, [authUser, isOwnProfile]);

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
      toast.success('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('[UpdateMe] Request error:', error);
      const backendMessage = (error as any)?.response?.data?.message;
      const backendErrors = (error as any)?.response?.data?.errors;
      
      if (backendErrors && Array.isArray(backendErrors)) {
        console.table(backendErrors);
        const firstError = backendErrors[0];
        const path = Array.isArray(firstError.path) ? firstError.path.join('.') : firstError.path;
        toast.error(`Validation: ${path} - ${firstError.message}`);
      } else {
        toast.error(backendMessage || 'Erreur lors de la mise à jour du profil.');
      }
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
      const updatedUser = {
        ...authUser,
        profile: response.data?.profile,
        avatar: response.data?.avatarUrl ?? response.data?.profile?.avatarUrl ?? authUser?.avatar,
      };
      
      setUser(updatedUser);
      if (isOwnProfile) {
        setViewedUser(updatedUser);
      }
      toast.success('Photo de profil mise à jour !');
    } catch (error) {
      console.error('Failed to upload avatar', error);
      toast.error('Erreur lors de l\'envoi de la photo.');
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const handleCvUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !isOwnProfile) {
      return;
    }

    try {
      setUploadingCv(true);
      await cvService.uploadCv(file);
      const response = await userService.getMe();
      setUser(extractUserPayload(response));
      toast.success('CV mis à jour avec succès !');
    } catch (error) {
      console.error('[CVUpload] Failed to upload CV:', error);
      toast.error('Erreur lors de l\'envoi du CV.');
    } finally {
      setUploadingCv(false);
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

  const profileRole = viewedUser?.role || authUser?.role;
  const isCandidate = (profileRole || '').toLowerCase() === 'candidate';

  return (
    <div ref={rootRef}>
      <DashboardShell
        action={{ icon: 'home', label: 'Retour dashboard', to: homePath }}
        navItems={navItems}
        onAvatarClick={() => navigate('/profile/me')}
        onNotificationsClick={() => navigate('/notifications')}
        profile={viewerProfile}
        sectionLabel={sectionLabel}
        title={isOwnProfile ? 'Mon profil' : (isCandidate ? 'Profil candidat' : 'Profil recruteur')}
      >
        {isLoadingProfile ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <span className="animate-spin h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full" />
          </div>
        ) : loadError ? (
          <SurfaceCard className="p-12 text-center" data-animate="card">
            <div className="flex flex-col items-center max-w-md mx-auto">
              <span className="material-symbols-outlined text-red-500 text-6xl mb-6">error</span>
              <h2 className="text-2xl font-black text-on-surface mb-3">Profil indisponible</h2>
              <p className="text-on-surface-variant mb-8 leading-relaxed">{loadError}</p>
              <button
                onClick={() => navigate(homePath)}
                className="bg-primary text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-primary/25 hover:scale-[1.02] transition-transform"
                type="button"
              >
                Retour au tableau de bord
              </button>
            </div>
          </SurfaceCard>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-8">
              <SurfaceCard className="p-0 overflow-hidden" data-animate="card">
                <div className="h-32 bg-gradient-to-r from-primary to-secondary opacity-90" />
                <div className="px-8 pb-8">
                  <div className="relative flex flex-col md:flex-row gap-6 -mt-12 mb-6">
                    <div className="h-32 w-32 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-surface shadow-xl">
                      <img alt={displayedProfile.name} className="h-full w-full object-cover" src={displayedProfile.image} />
                      {isOwnProfile && (
                        <label className="absolute bottom-2 right-2 md:right-auto md:left-24 h-10 w-10 flex items-center justify-center rounded-xl bg-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-primary">photo_camera</span>
                          <input accept=".png,.jpg,.jpeg,.webp" className="hidden" disabled={uploadingAvatar} onChange={handleAvatarUpload} type="file" />
                        </label>
                      )}
                    </div>
                    <div className="mt-14 md:mt-12 flex-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h1 className="text-3xl font-black text-on-surface">{displayedProfile.name}</h1>
                          <p className="text-lg font-medium text-primary uppercase tracking-wider mt-1">{displayedProfile.role || (isCandidate ? 'Candidat' : 'Recruteur')}</p>
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-on-surface-variant text-sm">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[18px]">location_on</span>
                              <span>{form.location || 'Non spécifiée'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[18px]">mail</span>
                              <span>{viewedUser?.email || authUser?.email}</span>
                            </div>
                          </div>
                        </div>
                        {!isOwnProfile && (
                          <div className="flex gap-3">
                            {isLoadingConnection ? (
                              <div className="h-10 w-24 bg-surface-variant animate-pulse rounded-xl" />
                            ) : connectionState?.canMessage ? (
                              <button
                                className="interactive-scale rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 flex items-center gap-2"
                                onClick={() => navigate(`/messages/${normalizedUserId}`)}
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[18px]">chat</span>
                                Message
                              </button>
                            ) : connectionState?.status === 'pending' && connectionState.direction === 'incoming' ? (
                              <div className="flex gap-2">
                                <button
                                  className="interactive-scale rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 disabled:opacity-60"
                                  disabled={connectionActionLoading}
                                  onClick={handleAcceptConnection}
                                  type="button"
                                >
                                  Accepter
                                </button>
                                <button
                                  className="interactive-scale rounded-xl border border-surface-variant bg-white px-4 py-2.5 text-sm font-bold text-on-surface hover:bg-surface disabled:opacity-60"
                                  disabled={connectionActionLoading}
                                  onClick={handleRejectConnection}
                                  type="button"
                                >
                                  Refuser
                                </button>
                              </div>
                            ) : connectionState?.status === 'pending' ? (
                              <button className="rounded-xl border border-surface-variant bg-surface px-6 py-2.5 text-sm font-bold text-on-surface-variant flex items-center gap-2" disabled type="button">
                                <span className="material-symbols-outlined text-[18px]">schedule</span>
                                Invitation envoyée
                              </button>
                            ) : (
                              <button
                                className="interactive-scale rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-60"
                                disabled={connectionActionLoading}
                                onClick={handleConnectionRequest}
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[18px]">person_add</span>
                                {connectionActionLoading ? 'Envoi...' : 'Se connecter'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 space-y-12">
                    <section>
                      <h2 className="text-xl font-black text-on-surface flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-primary">person</span>
                        Biographie
                      </h2>
                      {isOwnProfile ? (
                        <textarea
                          className="w-full min-h-[120px] rounded-2xl border border-surface-variant bg-surface p-4 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          placeholder="Parlez de vous, de vos aspirations et de ce que vous recherchez..."
                          onChange={(e) => updateField('bio', e.target.value)}
                          value={form.bio}
                        />
                      ) : (
                        <p className="text-on-surface-variant leading-relaxed bg-surface-variant/20 p-6 rounded-2xl border border-surface-variant/30 italic">
                          {form.bio || "Aucune biographie rédigée pour le moment."}
                        </p>
                      )}
                    </section>

                    {isCandidate && (
                      <section>
                        <h2 className="text-xl font-black text-on-surface flex items-center gap-2 mb-4">
                          <span className="material-symbols-outlined text-primary">psychology</span>
                          Compétences extraites
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          {(viewedUser?.skills || authUser?.skills || []).length > 0 ? (
                            (viewedUser?.skills || authUser?.skills || []).map((skill: any) => (
                              <div
                                key={skill.id}
                                className="group flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10 transition-colors"
                              >
                                <span>{skill.name}</span>
                                {skill.confidence && (
                                  <span className="text-[10px] bg-primary/10 px-1.5 py-0.5 rounded-md opacity-70">
                                    {Math.round(skill.confidence * 100)}%
                                  </span>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-on-surface-variant italic py-4">Aucune compétence détectée. Importez un CV pour les extraire automatiquement.</p>
                          )}
                        </div>
                      </section>
                    )}

                    <section className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Coordonnées & Réseaux</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-surface-variant/50">
                            <span className="material-symbols-outlined text-primary">link</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black uppercase text-on-surface-variant/60">LinkedIn</p>
                              {isOwnProfile ? (
                                <input
                                  className="w-full bg-transparent text-sm font-bold outline-none"
                                  placeholder="URL du profil"
                                  onChange={(e) => updateField('linkedinUrl', e.target.value)}
                                  value={form.linkedinUrl}
                                />
                              ) : (
                                <a href={form.linkedinUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-primary truncate block">
                                  {form.linkedinUrl || 'Non renseigné'}
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-surface-variant/50">
                            <span className="material-symbols-outlined text-primary">code</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black uppercase text-on-surface-variant/60">GitHub</p>
                              {isOwnProfile ? (
                                <input
                                  className="w-full bg-transparent text-sm font-bold outline-none"
                                  placeholder="Nom d'utilisateur"
                                  onChange={(e) => updateField('githubUsername', e.target.value)}
                                  value={form.githubUsername}
                                />
                              ) : (
                                <a href={`https://github.com/${form.githubUsername}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-primary truncate block">
                                  {form.githubUsername || 'Non renseigné'}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {isOwnProfile && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Localisation</h3>
                          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-surface-variant/50">
                            <span className="material-symbols-outlined text-primary">location_on</span>
                            <div className="flex-1">
                              <p className="text-[10px] font-black uppercase text-on-surface-variant/60">Ville cible</p>
                              <input
                                className="w-full bg-transparent text-sm font-bold outline-none"
                                placeholder="Ex: Paris, France"
                                onChange={(e) => updateField('location', e.target.value)}
                                value={form.location}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </section>
                  </div>

                  {isOwnProfile && (
                    <div className="mt-12 pt-8 border-t border-surface-variant/50 flex justify-end">
                      <button
                        className="interactive-scale flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-black text-white shadow-xl shadow-primary/30 hover:bg-primary-container transition-all"
                        disabled={saving}
                        onClick={handleSave}
                        type="button"
                      >
                        {saving ? (
                          <span className="animate-spin h-5 w-5 border-3 border-white/20 border-t-white rounded-full" />
                        ) : (
                          <>
                            <span className="material-symbols-outlined">save</span>
                            Enregistrer les modifications
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </SurfaceCard>
            </div>

            <div className="space-y-6">
              {isCandidate ? (
                <SurfaceCard className="p-6 border-primary/20 bg-primary/5" data-animate="card">
                  <h3 className="text-lg font-black text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    CV Nexus
                  </h3>
                  {(viewedUser?.cvUrl || authUser?.cvUrl) ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-white border border-primary/10 shadow-sm flex items-center gap-3">
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-red-100 text-red-600">
                          <span className="material-symbols-outlined">picture_as_pdf</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-on-surface truncate">Curriculum Vitae</p>
                          <p className="text-[10px] text-on-surface-variant">Document PDF</p>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <button
                          onClick={() => window.open(viewedUser?.cvUrl || authUser?.cvUrl, '_blank')}
                          className="w-full interactive-scale flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-black text-white shadow-lg shadow-primary/20"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                          Voir le document
                        </button>
                        {isOwnProfile && (
                          <label className="w-full interactive-scale flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-white py-3 text-sm font-black text-primary cursor-pointer hover:bg-primary/5 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">upload</span>
                            {uploadingCv ? 'Mise à jour...' : 'Mettre à jour'}
                            <input accept=".pdf,.doc,.docx" className="hidden" disabled={uploadingCv} onChange={handleCvUpload} type="file" />
                          </label>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-on-surface-variant italic mb-4">Aucun CV n'est actuellement lié à ce profil.</p>
                      {isOwnProfile && (
                        <label className="w-full interactive-scale flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-black text-white shadow-lg shadow-primary/20 cursor-pointer">
                          <span className="material-symbols-outlined text-[18px]">add_circle</span>
                          {uploadingCv ? 'Importation...' : 'Importer mon CV'}
                          <input accept=".pdf,.doc,.docx" className="hidden" disabled={uploadingCv} onChange={handleCvUpload} type="file" />
                        </label>
                      )}
                    </div>
                  )}
                </SurfaceCard>
              ) : (
                <SurfaceCard className="p-6 border-secondary/20 bg-secondary/5" data-animate="card">
                   <h3 className="text-lg font-black text-on-surface mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">business_center</span>
                    Recruteur Nexus
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white border border-secondary/10 shadow-sm">
                       <p className="text-xs font-black uppercase text-secondary mb-1">Entreprise</p>
                       <p className="text-sm font-bold text-on-surface">{viewedUser?.company?.name || authUser?.company?.name || 'Indépendant'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                       <div className="p-3 rounded-xl bg-white border border-surface-variant/30 text-center">
                          <p className="text-[10px] font-black text-on-surface-variant uppercase">Offres</p>
                          <p className="text-lg font-black text-secondary">{viewedUser?.company?.offersCount || 0}</p>
                       </div>
                       <div className="p-3 rounded-xl bg-white border border-surface-variant/30 text-center">
                          <p className="text-[10px] font-black text-on-surface-variant uppercase">Recrues</p>
                          <p className="text-lg font-black text-secondary">{viewedUser?.company?.hiredCount || 0}</p>
                       </div>
                    </div>
                  </div>
                </SurfaceCard>
              )}

              <SurfaceCard className="p-6" data-animate="card">
                <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant mb-4">Statistiques Profil</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface-variant">Vues du profil</span>
                    <span className="text-sm font-black text-on-surface">{viewedUser?.profile?.viewsCount || (authUser?.id === normalizedUserId ? authUser?.profile?.viewsCount : 0) || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-on-surface-variant">Membre depuis</span>
                    <span className="text-sm font-black text-on-surface">
                      {viewedUser?.createdAt ? new Date(viewedUser.createdAt).toLocaleDateString() : (authUser?.createdAt ? new Date(authUser?.createdAt).toLocaleDateString() : 'N/A')}
                    </span>
                  </div>
                </div>
              </SurfaceCard>
            </div>
          </div>
        )}
      </DashboardShell>
    </div>
  );
}

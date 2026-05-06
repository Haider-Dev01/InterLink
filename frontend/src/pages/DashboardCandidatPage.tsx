import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { DashboardShell } from '../components/dashboard/DashboardShell';
import { KpiCard, SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { candidateNavItems } from '../lib/data/dashboardData';
import { useUserSearch } from '../lib/useUserSearch';
import { useReactPageAnimations } from '../lib/reactPageAnimations';
import { aiAdviceService } from '../services/aiAdviceService';
import { applicationService } from '../services/applicationService';
import { dashboardCandidateService } from '../services/dashboardCandidateService';
import { userService } from '../services/userService';
import { cvService } from '../services/cvService';
import { bookmarkService } from '../services/bookmarkService';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

function statusClasses(tone: string) {
  switch (tone) {
    case 'secondary':
      return 'bg-secondary/10 text-secondary';
    case 'emerald':
      return 'bg-emerald-50 text-emerald-600';
    case 'red':
      return 'bg-red-50 text-red-600';
    default:
      return 'bg-primary/10 text-primary';
  }
}

export default function DashboardCandidatPage() {
  const rootRef = useRef(null);
  useReactPageAnimations(rootRef);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const authUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const activeTab = (searchParams.get('tab') as 'apercu' | 'candidatures') || 'apercu';
  const setActiveTab = (tab: string) => setSearchParams({ tab });

  const [recommendedOffers, setRecommendedOffers] = useState<any[]>([]);
  const [allApplications, setAllApplications] = useState<any[]>([]);
  const [activeApplications, setActiveApplications] = useState<any[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);
  const [dailyTips, setDailyTips] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isApplying, setIsApplying] = useState<Record<string, boolean>>({});
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isCvProcessing, setIsCvProcessing] = useState(false);
  const [cvData, setCvData] = useState<any>(null);
  
  const { searchResults, setSearchInput, clearSearch } = useUserSearch();

  const loadDashboard = async () => {
    const [recommendedRes, activeRes, interviewsRes, tipsRes, profileRes, allAppsRes, cvRes, bookmarksRes, appsRes] = await Promise.all([
      dashboardCandidateService.getRecommendedJobs(),
      dashboardCandidateService.getActiveApplications(),
      dashboardCandidateService.getUpcomingInterviews(),
      aiAdviceService.getDailyAdvice(),
      dashboardCandidateService.getUserStats(),
      applicationService.getMyApplications(),
      cvService.getMe(),
      bookmarkService.getBookmarks(),
      applicationService.getMyApplications()
    ]);

    setRecommendedOffers(recommendedRes.data?.offers ?? []);
    setActiveApplications(activeRes.data?.applications ?? []);
    setUpcomingInterviews(interviewsRes.data?.interviews ?? []);
    setDailyTips(tipsRes.data?.tips ?? []);
    setStats(profileRes.data?.stats ?? null);
    setAllApplications(allAppsRes.success && allAppsRes.data ? allAppsRes.data : []);
    setCvData(cvRes.data?.cv ?? null);
    
    if (bookmarksRes.success) {
      setSavedIds(new Set(bookmarksRes.data.bookmarks.map((b: any) => b.id)));
    }

    if (appsRes.success && Array.isArray(appsRes.data)) {
      setAppliedIds(new Set(appsRes.data.map((app: any) => app.offerId)));
    }

    // If bio was potentially auto-synced or updated, refresh user store
    if (cvRes.data?.cv?.parseStatus === 'done' && (!authUser?.profile?.bio && !authUser?.bio)) {
      const userRes = await userService.getMe();
      if (userRes.success && userRes.data?.user) {
        setUser(userRes.data.user);
      }
    }
  };

  useEffect(() => {
    loadDashboard().catch((error) => {
      console.error('Failed to load candidate dashboard', error);
    });

    // Check if CV is currently processing
    cvService.getMe().then(res => {
      if (res.data?.cv?.parseStatus === 'processing' || res.data?.cv?.parseStatus === 'pending') {
        setIsCvProcessing(true);
      }
    });
  }, []);

  // Polling profile and skills if CV is processing
  useEffect(() => {
    if (!isCvProcessing) return;

    const interval = setInterval(async () => {
      try {
        const cvRes = await cvService.getMe();
        const status = cvRes.data?.cv?.parseStatus;
        
        if (status === 'done') {
          setIsCvProcessing(false);
          // Refresh user data in store to see new bio/skills
          const userRes = await userService.getMe();
          if (userRes.success && userRes.data?.user) {
            setUser(userRes.data.user);
          }
          await loadDashboard();
        } else if (status === 'failed') {
          setIsCvProcessing(false);
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isCvProcessing, setUser]);

  const profile = useMemo(() => {
    const firstName = authUser?.firstName || authUser?.profile?.firstName || '';
    const lastName = authUser?.lastName || authUser?.profile?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Utilisateur';

    return {
      name: fullName,
      role: authUser?.role || 'Candidat',
      image:
        authUser?.avatar ||
        authUser?.profile?.avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=00288e&color=fff&rounded=true`,
    };
  }, [authUser]);

  const avgMatch = useMemo(() => {
    if (!allApplications.length) return 0;
    const scores = allApplications.map(app => {
      const match = app.candidate?.match_scores?.find((m: any) => m.offerId === app.offerId);
      return match ? (match.scoreFinal * 100) : 0;
    }).filter(s => s > 0);
    if (!scores.length) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [allApplications]);

  const handleApply = async (offerId: string) => {
    if (isApplying[offerId] || appliedIds.has(offerId)) return;
    try {
      setIsApplying((prev) => ({ ...prev, [offerId]: true }));
      await applicationService.apply({ offerId });
      setAppliedIds((prev) => new Set(prev).add(offerId));
      toast.success('Candidature envoyée !');
      await loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la candidature');
    } finally {
      setIsApplying((prev) => ({ ...prev, [offerId]: false }));
    }
  };

  const handleSaveBookmark = async (offerId: string) => {
    if (savedIds.has(offerId)) return;
    try {
      setIsSaving((prev) => ({ ...prev, [offerId]: true }));
      await bookmarkService.bookmarkOffer(offerId);
      setSavedIds((prev) => new Set(prev).add(offerId));
      toast.success('Offre enregistrée dans vos favoris');
    } catch (error) {
      console.error('Save bookmark failed', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving((prev) => ({ ...prev, [offerId]: false }));
    }
  };

  return (
    <div ref={rootRef}>
      <DashboardShell
        action={{ icon: 'description', label: 'CV Nexus', to: '/candidate/dashboard/cv-nexus' }}
        navItems={candidateNavItems}
        onAvatarClick={() => navigate('/profile/me')}
        onNotificationsClick={() => navigate('/notifications')}
        onSearchChange={setSearchInput}
        onSearchResultClick={(result) => {
          clearSearch();
          if (result.to) navigate(result.to);
        }}
        profile={profile}
        searchPlaceholder="Rechercher etudiants et recruteurs..."
        searchResults={searchResults}
        sectionLabel="Espace Candidat"
        title="Centre de Commandes"
      >
        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard icon="work" label="Offres recommandees" value={String(recommendedOffers.length)} />
          <KpiCard icon="description" label="Candidatures actives" tone="secondary" value={String(stats?.activeApplications ?? activeApplications.length)} />
          <KpiCard icon="psychology" label="Match moyen" tone="emerald" value={`${avgMatch}%`} />
          <KpiCard icon="visibility" label="Vues de profil" tone="amber" value={String(stats?.profileViews ?? 0)} />
        </div>

        {/* CV Processing Alert */}
        {isCvProcessing && (
          <div className="mt-6 flex items-center gap-4 rounded-3xl bg-primary/10 p-5 text-primary animate-pulse">
            <span className="material-symbols-outlined text-3xl">psychology</span>
            <div>
              <p className="font-black">Analyse du CV en cours...</p>
              <p className="text-sm">Votre bio et vos competences seront extraites automatiquement dans quelques instants.</p>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="mt-8 flex gap-2 rounded-2xl bg-surface-variant/20 p-1.5 w-fit">
          <button
            onClick={() => setActiveTab('apercu')}
            className={`rounded-xl px-6 py-2.5 text-sm font-black transition-all ${activeTab === 'apercu' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Aperçu
          </button>
          <button
            onClick={() => setActiveTab('candidatures')}
            className={`rounded-xl px-6 py-2.5 text-sm font-black transition-all ${activeTab === 'candidatures' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Mes candidatures ({allApplications.length})
          </button>
        </div>

        {activeTab === 'apercu' ? (
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <SurfaceCard className="p-8" data-animate="card">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-black text-on-surface">Offres recommandees</h2>
                <button className="text-sm font-bold text-primary" onClick={() => navigate('/trouver-stage')} type="button">
                  Voir tout
                </button>
              </div>

              <div className="space-y-4">
                {recommendedOffers.map((offer) => (
                  <div className="rounded-2xl border border-surface-variant bg-surface p-5 hover:border-primary/40 transition-colors" key={offer.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <button className="text-left" onClick={() => navigate(`/job/${offer.id}`)} type="button">
                          <h3 className="text-lg font-black text-on-surface hover:text-primary">{offer.title}</h3>
                        </button>
                        <p className="mt-1 text-sm text-on-surface-variant">{offer.company?.name || 'Entreprise'} · {offer.location || 'Lieu'}</p>
                      </div>
                      <div className="rounded-xl bg-primary/10 px-3 py-2 text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Match</p>
                        <p className="text-lg font-black text-primary">{offer.matchScore == null ? '--' : `${offer.matchScore}%`}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button 
                        className={`interactive-scale rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-md transition-all ${savedIds.has(offer.id) ? 'bg-secondary text-white' : isSaving[offer.id] ? 'bg-surface-variant text-on-surface-variant' : 'bg-surface border border-surface-variant text-on-surface hover:bg-surface-variant'}`}
                        onClick={() => handleSaveBookmark(offer.id)}
                        disabled={isSaving[offer.id]}
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-icons-outlined text-sm">{isSaving[offer.id] ? 'sync' : savedIds.has(offer.id) ? 'bookmark' : ''}</span>
                          <span>{savedIds.has(offer.id) ? 'Enregistré' : 'Enregistrer'}</span>
                        </div>
                      </button>
                      <button className="interactive-scale rounded-xl border border-surface-variant px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-md" onClick={() => navigate(`/job/${offer.id}`)} type="button">
                        Détails
                      </button>
                      <button 
                        className={`interactive-scale rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-md transition-all ${appliedIds.has(offer.id) ? 'bg-gray-400 text-white cursor-not-allowed' : Boolean(isApplying[offer.id]) ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed' : 'bg-primary text-white shadow-lg shadow-primary/20'}`} 
                        disabled={Boolean(isApplying[offer.id] || appliedIds.has(offer.id))} 
                        onClick={() => handleApply(offer.id)} 
                        type="button"
                      >
                        {appliedIds.has(offer.id) ? 'Postulé' : isApplying[offer.id] ? 'Envoi...' : 'Postuler'}
                      </button>
                    </div>
                  </div>
                ))}
                {!recommendedOffers.length && <p className="py-8 text-center text-on-surface-variant italic">Aucune recommandation pour le moment.</p>}
              </div>
            </SurfaceCard>

            <div className="space-y-6">
              {/* CV Nexus Preview section */}
              <SurfaceCard className="p-8 border-primary/20 bg-primary/5 shadow-lg shadow-primary/5" data-animate="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-black text-on-surface">Aperçu CV Nexus</h3>
                  <button 
                    onClick={() => navigate('/candidate/dashboard/cv-nexus')}
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-primary/10 text-primary shadow-sm hover:scale-110 transition-transform"
                    title="Voir CV complet"
                  >
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                </div>
                
                {(authUser?.cvUrl || cvData || authUser?.profile?.bio || authUser?.bio) ? (
                  <div className="space-y-6">
                    <section>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Résumé Professionnel</p>
                      <p className="text-sm leading-relaxed text-on-surface-variant italic">
                        {authUser?.profile?.bio || authUser?.bio || (isCvProcessing ? "Analyse IA en cours..." : "Résumé non renseigné. Consultez le Nexus complet pour plus de détails.")}
                      </p>
                    </section>

                    <section>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Top Compétences Extraction IA</p>
                      <div className="flex flex-wrap gap-2">
                        {(authUser?.skills || []).slice(0, 6).map((s: any) => (
                          <span key={s.id} className="bg-white px-3 py-1.5 rounded-xl text-xs font-bold text-primary shadow-sm border border-primary/5">
                            {s.name}
                          </span>
                        ))}
                        {!(authUser?.skills || []).length && <p className="text-xs text-on-surface-variant italic">Aucune compétence détectée.</p>}
                      </div>
                    </section>

                    {cvData?.parsing?.sections?.experience && (
                      <section>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Dernière Expérience</p>
                        <p className="text-xs text-on-surface-variant line-clamp-3">
                          {typeof cvData.parsing.sections.experience === 'string' 
                            ? cvData.parsing.sections.experience 
                            : Array.isArray(cvData.parsing.sections.experience) 
                              ? cvData.parsing.sections.experience[0] 
                              : 'Voir CV complet'}
                        </p>
                      </section>
                    )}

                    {cvData?.parsing?.sections?.education && (
                      <section>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Formation</p>
                        <p className="text-xs text-on-surface-variant line-clamp-2">
                          {typeof cvData.parsing.sections.education === 'string' 
                            ? cvData.parsing.sections.education 
                            : Array.isArray(cvData.parsing.sections.education) 
                              ? cvData.parsing.sections.education[0] 
                              : 'Voir CV complet'}
                        </p>
                      </section>
                    )}

                    <div className="pt-4 border-t border-primary/10 flex justify-center">
                      <button 
                        onClick={() => navigate('/candidate/dashboard/cv-nexus')}
                        className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
                      >
                        Consulter mon Nexus complet
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/10 shadow-sm">
                      <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
                    </div>
                    <p className="text-sm text-on-surface-variant italic mb-6">
                      Importez votre CV pour générer automatiquement votre biographie et extraire vos compétences.
                    </p>
                    <button 
                      onClick={() => navigate('/candidate/dashboard/analyse-cv')}
                      className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    >
                      Importer mon CV
                    </button>
                  </div>
                )}
              </SurfaceCard>

              <SurfaceCard className="p-8" data-animate="card">
                <h3 className="text-2xl font-black text-on-surface">IA du jour</h3>
                <div className="mt-5 space-y-3">
                  {dailyTips.map((tip, index) => (
                    <div className="rounded-xl bg-surface px-4 py-3 text-sm text-on-surface-variant border border-surface-variant/30" key={`${tip}-${index}`}>
                      {tip}
                    </div>
                  ))}
                </div>
              </SurfaceCard>

              <SurfaceCard className="p-8" data-animate="card">
                <h3 className="text-2xl font-black text-on-surface">Entretiens prevus</h3>
                <div className="mt-5 space-y-3">
                  {upcomingInterviews.length ? upcomingInterviews.map((interview) => (
                    <div className="rounded-xl border border-surface-variant bg-surface px-4 py-3" key={interview.id}>
                      <p className="text-sm font-bold text-on-surface">{interview.offer?.title || 'Entretien'}</p>
                      <p className="text-xs text-on-surface-variant">{new Date(interview.scheduledAt).toLocaleString()}</p>
                    </div>
                  )) : (
                    <p className="text-sm text-on-surface-variant italic">Aucun entretien programme.</p>
                  )}
                </div>
              </SurfaceCard>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <SurfaceCard className="p-8" data-animate="card">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-on-surface">Pipeline de suivi</h2>
                  <p className="mt-2 text-sm text-on-surface-variant">Suivi en temps reel de vos candidatures et scores de matching IA.</p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600">Sync Active</span>
              </div>

              <div className="space-y-4">
                {allApplications.map((application) => (
                  <div className="grid gap-4 rounded-[1.5rem] border border-surface-variant bg-surface p-6 md:grid-cols-[1.1fr_0.6fr_0.4fr] hover:border-primary/30 transition-all shadow-sm" key={application.id}>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant opacity-60">ID-{application.id.substring(0, 8)}</p>
                      <h3 className="mt-2 text-xl font-black text-on-surface">{application.offer?.title || 'Offre'}</h3>
                      <p className="mt-1 text-sm font-medium text-on-surface-variant">
                        {application.offer?.company?.name || 'Entreprise'} · {application.offer?.location || 'Lieu'} · {new Date(application.appliedAt || application.createdAt).toLocaleDateString()}
                      </p>
                      <p className="mt-3 text-sm text-on-surface-variant">
                        {application.applicationStatus === 'pending' ? 'En attente de reponse' : application.applicationStatus === 'interview' ? 'Entretien planifie' : application.applicationStatus}
                      </p>
                    </div>
                    <div className="flex flex-col justify-center gap-3">
                      <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${statusClasses(application.applicationStatus === 'rejected' ? 'red' : 'emerald')}`}>
                        {application.applicationStatus}
                      </span>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Matching IA</p>
                        <p className="mt-2 text-3xl font-black text-on-surface">
                          {application.candidate?.match_scores?.find((m: any) => m.offerId === application.offerId)?.scoreFinal * 100 || 0}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end">
                      <button 
                        className="interactive-scale rounded-xl border border-surface-variant bg-white px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:border-primary hover:text-primary shadow-sm"
                        onClick={() => navigate(`/job/${application.offerId}`)} 
                        type="button"
                      >
                        Voir details
                      </button>
                    </div>
                  </div>
                ))}
                {!allApplications.length && (
                  <div className="py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-5xl opacity-20 mb-3">description</span>
                    <p className="italic font-medium">Vous n'avez pas encore postule a des offres.</p>
                  </div>
                )}
              </div>
            </SurfaceCard>
          </div>
        )}
      </DashboardShell>
    </div>
  );
}

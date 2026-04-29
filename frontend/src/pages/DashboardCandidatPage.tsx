import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DashboardShell } from '../components/dashboard/DashboardShell';
import { KpiCard, SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { candidateNavItems } from '../lib/data/dashboardData';
import { useUserSearch } from '../lib/useUserSearch';
import { useReactPageAnimations } from '../lib/reactPageAnimations';
import { aiAdviceService } from '../services/aiAdviceService';
import { applicationService } from '../services/applicationService';
import { dashboardCandidateService } from '../services/dashboardCandidateService';
import { useAuthStore } from '../store/authStore';

export default function DashboardCandidatPage() {
  const rootRef = useRef(null);
  useReactPageAnimations(rootRef);
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);

  const [recommendedOffers, setRecommendedOffers] = useState<any[]>([]);
  const [activeApplications, setActiveApplications] = useState<any[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);
  const [dailyTips, setDailyTips] = useState<string[]>([]);
  const [profileViews, setProfileViews] = useState<number>(0);
  const [isApplying, setIsApplying] = useState<Record<string, boolean>>({});
  const { searchResults, setSearchInput, clearSearch } = useUserSearch();

  useEffect(() => {
    const loadDashboard = async () => {
      const [recommendedRes, activeRes, interviewsRes, tipsRes, profileRes] = await Promise.all([
        dashboardCandidateService.getRecommendedJobs(),
        dashboardCandidateService.getActiveApplications(),
        dashboardCandidateService.getUpcomingInterviews(),
        aiAdviceService.getDailyAdvice(),
        dashboardCandidateService.getUserStats(),
      ]);

      setRecommendedOffers(recommendedRes.data?.offers ?? []);
      setActiveApplications(activeRes.data?.applications ?? []);
      setUpcomingInterviews(interviewsRes.data?.interviews ?? []);
      setDailyTips(tipsRes.data?.tips ?? []);
      setProfileViews(profileRes.data?.stats?.profileViews ?? 0);
    };

    loadDashboard().catch((error) => {
      console.error('Failed to load candidate dashboard', error);
    });
  }, []);

  const profile = useMemo(() => {
    const firstName = authUser?.firstName || authUser?.profile?.firstName || '';
    const lastName = authUser?.lastName || authUser?.profile?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Utilisateur';

    return {
      name: fullName,
      role: authUser?.role || 'Candidat',
      image:
        authUser?.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=00288e&color=fff&rounded=true`,
    };
  }, [authUser]);

  const handleApply = async (offerId: string) => {
    if (isApplying[offerId]) {
      return;
    }

    try {
      setIsApplying((prev) => ({ ...prev, [offerId]: true }));
      await applicationService.apply({ offerId });
      setActiveApplications((prev) => [
        ...prev,
        { id: `tmp-${offerId}`, offerId, applicationStatus: 'pending' },
      ]);
    } catch (error) {
      console.error('Apply failed', error);
    } finally {
      setIsApplying((prev) => ({ ...prev, [offerId]: false }));
    }
  };

  return (
    <div ref={rootRef}>
      <DashboardShell
        action={{ icon: 'description', label: 'Voir tout', to: '/candidate/dashboard/candidatures' }}
        navItems={candidateNavItems}
        onAvatarClick={() => navigate('/profile/me')}
        onNotificationsClick={() => navigate('/notifications')}
        onSearchChange={setSearchInput}
        onSearchResultClick={(result) => {
          clearSearch();
          if (result.to) {
            navigate(result.to);
          }
        }}
        profile={profile}
        searchPlaceholder="Rechercher etudiants et recruteurs..."
        searchResults={searchResults}
        sectionLabel="Espace Candidat"
        title="Dashboard candidat"
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard icon="work" label="Offres recommandees" value={String(recommendedOffers.length)} />
          <KpiCard icon="description" label="Candidatures actives" tone="secondary" value={String(activeApplications.length)} />
          <KpiCard icon="calendar_month" label="Entretiens prevus" tone="emerald" value={String(upcomingInterviews.length)} />
          <KpiCard icon="visibility" label="Vues de profil" tone="amber" value={String(profileViews)} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <SurfaceCard className="p-8" data-animate="card">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-on-surface">Offres recommandees</h2>
              <button className="text-sm font-bold text-primary" onClick={() => navigate('/trouver-stage')} type="button">
                Voir tout
              </button>
            </div>

            <div className="space-y-4">
              {recommendedOffers.map((offer) => (
                <div className="rounded-2xl border border-surface-variant bg-surface p-5" key={offer.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <button className="text-left" onClick={() => navigate(`/job/${offer.id}`)} type="button">
                        <h3 className="text-lg font-black text-on-surface hover:text-primary">{offer.title}</h3>
                      </button>
                      <p className="mt-1 text-sm text-on-surface-variant">{offer.company?.name || 'Entreprise'} · {offer.location || 'Lieu non renseigne'}</p>
                    </div>
                    <div className="rounded-xl bg-primary/10 px-3 py-2 text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">Match</p>
                      <p className="text-lg font-black text-primary">{offer.matchScore == null ? '--' : `${offer.matchScore}%`}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      className="interactive-scale rounded-xl border border-surface-variant px-4 py-2 text-sm font-bold"
                      onClick={() => navigate(`/job/${offer.id}`)}
                      type="button"
                    >
                      Details
                    </button>
                    <button
                      className="interactive-scale rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white"
                      disabled={Boolean(isApplying[offer.id])}
                      onClick={() => handleApply(offer.id)}
                      type="button"
                    >
                      {isApplying[offer.id] ? 'Envoi...' : 'Postuler'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <div className="space-y-6">
            <SurfaceCard className="p-8" data-animate="card">
              <h3 className="text-2xl font-black text-on-surface">IA du jour</h3>
              <div className="mt-5 space-y-3">
                {dailyTips.map((tip, index) => (
                  <div className="rounded-xl bg-surface px-4 py-3 text-sm text-on-surface-variant" key={`${tip}-${index}`}>
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
                  <p className="text-sm text-on-surface-variant">Aucun entretien programme pour le moment.</p>
                )}
              </div>
            </SurfaceCard>
          </div>
        </div>
      </DashboardShell>
    </div>
  );
}

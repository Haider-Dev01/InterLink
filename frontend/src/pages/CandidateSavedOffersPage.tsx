import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DashboardShell } from '../components/dashboard/DashboardShell';
import { SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { candidateNavItems } from '../lib/data/dashboardData';
import { buildDashboardProfile } from '../lib/userProfile';
import { useReactPageAnimations } from '../lib/reactPageAnimations';
import { applicationService } from '../services/applicationService';
import { dashboardCandidateService } from '../services/dashboardCandidateService';
import { useAuthStore } from '../store/authStore';

export default function CandidateSavedOffersPage() {
  const rootRef = useRef(null);
  useReactPageAnimations(rootRef);
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  const [offers, setOffers] = useState<any[]>([]);
  const [applying, setApplying] = useState<Record<string, boolean>>({});

  useEffect(() => {
    dashboardCandidateService
      .getRecommendedJobs()
      .then((res) => {
        setOffers(res.data?.offers ?? []);
      })
      .catch((error) => {
        console.error('Failed to load offers', error);
      });
  }, []);

  const handleApply = async (offerId: string) => {
    try {
      setApplying((prev) => ({ ...prev, [offerId]: true }));
      await applicationService.apply({ offerId });
    } catch (error) {
      console.error('Failed to apply', error);
    } finally {
      setApplying((prev) => ({ ...prev, [offerId]: false }));
    }
  };

  return (
    <div ref={rootRef}>
      <DashboardShell
        action={{ icon: 'search', label: 'Trouver un stage', to: '/candidate/dashboard/trouver-stage' }}
        navItems={candidateNavItems}
        profile={buildDashboardProfile(authUser)}
        searchPlaceholder="Rechercher une offre sauvegardee..."
        sectionLabel="Espace Candidat"
        title="Offres sauvegardees"
      >
        <div className="grid gap-6 xl:grid-cols-3">
          {offers.map((offer) => (
            <SurfaceCard className="p-7" data-animate="card" key={offer.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{offer.company?.name || 'Entreprise'}</p>
                  <button className="mt-2 text-left text-2xl font-black text-on-surface hover:text-primary" onClick={() => navigate(`/job/${offer.id}`)} type="button">
                    {offer.title}
                  </button>
                </div>
                <div className="rounded-2xl bg-primary/10 px-4 py-2 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Score</p>
                  <p className="mt-1 text-2xl font-black text-primary">{offer.matchScore ?? 0}%</p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 text-sm font-medium text-on-surface-variant">
                <span>{offer.location || 'Lieu non renseigne'}</span>
                <span className="h-1 w-1 rounded-full bg-surface-variant" />
                <span>{offer.remote ? 'Remote' : 'On-site'}</span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {(offer.offerSkills || []).slice(0, 4).map((skill: any, index: number) => (
                  <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-on-surface-variant" key={skill.skill?.id || `${offer.id}-${index}`}>
                    {skill.skill?.name || 'Skill'}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex gap-3">
                <button className="interactive-scale flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20" disabled={Boolean(applying[offer.id])} onClick={() => handleApply(offer.id)} type="button">
                  {applying[offer.id] ? 'Envoi...' : 'Postuler'}
                </button>
                <button className="interactive-scale rounded-xl border border-surface-variant px-4 py-3 text-sm font-bold text-on-surface" onClick={() => navigate(`/job/${offer.id}`)} type="button">
                  Details
                </button>
              </div>
            </SurfaceCard>
          ))}

          {!offers.length ? (
            <SurfaceCard className="p-8 text-center text-on-surface-variant" data-animate="card">
              Aucune offre disponible pour le moment.
            </SurfaceCard>
          ) : null}
        </div>
      </DashboardShell>
    </div>
  );
}

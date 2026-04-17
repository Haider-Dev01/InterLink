import { useRef } from 'react';

import { DashboardShell } from '../components/dashboard/DashboardShell';
import { SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { candidateNavItems, savedOffers } from '../lib/data/dashboardData';
import { useReactPageAnimations } from '../lib/reactPageAnimations';

export default function CandidateSavedOffersPage() {
  const rootRef = useRef(null);
  useReactPageAnimations(rootRef);

  return (
    <div ref={rootRef}>
      <DashboardShell
        action={{ icon: 'search', label: 'Trouver un stage', to: '/dashboard-candidat/trouver-stage' }}
        navItems={candidateNavItems}
        profile={{
          name: 'Thomas Dubois',
          role: 'Étudiant Master 2',
          image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
        }}
        searchPlaceholder="Rechercher une offre sauvegardée..."
        sectionLabel="Espace Candidat"
        title="Offres sauvegardées"
      >
        <div className="grid gap-6 xl:grid-cols-3">
          {savedOffers.map((offer) => (
            <SurfaceCard className="p-7" data-animate="card" key={offer.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{offer.company}</p>
                  <h2 className="mt-2 text-2xl font-black text-on-surface">{offer.title}</h2>
                </div>
                <div className="rounded-2xl bg-primary/10 px-4 py-2 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Score</p>
                  <p className="mt-1 text-2xl font-black text-primary">{offer.match}%</p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 text-sm font-medium text-on-surface-variant">
                <span>{offer.location}</span>
                <span className="h-1 w-1 rounded-full bg-surface-variant" />
                <span>{offer.format}</span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {offer.tags.map((tag) => (
                  <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-on-surface-variant" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex gap-3">
                <button className="interactive-scale flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20" type="button">
                  Postuler
                </button>
                <button className="interactive-scale rounded-xl border border-surface-variant px-4 py-3 text-sm font-bold text-on-surface" type="button">
                  Retirer
                </button>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </DashboardShell>
    </div>
  );
}

import { useRef } from 'react';

import { DashboardShell } from '../components/dashboard/DashboardShell';
import { ProgressMetric, SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { recruiterNavItems, recruiterOffers } from '../lib/data/dashboardData';
import { useReactPageAnimations } from '../lib/reactPageAnimations';

export default function RecruiterOffersPage() {
  const rootRef = useRef(null);
  useReactPageAnimations(rootRef);

  return (
    <div ref={rootRef}>
      <DashboardShell
        action={{ icon: 'add_circle', label: 'Nouvelle Offre', to: '/dashboard-recruteur/creer-offre' }}
        navItems={recruiterNavItems}
        profile={{
          name: 'Sophie Martin',
          role: 'RH Manager',
          image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
        }}
        searchPlaceholder="Chercher une offre..."
        sectionLabel="Espace Recruteur"
        title="Mes offres"
      >
        <div className="grid gap-6 xl:grid-cols-3">
          {recruiterOffers.map((offer) => (
            <SurfaceCard className="p-7" data-animate="card" key={offer.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{offer.id}</p>
                  <h2 className="mt-2 text-2xl font-black text-on-surface">{offer.title}</h2>
                  <p className="mt-2 text-sm text-on-surface-variant">{offer.city}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary">{offer.status}</span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-surface p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Candidats</p>
                  <p className="mt-2 text-2xl font-black text-on-surface">{offer.applicants}</p>
                </div>
                <div className="rounded-2xl bg-surface p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Qualifiés</p>
                  <p className="mt-2 text-2xl font-black text-on-surface">{offer.qualified}</p>
                </div>
              </div>

              <div className="mt-6">
                <ProgressMetric label="Taux de couverture" value={offer.fillRate} />
              </div>
            </SurfaceCard>
          ))}
        </div>
      </DashboardShell>
    </div>
  );
}

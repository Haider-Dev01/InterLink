import { useRef } from 'react';

import { DashboardShell } from '../components/dashboard/DashboardShell';
import { SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { recruiterCandidates, recruiterNavItems } from '../lib/data/dashboardData';
import { useReactPageAnimations } from '../lib/reactPageAnimations';

export default function RecruiterCandidatesPage() {
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
        searchPlaceholder="Chercher un talent, un CV..."
        sectionLabel="Espace Recruteur"
        title="Candidats"
      >
        <div className="grid gap-6 xl:grid-cols-2">
          {recruiterCandidates.map((candidate) => (
            <SurfaceCard className="p-7" data-animate="card" key={candidate.name}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-on-surface">{candidate.name}</h2>
                  <p className="mt-1 text-sm font-bold text-primary">{candidate.role}</p>
                  <p className="mt-3 text-sm text-on-surface-variant">{candidate.experience}</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-primary to-secondary px-4 py-3 text-white shadow-lg shadow-primary/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Score</p>
                  <p className="mt-1 text-2xl font-black">{candidate.score}%</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-surface p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Disponibilité</p>
                  <p className="mt-2 font-bold text-on-surface">{candidate.availability}</p>
                </div>
                <div className="rounded-2xl bg-surface p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Localisation</p>
                  <p className="mt-2 font-bold text-on-surface">{candidate.location}</p>
                </div>
              </div>
            </SurfaceCard>
          ))}
        </div>
      </DashboardShell>
    </div>
  );
}

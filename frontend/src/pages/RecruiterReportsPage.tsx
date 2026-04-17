import { useRef } from 'react';

import { ActivityBarChart, ChartCard } from '../components/charts/ChartCard';
import { DashboardShell } from '../components/dashboard/DashboardShell';
import { KpiCard, SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { recruiterActivitySeries, recruiterNavItems } from '../lib/data/dashboardData';
import { useReactPageAnimations } from '../lib/reactPageAnimations';

export default function RecruiterReportsPage() {
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
        searchPlaceholder="Chercher un rapport..."
        sectionLabel="Espace Recruteur"
        title="Rapports IA"
      >
        <div className="grid gap-6 md:grid-cols-3">
          <KpiCard icon="query_stats" label="Taux shortlist" value="31%" />
          <KpiCard icon="forum" label="Entretiens déclenchés" tone="secondary" value="18" />
          <KpiCard icon="bolt" label="Temps moyen screening" tone="emerald" value="11 min" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <ChartCard subtitle="Vue semaine des candidatures, entretiens et shortlists." title="Activité pipeline">
            <ActivityBarChart
              colors={['#00288e', '#4648d4', '#6f74ff']}
              data={recruiterActivitySeries}
              keys={[
                { dataKey: 'candidatures', name: 'Candidatures' },
                { dataKey: 'entretiens', name: 'Entretiens' },
                { dataKey: 'shortlists', name: 'Shortlists' },
              ]}
            />
          </ChartCard>
          <SurfaceCard className="p-8" data-animate="card">
            <h3 className="text-2xl font-black text-on-surface">Insights IA</h3>
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-primary to-secondary p-5 text-white">
                <p className="text-xs font-black uppercase tracking-widest text-white/70">Performance</p>
                <p className="mt-3 text-sm leading-7">Les offres publiées le mardi obtiennent le meilleur taux de candidatures qualifiées.</p>
              </div>
              <div className="rounded-[1.5rem] border border-surface-variant bg-surface p-5">
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Compétence la plus corrélée</p>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">React + Tailwind apparaît dans 62% des profils shortlistés cette semaine.</p>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </DashboardShell>
    </div>
  );
}

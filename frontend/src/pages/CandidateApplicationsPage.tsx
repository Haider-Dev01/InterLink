import { useRef } from 'react';

import { DashboardShell } from '../components/dashboard/DashboardShell';
import { KpiCard, SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { candidateApplications, candidateNavItems } from '../lib/data/dashboardData';
import { useReactPageAnimations } from '../lib/reactPageAnimations';

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

export default function CandidateApplicationsPage() {
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
        searchPlaceholder="Rechercher une candidature..."
        sectionLabel="Espace Candidat"
        title="Mes candidatures"
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard icon="description" label="Candidatures actives" value="4" />
          <KpiCard icon="forum" label="Entretiens planifiés" tone="secondary" trend="2 cette semaine" value="2" />
          <KpiCard icon="psychology" label="Score moyen IA" tone="emerald" value="84%" />
          <KpiCard icon="schedule" label="Relances suggérées" tone="amber" value="3" />
        </div>

        <SurfaceCard className="p-8" data-animate="card">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-on-surface">Pipeline de suivi</h2>
              <p className="mt-2 text-sm text-on-surface-variant">Chaque carte reprend l’état, le score IA et la prochaine action recommandée.</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary">Live sync</span>
          </div>

          <div className="space-y-4">
            {candidateApplications.map((application) => (
              <div className="grid gap-4 rounded-[1.5rem] border border-surface-variant bg-surface p-5 md:grid-cols-[1.1fr_0.6fr_0.4fr]" key={application.id}>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{application.id}</p>
                  <h3 className="mt-2 text-lg font-black text-on-surface">{application.role}</h3>
                  <p className="mt-1 text-sm font-medium text-on-surface-variant">
                    {application.company} · {application.city} · {application.appliedAt}
                  </p>
                  <p className="mt-3 text-sm text-on-surface-variant">{application.nextStep}</p>
                </div>
                <div className="flex flex-col justify-center gap-3">
                  <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${statusClasses(application.statusTone)}`}>
                    {application.status}
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Match IA</p>
                    <p className="mt-2 text-3xl font-black text-on-surface">{application.score}%</p>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <button className="interactive-scale rounded-xl border border-surface-variant bg-white px-4 py-3 text-sm font-bold text-on-surface transition-colors hover:border-primary hover:text-primary" type="button">
                    Voir détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </DashboardShell>
    </div>
  );
}

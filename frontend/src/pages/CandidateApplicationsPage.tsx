import { useRef, useEffect, useState } from 'react';

import { DashboardShell } from '../components/dashboard/DashboardShell';
import { KpiCard, SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { candidateNavItems } from '../lib/data/dashboardData';
import { buildDashboardProfile } from '../lib/userProfile';
import { useReactPageAnimations } from '../lib/reactPageAnimations';
import { applicationService } from '../services/applicationService';
import { useAuthStore } from '../store/authStore';

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

  const authUser = useAuthStore((state) => state.user);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    applicationService.getMyApplications().then((res) => {
      if (res.success && res.data) {
        setApplications(res.data);
      }
    });
  }, []);

  return (
    <div ref={rootRef}>
      <DashboardShell
        action={{ icon: 'search', label: 'Trouver un stage', to: '/candidate/dashboard/trouver-stage' }}
        navItems={candidateNavItems}
        profile={buildDashboardProfile(authUser)}
        searchPlaceholder="Rechercher une candidature..."
        sectionLabel="Espace Candidat"
        title="Mes candidatures"
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard icon="description" label="Candidatures actives" value={applications.length.toString()} />
          <KpiCard icon="forum" label="Entretiens planifies" tone="secondary" trend="2 cette semaine" value="2" />
          <KpiCard icon="psychology" label="Score moyen IA" tone="emerald" value="84%" />
          <KpiCard icon="schedule" label="Relances suggerees" tone="amber" value="3" />
        </div>

        <SurfaceCard className="p-8" data-animate="card">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-on-surface">Pipeline de suivi</h2>
              <p className="mt-2 text-sm text-on-surface-variant">Chaque carte reprend l'etat, le score IA et la prochaine action recommandee.</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary">Live sync</span>
          </div>

          <div className="space-y-4">
            {applications.map((application) => (
              <div className="grid gap-4 rounded-[1.5rem] border border-surface-variant bg-surface p-5 md:grid-cols-[1.1fr_0.6fr_0.4fr]" key={application.id}>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{application.id.substring(0, 8)}</p>
                  <h3 className="mt-2 text-lg font-black text-on-surface">{application.offer?.title || 'Offre'}</h3>
                  <p className="mt-1 text-sm font-medium text-on-surface-variant">
                    {application.offer?.company?.name || 'Entreprise'} · {application.offer?.location || 'Lieu'} · {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-3 text-sm text-on-surface-variant">
                    {application.applicationStatus === 'pending' ? 'En attente de reponse' : application.applicationStatus}
                  </p>
                </div>
                <div className="flex flex-col justify-center gap-3">
                  <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${statusClasses(application.applicationStatus === 'rejected' ? 'red' : 'emerald')}`}>
                    {application.applicationStatus}
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Match IA</p>
                    <p className="mt-2 text-3xl font-black text-on-surface">
                      {application.candidate?.match_scores?.find((m: any) => m.offerId === application.offerId)?.scoreFinal * 100 || 0}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <button className="interactive-scale rounded-xl border border-surface-variant bg-white px-4 py-3 text-sm font-bold text-on-surface transition-colors hover:border-primary hover:text-primary" type="button">
                    Voir details
                  </button>
                </div>
              </div>
            ))}

            {applications.length === 0 && <div className="py-8 text-center text-on-surface-variant">Aucune candidature pour le moment.</div>}
          </div>
        </SurfaceCard>
      </DashboardShell>
    </div>
  );
}

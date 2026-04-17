import { useRef } from 'react';

import { ActivityBarChart, ApplicationsAreaChart, ChartCard, DistributionPieChart } from '../components/charts/ChartCard';
import { DashboardShell } from '../components/dashboard/DashboardShell';
import { KpiCard, SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import {
  adminApplicationsSeries,
  adminKpis,
  adminMatchingDistribution,
  adminNavItems,
  adminRecruiterActivity,
  adminUserGrowth,
} from '../lib/data/dashboardData';
import { useReactPageAnimations } from '../lib/reactPageAnimations';

export default function AdminAnalyticsPage() {
  const rootRef = useRef(null);
  useReactPageAnimations(rootRef);

  return (
    <div ref={rootRef}>
      <DashboardShell
        action={{ icon: 'settings', label: 'Paramètres', to: '/dashboard-administrateur/parametres' }}
        navItems={adminNavItems}
        profile={{
          name: 'Admin Nexus',
          role: 'Super Administrateur',
          image: 'https://ui-avatars.com/api/?name=Admin+Nexus&background=00288e&color=fff&rounded=true',
        }}
        searchPlaceholder="Rechercher une métrique, un compte..."
        sectionLabel="IA Platform"
        subtitle="Analyse consolidée de la croissance, du matching et de l'activité recruteur."
        title="Analytique IA"
        variant="admin"
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {adminKpis.map((kpi) => (
            <KpiCard {...kpi} key={kpi.label} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <ChartCard subtitle="Volume d'applications analysées et matches générés." title="Applications Over Time">
            <ApplicationsAreaChart data={adminApplicationsSeries} />
          </ChartCard>
          <ChartCard subtitle="Répartition du score IA sur les candidatures." title="Matching Score Distribution">
            <DistributionPieChart data={adminMatchingDistribution} />
          </ChartCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard subtitle="Croissance hebdomadaire candidats vs recruteurs." title="User Growth">
            <ActivityBarChart
              colors={['#00288e', '#4648d4']}
              data={adminUserGrowth}
              keys={[
                { dataKey: 'candidats', name: 'Candidats' },
                { dataKey: 'recruteurs', name: 'Recruteurs' },
              ]}
            />
          </ChartCard>
          <ChartCard subtitle="Entreprises recrutant activement par secteur." title="Recruiter Activity">
            <ActivityBarChart colors={['#00288e']} data={adminRecruiterActivity} keys={[{ dataKey: 'active', name: 'Actifs' }]} />
          </ChartCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <SurfaceCard className="p-6" data-animate="card">
            <h3 className="text-lg font-black text-on-surface">Signals IA</h3>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-surface p-4">
                <p className="text-xs font-black uppercase tracking-widest text-primary">Alerte positive</p>
                <p className="mt-2 text-sm font-medium text-on-surface-variant">Les offres React/Tailwind convertissent 1.6x mieux cette semaine.</p>
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <p className="text-xs font-black uppercase tracking-widest text-secondary">Opportunity gap</p>
                <p className="mt-2 text-sm font-medium text-on-surface-variant">Le secteur Health montre une hausse de trafic mais un faible volume d'offres.</p>
              </div>
            </div>
          </SurfaceCard>
          <SurfaceCard className="p-6 lg:col-span-2" data-animate="card">
            <h3 className="text-lg font-black text-on-surface">KPI Snapshot</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-surface-variant bg-surface p-5">
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Temps de shortlist</p>
                <h4 className="mt-2 text-3xl font-black text-on-surface">14 min</h4>
                <p className="mt-2 text-sm text-emerald-600">-32% vs mois dernier</p>
              </div>
              <div className="rounded-2xl border border-surface-variant bg-surface p-5">
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">CV analysés</p>
                <h4 className="mt-2 text-3xl font-black text-on-surface">12.4k</h4>
                <p className="mt-2 text-sm text-primary">Capacité stable à 99.2%</p>
              </div>
              <div className="rounded-2xl border border-surface-variant bg-surface p-5">
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Satisfaction recruteur</p>
                <h4 className="mt-2 text-3xl font-black text-on-surface">4.8/5</h4>
                <p className="mt-2 text-sm text-secondary">Basée sur 218 retours</p>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </DashboardShell>
    </div>
  );
}

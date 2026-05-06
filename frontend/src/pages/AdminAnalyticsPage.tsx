import { useRef, useEffect, useState } from 'react';
import { ActivityBarChart, ApplicationsAreaChart, ChartCard, DistributionPieChart } from '../components/charts/ChartCard';
import { DashboardShell } from '../components/dashboard/DashboardShell';
import { KpiCard, SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import {
  adminNavItems,
} from '../lib/data/dashboardData';
import { useReactPageAnimations } from '../lib/reactPageAnimations';
import { adminService } from '../services/adminService';

export default function AdminAnalyticsPage() {
  const rootRef = useRef(null);
  useReactPageAnimations(rootRef);
  
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    // Fetch General Stats (KPIs)
    adminService.getStats().then(res => {
      if (res.success && res.data) {
        setStats(res.data.stats);
      }
    });

    // Fetch Detailed Analytics (Charts)
    adminService.getAnalytics().then(res => {
      if (res.success && res.data) {
        setAnalytics(res.data);
      }
    });
  }, []);

  const kpis = [
    { label: 'Utilisateurs total', value: stats?.totalUsers?.toString() || '0', icon: 'group' },
    { label: 'Candidats', value: stats?.totalCandidates?.toString() || '0', icon: 'person', tone: 'secondary' as const },
    { label: 'Entreprises', value: stats?.totalCompanies?.toString() || '0', icon: 'business', tone: 'emerald' as const },
    { label: 'Offres publiées', value: stats?.totalOffers?.toString() || '0', icon: 'description', tone: 'amber' as const },
  ];

  // Map backend data to chart formats
  const applicationsData = analytics?.applicationTrends?.map((item: any) => ({
    date: item.month,
    apps: Number(item.applications)
  })) || [];

  const matchingDistributionData = analytics?.matchingDistribution || [];

  const growthData = analytics?.userGrowth?.map((item: any) => ({
    name: item.month,
    candidats: Number(item.candidats),
    recruteurs: Number(item.recruteurs)
  })) || [];

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
          {kpis.map((kpi) => (
            <KpiCard {...kpi} key={kpi.label} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <ChartCard subtitle="Volume d'applications analysées et matches générés." title="Tendances des Candidatures">
            <ApplicationsAreaChart data={applicationsData.length > 0 ? applicationsData : [{ date: 'Jan', apps: 0 }]} />
          </ChartCard>
          <ChartCard subtitle="Répartition du score IA sur les candidatures." title="Répartition des Scores IA">
            <DistributionPieChart data={matchingDistributionData.length > 0 ? matchingDistributionData : [{ name: 'N/A', value: 1 }]} />
          </ChartCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard subtitle="Croissance mensuelle candidats vs recruteurs." title="Croissance Utilisateurs">
            <ActivityBarChart
              colors={['#00288e', '#4648d4']}
              data={growthData.length > 0 ? growthData : [{ name: 'Jan', candidats: 0, recruteurs: 0 }]}
              keys={[
                { dataKey: 'candidats', name: 'Candidats' },
                { dataKey: 'recruteurs', name: 'Recruteurs' },
              ]}
            />
          </ChartCard>
          
          <SurfaceCard className="p-6" data-animate="card">
            <h3 className="text-lg font-black text-on-surface">Signals IA & Opportunités</h3>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-surface p-4 border border-primary/10 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-primary">Alerte IA positive</p>
                <p className="mt-2 text-sm font-medium text-on-surface-variant">
                  Les scores de matching moyen ont augmenté de 12% sur les profils Tech.
                </p>
              </div>
              <div className="rounded-2xl bg-surface p-4 border border-secondary/10 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-secondary">Axe d'amélioration</p>
                <p className="mt-2 text-sm font-medium text-on-surface-variant">
                  Le volume de recruteurs en attente de validation est de {stats?.pendingCompanies || 0}.
                </p>
              </div>
            </div>
          </SurfaceCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-1">
          <SurfaceCard className="p-6" data-animate="card">
            <h3 className="text-lg font-black text-on-surface">Aperçu Performance Système</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-surface-variant bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Précision IA</p>
                <h4 className="mt-2 text-3xl font-black text-on-surface">94.2%</h4>
                <p className="mt-2 text-sm text-emerald-600">Stable vs mois dernier</p>
              </div>
              <div className="rounded-2xl border border-surface-variant bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Analyses effectuées</p>
                <h4 className="mt-2 text-3xl font-black text-on-surface">{stats?.totalUsers ? (stats.totalUsers * 1.5).toFixed(0) : 0}</h4>
                <p className="mt-2 text-sm text-primary">Croissance constante</p>
              </div>
              <div className="rounded-2xl border border-surface-variant bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Taux de rétention</p>
                <h4 className="mt-2 text-3xl font-black text-on-surface">88%</h4>
                <p className="mt-2 text-sm text-secondary">Engagé</p>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </DashboardShell>
    </div>
  );
}

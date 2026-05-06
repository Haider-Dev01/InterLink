import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { recruiterService } from '../services/recruiterService';
import { RecruiterLayout } from './RecruiterLayout';

type RecruiterDashboardData = {
  totalOffers: number;
  totalCandidatesReceived: number;
  activeApplications: number;
  aiInsightsSummary: string;
};

type RecruiterOverviewData = {
  jobPerformance: Array<{
    offerId: string;
    title: string;
    status: string;
    applications: number;
    conversionRate: number;
  }>;
};

export default function RecruiterDashboardView() {
  const [dashboard, setDashboard] = useState<RecruiterDashboardData | null>(null);
  const [overview, setOverview] = useState<RecruiterOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboardRes, overviewRes] = await Promise.all([
          recruiterService.getDashboard(),
          recruiterService.getOverview(),
        ]);

        setDashboard(dashboardRes.data ?? null);
        setOverview(overviewRes.data ?? null);
      } catch (error) {
        console.error('Failed to load recruiter dashboard', error);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const topOffers = useMemo(() => {
    return (overview?.jobPerformance ?? []).slice(0, 3);
  }, [overview]);

  if (isLoading) {
    return (
      <RecruiterLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6" id="stat-cards">
        <div className="bg-white p-6 rounded-[2rem] border border-surface-variant shadow-sm card-hover-scale">
          <p className="text-sm font-bold text-on-surface-variant">Total des offres</p>
          <h3 className="text-3xl font-black mt-2 text-on-surface">{dashboard?.totalOffers ?? 0}</h3>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-surface-variant shadow-sm card-hover-scale">
          <p className="text-sm font-bold text-on-surface-variant">Offres publiees</p>
          <h3 className="text-3xl font-black mt-2 text-on-surface">{(dashboard as any)?.publishedOffers ?? 0}</h3>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-surface-variant shadow-sm card-hover-scale">
          <p className="text-sm font-bold text-on-surface-variant">Candidats recus</p>
          <h3 className="text-3xl font-black mt-2 text-on-surface">{dashboard?.totalCandidatesReceived ?? 0}</h3>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-surface-variant shadow-sm card-hover-scale">
          <p className="text-sm font-bold text-on-surface-variant">Candidatures actives</p>
          <h3 className="text-3xl font-black mt-2 text-on-surface">{dashboard?.activeApplications ?? 0}</h3>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-surface-variant shadow-sm card-hover-scale">
          <p className="text-sm font-bold text-on-surface-variant">Top offres suivies</p>
          <h3 className="text-3xl font-black mt-2 text-on-surface">{topOffers.length}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-2xl font-black text-on-surface">Performance rapide</h2>
            <Link to="/recruiter/overview" className="text-sm font-bold text-primary hover:underline">
              Voir la vue d'ensemble
            </Link>
          </div>

          <div className="space-y-4">
            {topOffers.length === 0 ? (
              <div className="bg-white border border-surface-variant rounded-[2rem] p-6 text-on-surface-variant">
                Aucune offre disponible pour le moment.
              </div>
            ) : topOffers.map((offer) => (
              <div key={offer.offerId} className="bg-white border border-surface-variant rounded-[2rem] p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-on-surface">{offer.title}</h3>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{offer.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-on-surface-variant">Candidatures</p>
                    <p className="text-xl font-black text-primary">{offer.applications}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-on-surface-variant">Conversion</span>
                    <span className="text-primary">{offer.conversionRate}%</span>
                  </div>
                  <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${offer.conversionRate}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-black text-on-surface px-1">Insights IA</h2>
          <div className="bg-gradient-to-br from-primary to-secondary rounded-[2rem] p-7 text-white shadow-2xl shadow-primary/20">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Resume IA</p>
            <p className="mt-4 text-sm leading-7 text-white/90">
              {dashboard?.aiInsightsSummary || 'Les insights IA apparaissent apres les premieres candidatures.'}
            </p>
            <Link
              to="/recruiter/ai-reports"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-white/30"
            >
              Rapports IA
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </RecruiterLayout>
  );
}

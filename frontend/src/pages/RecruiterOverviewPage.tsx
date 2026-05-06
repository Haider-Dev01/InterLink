import { useEffect, useMemo, useState } from 'react';
import { RecruiterLayout } from '../components/RecruiterLayout';
import { ChartCard, ActivityBarChart, ApplicationsAreaChart } from '../components/charts/ChartCard';
import { recruiterService } from '../services/recruiterService';

type OverviewResponse = {
  jobPerformance: Array<{
    offerId: string;
    title: string;
    status: string;
    applications: number;
    interviews: number;
    accepted: number;
    conversionRate: number;
  }>;
  applicationTrends: Array<{ date: string; count: number }>;
  candidateEngagement: {
    pending: number;
    interview: number;
    accepted: number;
    rejected: number;
  };
};

export default function RecruiterOverviewPage() {
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recruiterService.getOverview()
      .then((res) => {
        setOverview(res.data ?? null);
      })
      .catch((error) => {
        console.error('Failed to load recruiter overview', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const trends = useMemo(
    () =>
      (overview?.applicationTrends ?? []).map((point) => ({
        name: point.date.slice(5),
        applications: point.count,
        matches: Math.round(point.count * 0.62),
      })),
    [overview],
  );

  const engagementBars = useMemo(() => {
    const raw = overview?.candidateEngagement;
    if (!raw) {
      return [];
    }
    return [
      { name: 'Pending', total: raw.pending },
      { name: 'Interview', total: raw.interview },
      { name: 'Accepted', total: raw.accepted },
      { name: 'Rejected', total: raw.rejected },
    ];
  }, [overview]);

  if (loading) {
    return (
      <RecruiterLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-surface-variant shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Total Offres</p>
          <p className="text-2xl font-black text-on-surface">{overview?.jobPerformance.length ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-surface-variant shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Candidats</p>
          <p className="text-2xl font-black text-on-surface">
            {overview?.jobPerformance.reduce((acc, curr) => acc + curr.applications, 0) ?? 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-surface-variant shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Entretiens</p>
          <p className="text-2xl font-black text-on-surface">{overview?.candidateEngagement.interview ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-surface-variant shadow-sm">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Acceptés</p>
          <p className="text-2xl font-black text-on-surface">{overview?.candidateEngagement.accepted ?? 0}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Tendance des candidatures" subtitle="14 derniers jours">
          <ApplicationsAreaChart data={trends} />
        </ChartCard>
        <ChartCard title="Engagement candidats" subtitle="Etat global du pipeline">
          <ActivityBarChart
            data={engagementBars}
            keys={[{ dataKey: 'total', name: 'Candidats' }]}
            colors={['#00288e']}
          />
        </ChartCard>
      </div>

      <div className="mt-8 bg-white rounded-[2rem] border border-surface-variant p-6 shadow-sm">
        <h2 className="text-2xl font-black text-on-surface">Performance des offres</h2>
        <div className="mt-6 grid gap-4">
          {(overview?.jobPerformance ?? []).map((offer) => (
            <div key={offer.offerId} className="rounded-2xl border border-surface-variant p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-lg font-black text-on-surface">{offer.title}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{offer.status}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="rounded-full bg-surface px-3 py-1 font-bold text-on-surface-variant">Apps: {offer.applications}</span>
                  <span className="rounded-full bg-surface px-3 py-1 font-bold text-on-surface-variant">Interviews: {offer.interviews}</span>
                  <span className="rounded-full bg-surface px-3 py-1 font-bold text-on-surface-variant">Accepted: {offer.accepted}</span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-bold text-primary">Conversion: {offer.conversionRate}%</span>
                </div>
              </div>
            </div>
          ))}
          {!overview?.jobPerformance?.length ? (
            <p className="text-sm text-on-surface-variant">Aucune performance disponible pour le moment.</p>
          ) : null}
        </div>
      </div>
    </RecruiterLayout>
  );
}

import { useState } from 'react';
import { RecruiterLayout } from './RecruiterLayout';
import { recruiterService } from '../services/recruiterService';

export default function RecruiterReportsView() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState('');
  const [stats, setStats] = useState<any>(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await recruiterService.getAiReport(prompt.trim() || undefined);
      setReport(response.data?.report || 'Rapport indisponible.');
      setStats(response.data?.stats || null);
    } catch (error) {
      console.error('Failed to generate recruiter report', error);
      setReport('Impossible de generer le rapport pour le moment.');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RecruiterLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h2 className="text-2xl font-black text-on-surface">Rapports IA</h2>
        <button
          onClick={generateReport}
          disabled={loading}
          className="bg-primary text-white font-bold py-2.5 px-5 rounded-xl shadow-md hover:bg-primary-container transition-colors disabled:opacity-60"
          type="button"
        >
          {loading ? 'Generation...' : 'Generer un rapport'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-surface-variant shadow-sm">
          <label className="block text-sm font-bold text-on-surface-variant mb-2">Consigne (optionnelle)</label>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ex: focus sur la qualite des candidats React et les recommandations de screening"
            rows={4}
            className="w-full border border-surface-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          <div className="mt-6 rounded-2xl border border-surface-variant bg-surface p-4 min-h-44">
            {report ? (
              <p className="text-sm text-on-surface-variant whitespace-pre-wrap leading-7">{report}</p>
            ) : (
              <p className="text-sm text-on-surface-variant">Generez un rapport pour obtenir des insights IA sur vos offres et candidatures.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-surface-variant shadow-sm">
          <h3 className="text-xl font-black text-on-surface">Resume KPI</h3>
          <div className="mt-6 space-y-3">
            <div className="rounded-xl bg-surface p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Offres</p>
              <p className="text-2xl font-black text-on-surface mt-1">{stats?.totalOffers ?? 0}</p>
            </div>
            <div className="rounded-xl bg-surface p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Candidatures</p>
              <p className="text-2xl font-black text-on-surface mt-1">{stats?.totalApplications ?? 0}</p>
            </div>
            <div className="rounded-xl bg-surface p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Actives</p>
              <p className="text-2xl font-black text-on-surface mt-1">{stats?.activeApplications ?? 0}</p>
            </div>
            <div className="rounded-xl bg-surface p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Acceptees</p>
              <p className="text-2xl font-black text-on-surface mt-1">{stats?.acceptedApplications ?? 0}</p>
            </div>
          </div>
        </div>
      </div>
    </RecruiterLayout>
  );
}

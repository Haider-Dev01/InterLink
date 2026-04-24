import { useEffect, useState } from 'react';
import { RecruiterLayout } from './RecruiterLayout';
import { dashboardService } from '../services/dashboardService';
import { offerService } from '../services/offerService';
import { Link } from 'react-router-dom';

export default function RecruiterDashboardView() {
  const [kpis, setKpis] = useState({
    activeOffers: 0,
    matchedCandidates: 0,
    interviews: 0
  });
  const [pipelineOffers, setPipelineOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offersRes, matchesRes, interviewsRes, myOffersRes] = await Promise.all([
          dashboardService.getPublishedOffersCount().catch(() => ({ data: 0 })),
          dashboardService.getTotalMatchesCount().catch(() => ({ data: 0 })),
          dashboardService.getInterviewsCount().catch(() => ({ data: 0 })),
          offerService.getMyOffers().catch(() => ({ data: [] }))
        ]);

        setKpis({
          activeOffers: typeof offersRes.data === 'number' ? offersRes.data : offersRes.data?.count || 0,
          matchedCandidates: typeof matchesRes.data === 'number' ? matchesRes.data : matchesRes.data?.count || 0,
          interviews: typeof interviewsRes.data === 'number' ? interviewsRes.data : interviewsRes.data?.count || 0
        });

        const activePipeline = (myOffersRes.data || [])
          .filter((o: any) => o.status === 'PUBLISHED')
          .slice(0, 3);
        setPipelineOffers(activePipeline);

      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="stat-cards">
        <div className="bg-white p-6 rounded-[2rem] border border-surface-variant shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group card-hover-scale">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">description</span>
            </div>
          </div>
          <p className="text-sm font-bold text-on-surface-variant">Offres Actives</p>
          <h3 className="text-3xl font-black mt-1">{kpis.activeOffers}</h3>
          <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-[100px]">work</span></div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-surface-variant shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group card-hover-scale">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">psychology</span>
            </div>
          </div>
          <p className="text-sm font-bold text-on-surface-variant">Candidats Matchés</p>
          <h3 className="text-3xl font-black mt-1">{kpis.matchedCandidates}</h3>
          <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-[100px]">groups</span></div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-surface-variant shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group card-hover-scale">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">event</span>
            </div>
          </div>
          <p className="text-sm font-bold text-on-surface-variant">Entretiens Prévus</p>
          <h3 className="text-3xl font-black mt-1">{kpis.interviews}</h3>
          <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-[100px]">calendar_today</span></div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-surface-variant shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group card-hover-scale">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">bolt</span>
            </div>
          </div>
          <p className="text-sm font-bold text-on-surface-variant">Temps de clôture</p>
          <h3 className="text-3xl font-black mt-1">18 j</h3>
          <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-[100px]">speed</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-6 reveal-left" id="pipeline-section">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-2xl font-black text-on-surface">Pipeline des talents</h2>
            <Link to="/recruiter/offers" className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
              Gérer les offres <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
          
          <div className="space-y-4">
            {pipelineOffers.length === 0 ? (
              <div className="text-center p-8 text-on-surface-variant">Aucune offre publiée pour le moment.</div>
            ) : pipelineOffers.map(offer => (
              <Link to={`/recruiter/offers/${offer.id}`} key={offer.id} className="block bg-white border border-surface-variant rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group card-hover-scale">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined">design_services</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-on-surface group-hover:text-primary transition-colors">{offer.title}</h3>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">REF: {offer.reference || offer.id?.substring(0,8)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">auto_awesome</span> Score moyen du vivier</span>
                        <span className="text-primary">{offer.avgScore ? `${Math.round(offer.avgScore)}%` : 'N/A'}</span>
                      </div>
                      <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-primary to-secondary h-full progress-bar-fill transition-all duration-1000" style={{ width: offer.avgScore ? `${offer.avgScore}%` : '0%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6 reveal-right" id="insights-section">
          <h2 className="text-2xl font-black text-on-surface px-2">Insights IA</h2>
          
          <div className="bg-gradient-to-br from-primary to-secondary rounded-[2rem] p-8 text-white shadow-2xl shadow-primary/30 relative overflow-hidden group card-hover-scale">
            <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">psychology</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Nexus Actif</h3>
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-white/70">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span> En cours d'analyse
                  </div>
                </div>
              </div>
              
              <p className="text-sm font-medium text-white/90 leading-relaxed mb-6">
                L'IA analyse les nouvelles candidatures en temps réel. Accédez aux rapports pour plus de détails.
              </p>
            </div>
          </div>
        </div>
      </div>
    </RecruiterLayout>
  );
}

import { useEffect, useState } from 'react';
import { RecruiterLayout } from './RecruiterLayout';
import { useOfferStore } from '../store/offerStore';
import { offerService } from '../services/offerService';

export default function RecruiterCandidatesList() {
  const { myOffers, fetchMyOffers } = useOfferStore();
  const [selectedOfferId, setSelectedOfferId] = useState<string>('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMyOffers();
  }, [fetchMyOffers]);

  useEffect(() => {
    if (myOffers.length > 0 && !selectedOfferId) {
      setSelectedOfferId(myOffers[0].id);
    }
  }, [myOffers, selectedOfferId]);

  useEffect(() => {
    if (!selectedOfferId) return;
    
    const fetchMatches = async () => {
      setIsLoading(true);
      try {
        const res = await offerService.getOfferMatches(selectedOfferId);
        if (res.success) {
          // Sort descending by match_score (or score_final)
          const sorted = (res.data || []).sort((a: any, b: any) => (b.score_final || b.match_score || 0) - (a.score_final || a.match_score || 0));
          setCandidates(sorted);
        }
      } catch (err) {
        console.error('Failed to fetch matches', err);
        setCandidates([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMatches();
  }, [selectedOfferId]);

  return (
    <RecruiterLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-2xl font-black text-on-surface">Candidats Matchés</h2>
        
        <div className="w-full md:w-auto">
          <select 
            value={selectedOfferId}
            onChange={(e) => setSelectedOfferId(e.target.value)}
            className="w-full md:w-64 border border-surface-variant rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {myOffers.length === 0 && <option value="">Aucune offre disponible</option>}
            {myOffers.map(offer => (
              <option key={offer.id} value={offer.id}>{offer.title}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white p-8 rounded-[2rem] border border-surface-variant text-center shadow-sm">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-4">person_off</span>
          <p className="text-on-surface-variant">Aucun candidat matché pour cette offre.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map(candidate => {
            const score = Math.round(candidate.score_final || candidate.match_score || 0);
            return (
              <div key={candidate.id} className="bg-white rounded-2xl border border-surface-variant p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={candidate.candidate?.user?.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80'} 
                      alt="Candidat" 
                      className="w-12 h-12 rounded-full object-cover border-2 border-surface-variant"
                    />
                    <div>
                      <h3 className="font-bold text-on-surface">
                        {candidate.candidate?.user?.firstName || 'Candidat'} {candidate.candidate?.user?.lastName || ''}
                      </h3>
                      <p className="text-xs text-on-surface-variant">{candidate.candidate?.title || 'Recherche stage'}</p>
                    </div>
                  </div>
                  <div className="bg-primary/10 text-primary font-black px-2 py-1 rounded-lg text-sm">
                    {score}%
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Compétences clés</p>
                  <div className="flex flex-wrap gap-2">
                    {(candidate.candidate?.skills || []).slice(0, 3).map((skill: string) => (
                      <span key={skill} className="bg-surface-variant/50 text-on-surface-variant px-2 py-1 rounded text-[10px] font-bold">
                        {skill}
                      </span>
                    ))}
                    {(candidate.candidate?.skills?.length || 0) > 3 && (
                      <span className="bg-surface-variant/50 text-on-surface-variant px-2 py-1 rounded text-[10px] font-bold">
                        +{(candidate.candidate?.skills?.length || 0) - 3}
                      </span>
                    )}
                  </div>
                </div>
                
                <button className="w-full border border-surface-variant py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:border-primary hover:text-primary transition-colors group-hover:bg-primary/5">
                  Voir Profil
                </button>
              </div>
            );
          })}
        </div>
      )}
    </RecruiterLayout>
  );
}

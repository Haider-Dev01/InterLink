import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecruiterLayout } from './RecruiterLayout';
import { useOfferStore } from '../store/offerStore';
import { recruiterService } from '../services/recruiterService';

export default function RecruiterCandidatesList() {
  const navigate = useNavigate();
  const { myOffers, fetchMyOffers } = useOfferStore();
  const [selectedOfferId, setSelectedOfferId] = useState<string>('');
  const [applications, setApplications] = useState<any[]>([]);
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
    const load = async () => {
      setIsLoading(true);
      try {
        const response = await recruiterService.getApplications(selectedOfferId || undefined);
        setApplications(response.data?.applications ?? []);
      } catch (error) {
        console.error('Failed to load recruiter applications', error);
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [selectedOfferId]);

  const normalized = useMemo(() => {
    return applications.map((application) => {
      const scoreEntry = (application.candidate?.match_scores ?? []).find((item: any) => item.offerId === application.offerId);
      const scoreFinal = scoreEntry?.scoreFinal ?? 0;
      const score = Math.round(scoreFinal * 100);
      const profile = application.candidate?.profile;

      return {
        id: application.id,
        candidateId: application.candidateId,
        fullName: `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || application.candidate?.email || 'Candidat',
        status: application.applicationStatus,
        offerTitle: application.offer?.title || 'Offre',
        score,
      };
    });
  }, [applications]);

  return (
    <RecruiterLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-2xl font-black text-on-surface">Candidats</h2>

        <div className="w-full md:w-auto">
          <select
            value={selectedOfferId}
            onChange={(event) => setSelectedOfferId(event.target.value)}
            className="w-full md:w-80 border border-surface-variant rounded-xl px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Toutes mes offres</option>
            {myOffers.map((offer: any) => (
              <option key={offer.id} value={offer.id}>{offer.title}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : normalized.length === 0 ? (
        <div className="bg-white p-8 rounded-[2rem] border border-surface-variant text-center shadow-sm">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-4">person_off</span>
          <p className="text-on-surface-variant">Aucun candidat trouve.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {normalized.map((candidate) => (
            <div key={candidate.id} className="bg-white rounded-2xl border border-surface-variant p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-black text-on-surface">{candidate.fullName}</h3>
                  <p className="text-xs text-on-surface-variant mt-1">{candidate.offerTitle}</p>
                </div>
                <div className="bg-primary/10 text-primary font-black px-2 py-1 rounded-lg text-sm">
                  {candidate.score}%
                </div>
              </div>

              <div className="mb-5">
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-on-surface-variant">
                  Statut: {candidate.status}
                </span>
              </div>

              <button
                onClick={() => navigate(`/profile/${candidate.candidateId}`)}
                className="w-full border border-surface-variant py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                type="button"
              >
                Voir profil
              </button>
            </div>
          ))}
        </div>
      )}
    </RecruiterLayout>
  );
}

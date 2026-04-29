import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RecruiterLayout } from './RecruiterLayout';
import { offerService } from '../services/offerService';
import { useOfferStore } from '../store/offerStore';

export default function RecruiterOffersList() {
  const { myOffers, isLoading, fetchMyOffers } = useOfferStore();

  useEffect(() => {
    fetchMyOffers();
  }, [fetchMyOffers]);

  return (
    <RecruiterLayout>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-on-surface">Mes Offres</h2>
        <Link to="/recruiter/jobs/new" className="bg-primary text-white font-bold py-2 px-4 rounded-xl shadow-md hover:bg-primary-container transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nouvelle offre
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : myOffers.length === 0 ? (
        <div className="bg-white p-8 rounded-[2rem] border border-surface-variant text-center shadow-sm">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-4">work_off</span>
          <p className="text-on-surface-variant">Vous n'avez aucune offre pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {myOffers.map((offer: any) => (
            <div key={offer.id} className="bg-white p-6 rounded-2xl border border-surface-variant shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-on-surface">{offer.title}</h3>
                <div className="text-sm text-on-surface-variant flex flex-wrap gap-4 mt-1">
                  <span><span className="font-semibold">Lieu:</span> {offer.location || 'Non precise'}</span>
                  <span><span className="font-semibold">Remote:</span> {offer.remote ? 'Oui' : 'Non'}</span>
                  <span><span className="font-semibold">Statut:</span> {offer.offerStatus}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/recruiter/jobs/${offer.id}/edit`} className="p-2 text-on-surface-variant hover:text-primary transition-colors bg-surface-variant/30 rounded-lg" title="Modifier">
                  <span className="material-symbols-outlined">edit</span>
                </Link>
                <button
                  onClick={async () => {
                    if (confirm('Supprimer cette offre ?')) {
                      await offerService.deleteJob(offer.id);
                      fetchMyOffers();
                    }
                  }}
                  className="p-2 text-on-surface-variant hover:text-red-600 transition-colors bg-surface-variant/30 rounded-lg"
                  title="Supprimer"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </RecruiterLayout>
  );
}

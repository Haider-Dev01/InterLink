import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { applicationService } from '../services/applicationService';
import { offerService } from '../services/offerService';
import { useAuthStore } from '../store/authStore';

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [offer, setOffer] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (!id) return;
    offerService.getOfferById(id).then((res) => {
      setOffer(res.data?.offer ?? null);
    }).catch((error) => {
      console.error('Failed to load offer details', error);
    });
  }, [id]);

  const skills = useMemo(() => offer?.offerSkills?.map((s: any) => s.skill?.name).filter(Boolean) ?? [], [offer]);

  const handleApply = async () => {
    if (!id) {
      return;
    }
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setIsApplying(true);
      await applicationService.apply({ offerId: id });
      navigate('/candidate/dashboard/candidatures');
    } catch (error) {
      console.error('Failed to apply', error);
    } finally {
      setIsApplying(false);
    }
  };

  if (!offer) {
    return <div className="min-h-screen bg-surface px-8 py-16 text-on-surface">Chargement de l'offre...</div>;
  }

  return (
    <div className="min-h-screen bg-surface px-6 py-10 md:px-12">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-surface-variant bg-white p-8 shadow-sm">
        <button className="mb-6 rounded-xl border border-surface-variant px-4 py-2 text-sm font-bold" onClick={() => navigate(-1)} type="button">
          Retour
        </button>

        <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{offer.company?.name || 'Entreprise'}</p>
        <h1 className="mt-2 text-3xl font-black text-on-surface">{offer.title}</h1>
        <p className="mt-3 text-sm text-on-surface-variant">{offer.location || 'Lieu non renseigne'} · {offer.remote ? 'Remote' : 'On-site'} · {offer.durationMonths ? `${offer.durationMonths} mois` : 'Duree non renseignee'}</p>

        <div className="mt-8">
          <h2 className="text-xl font-black text-on-surface">Description</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-on-surface-variant">{offer.description}</p>
        </div>

        {skills.length ? (
          <div className="mt-8">
            <h2 className="text-xl font-black text-on-surface">Competences</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((skill: string) => (
                <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-on-surface-variant" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-10 flex justify-end">
          <button className="interactive-scale rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white" disabled={isApplying} onClick={handleApply} type="button">
            {isApplying ? 'Envoi...' : 'Postuler'}
          </button>
        </div>
      </div>
    </div>
  );
}

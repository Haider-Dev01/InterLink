import { useRef, useEffect, useState } from 'react';

import { DashboardShell } from '../components/dashboard/DashboardShell';
import { SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { ChipGroup, Field, SelectField } from '../components/forms/DashboardFields';
import { candidateNavItems } from '../lib/data/dashboardData';
import { useReactPageAnimations } from '../lib/reactPageAnimations';
import { useAppStore } from '../store/useAppStore';
import { offerService } from '../services/offerService';
import { applicationService } from '../services/applicationService';

export default function CandidateFindInternshipPage() {
  const rootRef = useRef(null);
  useReactPageAnimations(rootRef);
  const draft = useAppStore((state) => state.candidateSearchDraft);
  const setDraft = useAppStore((state) => state.setCandidateSearchDraft);
  const resetDraft = useAppStore((state) => state.resetCandidateSearchDraft);

  const [offers, setOffers] = useState<any[]>([]);
  const [applying, setApplying] = useState<Record<string, boolean>>({});
  const [applied, setApplied] = useState<Record<string, boolean>>({});

  useEffect(() => {
    offerService.getOffers().then(res => {
      if (res.success && res.data) {
        setOffers(res.data.offers || res.data);
      }
    });
  }, []);

  const handleApply = async (offerId: string) => {
    if (applying[offerId] || applied[offerId]) return;
    try {
      setApplying(prev => ({ ...prev, [offerId]: true }));
      await applicationService.apply({ offerId });
      setApplied(prev => ({ ...prev, [offerId]: true }));
      alert('Candidature envoyée !');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la candidature');
    } finally {
      setApplying(prev => ({ ...prev, [offerId]: false }));
    }
  };

  return (
    <div ref={rootRef}>
      <DashboardShell
        action={{ icon: 'description', label: 'Mes candidatures', to: '/dashboard-candidat/candidatures' }}
        navItems={candidateNavItems}
        profile={{
          name: 'Thomas Dubois',
          role: 'Étudiant Master 2',
          image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
        }}
        searchPlaceholder="Rechercher un mot-clé..."
        sectionLabel="Espace Candidat"
        title="Trouver un stage"
      >
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SurfaceCard className="p-8" data-animate="card">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-on-surface">Formulaire dynamique</h2>
                <p className="mt-2 text-sm text-on-surface-variant">Ajuste ton brief et InternLink re-priorise les offres en direct.</p>
              </div>
              <button className="interactive-scale rounded-xl border border-surface-variant px-4 py-3 text-sm font-bold text-on-surface" onClick={resetDraft} type="button">
                Réinitialiser
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Mots-clés" onChange={(event) => setDraft({ keywords: event.target.value })} value={draft.keywords} />
              <Field label="Ville cible" onChange={(event) => setDraft({ location: event.target.value })} value={draft.location} />
              <SelectField
                label="Durée"
                onChange={(event) => setDraft({ duration: event.target.value })}
                options={['2 à 3 mois', '4 à 6 mois', '6 mois et +']}
                value={draft.duration}
              />
              <Field label="Début souhaité" onChange={(event) => setDraft({ startDate: event.target.value })} type="month" value={draft.startDate} />
            </div>

            <div className="mt-6">
              <ChipGroup
                label="Format"
                onChange={(format) => setDraft({ format })}
                options={['Hybride', 'Télétravail', 'Présentiel']}
                value={draft.format}
              />
            </div>
          </SurfaceCard>

          <div className="space-y-6">
            <SurfaceCard className="p-8" data-animate="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Brief IA</p>
                  <h3 className="mt-3 text-2xl font-black text-on-surface">{draft.keywords || 'Aucun mot-clé'}</h3>
                </div>
                <div className="rounded-2xl bg-primary/10 px-4 py-2 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Format</p>
                  <p className="mt-1 text-lg font-black text-primary">{draft.format || 'Non spécifié'}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-surface p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Lieu</p>
                  <p className="mt-2 font-bold text-on-surface">{draft.location || '-'}</p>
                </div>
                <div className="rounded-2xl bg-surface p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Durée</p>
                  <p className="mt-2 font-bold text-on-surface">{draft.duration || '-'}</p>
                </div>
                <div className="rounded-2xl bg-surface p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Démarrage</p>
                  <p className="mt-2 font-bold text-on-surface">{draft.startDate || '-'}</p>
                </div>
              </div>
            </SurfaceCard>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
              {offers.map((offer) => (
                <SurfaceCard className="p-6" data-animate="card" key={offer.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{offer.company?.name || 'Entreprise'}</p>
                      <h3 className="mt-2 text-xl font-black text-on-surface">{offer.title}</h3>
                      <p className="mt-2 text-sm text-on-surface-variant">
                        {offer.location} · {offer.type} · {offer.salary || 'Non spécifié'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="rounded-2xl bg-gradient-to-br from-primary to-secondary px-4 py-3 text-white shadow-lg shadow-primary/20">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Match</p>
                        <p className="mt-1 text-2xl font-black">{offer.matchScore || 0}%</p>
                      </div>
                      <button 
                        className={`interactive-scale rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest shadow-md transition-all ${applied[offer.id] ? 'bg-green-600 text-white cursor-not-allowed hover:bg-green-600' : applying[offer.id] ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90'}`}
                        disabled={applying[offer.id] || applied[offer.id]}
                        onClick={() => handleApply(offer.id)}
                      >
                        {applied[offer.id] ? 'Postulé' : applying[offer.id] ? 'Envoi...' : 'Postuler'}
                      </button>
                    </div>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          </div>
        </div>
      </DashboardShell>
    </div>
  );
}

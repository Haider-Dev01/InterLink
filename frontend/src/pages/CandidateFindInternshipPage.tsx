import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DashboardShell } from '../components/dashboard/DashboardShell';
import { SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { ChipGroup, Field, SelectField } from '../components/forms/DashboardFields';
import { candidateNavItems } from '../lib/data/dashboardData';
import { buildDashboardProfile } from '../lib/userProfile';
import { useReactPageAnimations } from '../lib/reactPageAnimations';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/authStore';
import { offerService } from '../services/offerService';
import { applicationService } from '../services/applicationService';
import { searchService } from '../services/searchService';

export default function CandidateFindInternshipPage() {
  const rootRef = useRef(null);
  useReactPageAnimations(rootRef);
  const navigate = useNavigate();
  const draft = useAppStore((state) => state.candidateSearchDraft);
  const setDraft = useAppStore((state) => state.setCandidateSearchDraft);
  const resetDraft = useAppStore((state) => state.resetCandidateSearchDraft);
  const authUser = useAuthStore((state) => state.user);

  const [offers, setOffers] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [applying, setApplying] = useState<Record<string, boolean>>({});
  const [applied, setApplied] = useState<Record<string, boolean>>({});

  useEffect(() => {
    offerService.getOffers().then((res) => {
      if (res.success && res.data) {
        setOffers(res.data.offers || res.data);
      }
    });
  }, []);

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      searchService.search(trimmed).then((res) => {
        setSuggestions(res.data?.jobs ?? []);
      }).catch(() => setSuggestions([]));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleApply = async (offerId: string) => {
    if (applying[offerId] || applied[offerId]) return;
    try {
      setApplying((prev) => ({ ...prev, [offerId]: true }));
      await applicationService.apply({ offerId });
      setApplied((prev) => ({ ...prev, [offerId]: true }));
      window.alert('Candidature envoyee !');
    } catch (err: any) {
      window.alert(err.response?.data?.message || 'Erreur lors de la candidature');
    } finally {
      setApplying((prev) => ({ ...prev, [offerId]: false }));
    }
  };

  return (
    <div ref={rootRef}>
      <DashboardShell
        action={{ icon: 'description', label: 'Mes candidatures', to: '/candidate/dashboard/candidatures' }}
        navItems={candidateNavItems}
        profile={buildDashboardProfile(authUser)}
        onSearchChange={setSearchInput}
        searchPlaceholder="Rechercher un mot-cle..."
        sectionLabel="Espace Candidat"
        title="Trouver un stage"
      >
        {suggestions.length ? (
          <SurfaceCard className="p-4" data-animate="card">
            <div className="grid gap-2">
              {suggestions.slice(0, 6).map((job) => (
                <button
                  className="interactive-scale rounded-xl border border-surface-variant bg-surface px-4 py-3 text-left"
                  key={job.id}
                  onClick={() => navigate(`/job/${job.id}`)}
                  type="button"
                >
                  <p className="text-sm font-bold text-on-surface">{job.title}</p>
                  <p className="text-xs text-on-surface-variant">{job.company?.name || 'Entreprise'} · {job.location || 'Lieu non renseigne'}</p>
                </button>
              ))}
            </div>
          </SurfaceCard>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SurfaceCard className="p-8" data-animate="card">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-on-surface">Formulaire dynamique</h2>
                <p className="mt-2 text-sm text-on-surface-variant">Ajuste ton brief et InternLink re-priorise les offres en direct.</p>
              </div>
              <button className="interactive-scale rounded-xl border border-surface-variant px-4 py-3 text-sm font-bold text-on-surface" onClick={resetDraft} type="button">
                Reinitialiser
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Mots-cles" onChange={(event) => setDraft({ keywords: event.target.value })} value={draft.keywords} />
              <Field label="Ville cible" onChange={(event) => setDraft({ location: event.target.value })} value={draft.location} />
              <SelectField label="Duree" onChange={(event) => setDraft({ duration: event.target.value })} options={['2 a 3 mois', '4 a 6 mois', '6 mois et +']} value={draft.duration} />
              <Field label="Debut souhaite" onChange={(event) => setDraft({ startDate: event.target.value })} type="month" value={draft.startDate} />
            </div>

            <div className="mt-6">
              <ChipGroup label="Format" onChange={(format) => setDraft({ format })} options={['Hybride', 'Teletravail', 'Presentiel']} value={draft.format} />
            </div>
          </SurfaceCard>

          <div className="space-y-6">
            <SurfaceCard className="p-8" data-animate="card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Brief IA</p>
                  <h3 className="mt-3 text-2xl font-black text-on-surface">{draft.keywords || 'Aucun mot-cle'}</h3>
                </div>
                <div className="rounded-2xl bg-primary/10 px-4 py-2 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Format</p>
                  <p className="mt-1 text-lg font-black text-primary">{draft.format || 'Non specifie'}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-surface p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Lieu</p>
                  <p className="mt-2 font-bold text-on-surface">{draft.location || '-'}</p>
                </div>
                <div className="rounded-2xl bg-surface p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Duree</p>
                  <p className="mt-2 font-bold text-on-surface">{draft.duration || '-'}</p>
                </div>
                <div className="rounded-2xl bg-surface p-4">
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Demarrage</p>
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
                      <button className="mt-2 text-left text-xl font-black text-on-surface hover:text-primary" onClick={() => navigate(`/job/${offer.id}`)} type="button">
                        {offer.title}
                      </button>
                      <p className="mt-2 text-sm text-on-surface-variant">
                        {offer.location} · {offer.type} · {offer.salary || 'Non specifie'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="rounded-2xl bg-gradient-to-br from-primary to-secondary px-4 py-3 text-white shadow-lg shadow-primary/20">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Match</p>
                        <p className="mt-1 text-2xl font-black">{offer.matchScore || 0}%</p>
                      </div>
                      <button
                        className={`interactive-scale rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest shadow-md transition-all ${applied[offer.id] ? 'cursor-not-allowed bg-green-600 text-white hover:bg-green-600' : applying[offer.id] ? 'cursor-not-allowed bg-surface-variant text-on-surface-variant' : 'bg-primary text-white hover:bg-primary/90'}`}
                        disabled={applying[offer.id] || applied[offer.id]}
                        onClick={() => handleApply(offer.id)}
                      >
                        {applied[offer.id] ? 'Postule' : applying[offer.id] ? 'Envoi...' : 'Postuler'}
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

import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
import { bookmarkService } from '../services/bookmarkService';

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
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const res = await offerService.getOffers({});
      if (res.success && res.data) {
        setOffers(res.data.offers || res.data);
      }
      
      const [bookmarksRes, appsRes] = await Promise.all([
        bookmarkService.getBookmarks(),
        applicationService.getMyApplications()
      ]);

      if (bookmarksRes.success) {
        const ids = new Set<string>(bookmarksRes.data.bookmarks.map((b: any) => b.id));
        setSavedIds(ids);
      }

      if (appsRes.success && Array.isArray(appsRes.data)) {
        setAppliedIds(new Set(appsRes.data.map((app: any) => app.offerId)));
      }
    } catch (err) {
      console.error('Fetch data failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleApply = async (offerId: string) => {
    if (applying[offerId] || appliedIds.has(offerId)) return;
    try {
      setApplying((prev) => ({ ...prev, [offerId]: true }));
      await applicationService.apply({ offerId });
      setAppliedIds((prev) => new Set(prev).add(offerId));
      toast.success('Candidature envoyée avec succès !');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la candidature');
    } finally {
      setApplying((prev) => ({ ...prev, [offerId]: false }));
    }
  };

  const handleSave = async (offerId: string) => {
    if (savedIds.has(offerId)) {
      // Optional: allow unsaving? User didn't ask but it's good UX.
      // For now, let's just implement the saving.
      return;
    }
    
    setSaving((prev) => ({ ...prev, [offerId]: true }));
    try {
      await bookmarkService.bookmarkOffer(offerId);
      setSavedIds(prev => new Set(prev).add(offerId));
      // No alert needed if feedback is immediate in UI
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving((prev) => ({ ...prev, [offerId]: false }));
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
        title="Toutes les offres de stage"
      >
        <div className="mx-auto max-w-4xl space-y-6">
          {isLoading && offers.length === 0 ? (
            <SurfaceCard className="p-12 text-center" data-animate="card">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              <p className="mt-4 text-on-surface-variant">Chargement des offres...</p>
            </SurfaceCard>
          ) : offers.length === 0 ? (
            <SurfaceCard className="p-12 text-center" data-animate="card">
              <p className="text-on-surface-variant">Aucune offre disponible pour le moment.</p>
            </SurfaceCard>
          ) : (
            offers.map((offer) => (
              <SurfaceCard className="p-6" data-animate="card" key={offer.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{offer.company?.name || 'Entreprise'}</p>
                    <button className="mt-2 text-left text-xl font-black text-on-surface hover:text-primary" onClick={() => navigate(`/job/${offer.id}`)} type="button">
                      {offer.title}
                    </button>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      {offer.location} · {offer.type} · {offer.durationMonths ? `${offer.durationMonths} mois` : 'Duree variable'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="rounded-2xl bg-gradient-to-br from-primary to-secondary px-4 py-3 text-white shadow-lg shadow-primary/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Match</p>
                      <p className="mt-1 text-2xl font-black">{offer.matchScore || 0}%</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className={`interactive-scale rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-md transition-all ${savedIds.has(offer.id) ? 'bg-secondary text-white' : saving[offer.id] ? 'bg-surface-variant text-on-surface-variant' : 'bg-surface border border-surface-variant text-on-surface hover:bg-surface-variant'}`}
                        onClick={() => handleSave(offer.id)}
                        disabled={saving[offer.id]}
                        title={savedIds.has(offer.id) ? "Offre enregistrée" : "Enregistrer l'offre"}
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-icons-outlined text-sm">{saving[offer.id] ? 'sync' : savedIds.has(offer.id) ? 'bookmark' : ''}</span>
                          <span>{savedIds.has(offer.id) ? 'Enregistré' : 'Enregistrer l\'offre'}</span>
                        </div>
                      </button>
                      <button
                        className={`interactive-scale rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-md transition-all ${appliedIds.has(offer.id) ? 'cursor-not-allowed bg-gray-400 text-white' : applying[offer.id] ? 'cursor-not-allowed bg-surface-variant text-on-surface-variant' : 'bg-primary text-white hover:bg-primary/90'}`}
                        disabled={applying[offer.id] || appliedIds.has(offer.id)}
                        onClick={() => handleApply(offer.id)}
                      >
                        {appliedIds.has(offer.id) ? 'Postulé' : applying[offer.id] ? 'Envoi...' : 'Postuler'}
                      </button>
                    </div>
                  </div>
                </div>
              </SurfaceCard>
            ))
          )}
        </div>
      </DashboardShell>
    </div>
  );
}

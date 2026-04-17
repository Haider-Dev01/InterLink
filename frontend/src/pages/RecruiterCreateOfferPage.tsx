import { useRef } from 'react';

import { DashboardShell } from '../components/dashboard/DashboardShell';
import { SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { ChipGroup, Field, SelectField, TextareaField } from '../components/forms/DashboardFields';
import { recruiterNavItems } from '../lib/data/dashboardData';
import { useReactPageAnimations } from '../lib/reactPageAnimations';
import { useAppStore } from '../store/useAppStore';

export default function RecruiterCreateOfferPage() {
  const rootRef = useRef(null);
  useReactPageAnimations(rootRef);
  const draft = useAppStore((state) => state.createOfferDraft);
  const setDraft = useAppStore((state) => state.setCreateOfferDraft);
  const resetDraft = useAppStore((state) => state.resetCreateOfferDraft);

  return (
    <div ref={rootRef}>
      <DashboardShell
        navItems={recruiterNavItems}
        profile={{
          name: 'Sophie Martin',
          role: 'RH Manager',
          image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
        }}
        searchPlaceholder="Chercher un modèle..."
        sectionLabel="Espace Recruteur"
        title="Créer une offre"
      >
        <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
          <SurfaceCard className="p-8" data-animate="card">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-on-surface">Brief de poste</h2>
                <p className="mt-2 text-sm text-on-surface-variant">Crée une offre fidèle au style du dashboard et prête pour le matching IA.</p>
              </div>
              <button className="interactive-scale rounded-xl border border-surface-variant px-4 py-3 text-sm font-bold text-on-surface" onClick={resetDraft} type="button">
                Réinitialiser
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Titre" onChange={(event) => setDraft({ title: event.target.value })} value={draft.title} />
              <Field label="Département" onChange={(event) => setDraft({ department: event.target.value })} value={draft.department} />
              <Field label="Ville" onChange={(event) => setDraft({ location: event.target.value })} value={draft.location} />
              <SelectField label="Durée" onChange={(event) => setDraft({ duration: event.target.value })} options={['3 mois', '4 mois', '6 mois']} value={draft.duration} />
            </div>

            <div className="mt-6 space-y-6">
              <ChipGroup label="Type" onChange={(type) => setDraft({ type })} options={['Stage', 'Alternance']} value={draft.type} />
              <ChipGroup label="Mode de travail" onChange={(workMode) => setDraft({ workMode })} options={['Hybride', 'Télétravail', 'Présentiel']} value={draft.workMode} />
              <TextareaField label="Description" onChange={(event) => setDraft({ description: event.target.value })} value={draft.description} />
              <TextareaField label="Compétences recherchées" onChange={(event) => setDraft({ skills: event.target.value })} rows={4} value={draft.skills} />
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-8" data-animate="card">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Preview</p>
            <h3 className="mt-4 text-3xl font-black text-on-surface">{draft.title}</h3>
            <p className="mt-3 text-sm text-on-surface-variant">
              {draft.department} · {draft.location} · {draft.type}
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-surface p-4">
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Mode</p>
                <p className="mt-2 font-bold text-on-surface">{draft.workMode}</p>
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Durée</p>
                <p className="mt-2 font-bold text-on-surface">{draft.duration}</p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] bg-gradient-to-br from-primary to-secondary p-5 text-white">
              <p className="text-xs font-black uppercase tracking-widest text-white/70">Résumé</p>
              <p className="mt-3 text-sm leading-7 text-white/85">{draft.description}</p>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-surface-variant bg-surface p-5">
              <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Skills</p>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">{draft.skills}</p>
            </div>
          </SurfaceCard>
        </div>
      </DashboardShell>
    </div>
  );
}

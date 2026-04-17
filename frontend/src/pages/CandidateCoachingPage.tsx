import { useRef } from 'react';

import { DashboardShell } from '../components/dashboard/DashboardShell';
import { ProgressMetric, SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { candidateNavItems, coachingSessions } from '../lib/data/dashboardData';
import { useReactPageAnimations } from '../lib/reactPageAnimations';

export default function CandidateCoachingPage() {
  const rootRef = useRef(null);
  useReactPageAnimations(rootRef);

  return (
    <div ref={rootRef}>
      <DashboardShell
        action={{ icon: 'search', label: 'Trouver un stage', to: '/dashboard-candidat/trouver-stage' }}
        navItems={candidateNavItems}
        profile={{
          name: 'Thomas Dubois',
          role: 'Étudiant Master 2',
          image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
        }}
        searchPlaceholder="Rechercher un exercice..."
        sectionLabel="Espace Candidat"
        title="Coaching IA"
      >
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <SurfaceCard className="overflow-hidden p-0" data-animate="card">
            <div className="bg-gradient-to-br from-primary to-secondary p-8 text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/70">Session en direct</p>
              <h2 className="mt-4 text-3xl font-black">Préparation entretien produit</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/80">Ton coach détecte les réponses trop génériques et propose des reformulations plus concrètes.</p>
            </div>
            <div className="space-y-4 p-8">
              <div className="rounded-[1.5rem] bg-surface p-5">
                <p className="text-xs font-black uppercase tracking-widest text-primary">Coach AI</p>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">Commence par un exemple clair de défi rencontré, puis termine par le résultat mesurable.</p>
              </div>
              <div className="rounded-[1.5rem] border border-surface-variant bg-white p-5">
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Toi</p>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">Sur mon projet e-commerce, j’ai refondu le parcours panier et réduit l’abandon de 12%.</p>
              </div>
              <button className="interactive-scale w-full rounded-xl bg-primary px-4 py-3 font-bold text-white shadow-xl shadow-primary/20" type="button">
                Continuer la simulation
              </button>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-8" data-animate="card">
            <h3 className="text-2xl font-black text-on-surface">Parcours recommandés</h3>
            <div className="mt-8 space-y-6">
              {coachingSessions.map((session) => (
                <div className="space-y-3" key={session.title}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-black text-on-surface">{session.title}</h4>
                      <p className="mt-1 text-xs font-black uppercase tracking-widest text-primary">{session.mentor}</p>
                    </div>
                    <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-on-surface-variant">{session.progress}%</span>
                  </div>
                  <p className="text-sm text-on-surface-variant">{session.summary}</p>
                  <ProgressMetric label="Progression" value={session.progress} />
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </DashboardShell>
    </div>
  );
}

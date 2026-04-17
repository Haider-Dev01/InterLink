import { useRef } from 'react';

import { DashboardShell } from '../components/dashboard/DashboardShell';
import { ProgressMetric, SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { candidateNavItems, cvNexusModules } from '../lib/data/dashboardData';
import { useReactPageAnimations } from '../lib/reactPageAnimations';

export default function CandidateCvNexusPage() {
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
        searchPlaceholder="Rechercher une section CV..."
        sectionLabel="Espace Candidat"
        title="CV Nexus"
      >
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <SurfaceCard className="p-8" data-animate="card">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-on-surface">Structure du profil</h2>
                <p className="mt-2 text-sm text-on-surface-variant">Le moteur Nexus mesure la lisibilité et la pertinence de chaque section.</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary">92% complet</span>
            </div>

            <div className="space-y-6">
              {cvNexusModules.map((module) => (
                <div key={module.label}>
                  <ProgressMetric label={module.label} value={module.completion} />
                  <p className="mt-2 text-sm text-on-surface-variant">{module.hint}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-8" data-animate="card">
            <h3 className="text-2xl font-black text-on-surface">Recommendations IA</h3>
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-primary to-secondary p-5 text-white">
                <p className="text-xs font-black uppercase tracking-widest text-white/70">Quick win</p>
                <p className="mt-3 text-sm leading-7">Ajoute un chiffre d’impact au projet marketplace pour débloquer +4 points ATS.</p>
              </div>
              <div className="rounded-[1.5rem] border border-surface-variant bg-surface p-5">
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Signal recruteur</p>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">Les profils avec portfolio Figma joint reçoivent 23% plus de vues.</p>
              </div>
              <div className="rounded-[1.5rem] border border-surface-variant bg-surface p-5">
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">CV export</p>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">Version PDF optimisée ATS prête pour les offres DataSpring et Pulse Studio.</p>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </DashboardShell>
    </div>
  );
}

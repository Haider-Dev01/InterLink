import { useRef } from 'react';

import { DashboardShell } from '../components/dashboard/DashboardShell';
import { ProgressMetric, SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { Field, SelectField } from '../components/forms/DashboardFields';
import { adminNavItems } from '../lib/data/dashboardData';
import { useReactPageAnimations } from '../lib/reactPageAnimations';

export default function AdminSettingsPage() {
  const rootRef = useRef(null);
  useReactPageAnimations(rootRef);

  return (
    <div ref={rootRef}>
      <DashboardShell
        navItems={adminNavItems}
        profile={{
          name: 'Admin Nexus',
          role: 'Super Administrateur',
          image: 'https://ui-avatars.com/api/?name=Admin+Nexus&background=00288e&color=fff&rounded=true',
        }}
        searchPlaceholder="Rechercher une configuration..."
        sectionLabel="Administration"
        subtitle="Contrôles de plateforme, alertes et gouvernance IA."
        title="Paramètres"
        variant="admin"
      >
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SurfaceCard className="p-8" data-animate="card">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-black text-on-surface">Configuration plateforme</h2>
              <span className="rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary">Neural Nexus</span>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nom de l'espace" onChange={() => {}} value="InternLink Production" />
              <SelectField label="Région des données" onChange={() => {}} options={['Europe', 'Afrique du Nord', 'Global']} value="Europe" />
              <Field label="Email alertes" onChange={() => {}} value="ops@internlink.ai" />
              <SelectField label="Fréquence rapport" onChange={() => {}} options={['Chaque jour', 'Chaque semaine', 'Chaque mois']} value="Chaque semaine" />
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-8" data-animate="card">
            <h3 className="text-2xl font-black text-on-surface">Santé du système</h3>
            <div className="mt-8 space-y-6">
              <ProgressMetric label="Pipeline de matching" value={96} />
              <ProgressMetric label="Temps de réponse IA" tone="from-secondary to-primary" value={88} />
              <ProgressMetric label="Qualité des données" tone="from-emerald-500 to-teal-500" value={91} />
            </div>
          </SurfaceCard>
        </div>
      </DashboardShell>
    </div>
  );
}

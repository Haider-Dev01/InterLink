import { useRef } from 'react';

import { PublicAudiencePage } from '../components/PublicAudiencePage';
import { useReactPageAnimations } from '../lib/reactPageAnimations';

export default function RecruitersPage() {
  const rootRef = useRef(null);
  useReactPageAnimations(rootRef);

  return (
    <div ref={rootRef}>
      <PublicAudiencePage
        eyebrow="Pour les recruteurs"
        highlights={[
          { icon: 'groups_2', label: 'Talents scorés', value: '12k+' },
          { icon: 'schedule', label: 'Screening moyen', value: '11 min' },
          { icon: 'insights', label: 'Rapports IA', value: 'Temps réel' },
        ]}
        panels={[
          {
            icon: 'work',
            title: 'Offres qui performent',
            body: 'Publie, ajuste et compare la performance de tes offres avec la même grammaire visuelle que le dashboard.',
          },
          {
            icon: 'analytics',
            title: 'Décision assistée',
            body: 'Transforme les candidatures en shortlists grâce à des scores lisibles, des charts et des insights actionnables.',
          },
        ]}
        primaryCta={{ label: 'Publier une offre', to: '/dashboard-recruteur/creer-offre' }}
        secondaryCta={{ label: 'Accéder au dashboard', to: '/dashboard-recruteur' }}
        subtitle="InternLink permet aux équipes RH de publier, scorer et shortlister plus vite sans casser la qualité de sélection."
        title="Recrutez des stagiaires plus vite avec des signaux IA fiables."
      />
    </div>
  );
}

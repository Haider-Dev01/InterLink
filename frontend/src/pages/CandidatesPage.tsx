import { useRef } from 'react';

import { PublicAudiencePage } from '../components/PublicAudiencePage';
import { useReactPageAnimations } from '../lib/reactPageAnimations';

export default function CandidatesPage() {
  const rootRef = useRef(null);
  useReactPageAnimations(rootRef);

  return (
    <div ref={rootRef}>
      <PublicAudiencePage
        eyebrow="Pour les candidats"
        highlights={[
          { icon: 'person_search', label: 'Offres ciblées', value: '500+' },
          { icon: 'auto_awesome', label: 'Match IA moyen', value: '88%' },
          { icon: 'forum', label: 'Coaching actif', value: '24/7' },
        ]}
        panels={[
          {
            icon: 'assignment_ind',
            title: 'CV Nexus',
            body: 'Optimise ton CV, ton portfolio et ton pitch avec des retours guidés par IA.',
          },
          {
            icon: 'rocket_launch',
            title: 'Postuler plus vite',
            body: 'Centralise tes candidatures, tes relances et tes entretiens dans un seul workflow premium.',
          },
        ]}
        primaryCta={{ label: 'Créer mon profil', to: '/signup' }}
        secondaryCta={{ label: 'Voir le dashboard', to: '/candidate/dashboard' }}
        subtitle="InternLink aide les étudiants à trouver des stages plus pertinents grâce au matching, au coaching et à la clarté de leur profil."
        title="Trouve un stage qui te ressemble vraiment."
      />
    </div>
  );
}

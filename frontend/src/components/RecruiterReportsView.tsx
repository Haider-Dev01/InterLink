import { RecruiterLayout } from './RecruiterLayout';

export default function RecruiterReportsView() {
  return (
    <RecruiterLayout>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-on-surface">Rapports IA</h2>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-surface-variant text-center shadow-sm">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-4">analytics</span>
        <h3 className="text-xl font-bold text-on-surface mb-2">Statistiques Avancées</h3>
        <p className="text-on-surface-variant max-w-md mx-auto">
          Les rapports d'intelligence artificielle détaillés seront bientôt disponibles ici. Vous pourrez y analyser les performances de vos offres et la qualité des correspondances.
        </p>
      </div>
    </RecruiterLayout>
  );
}

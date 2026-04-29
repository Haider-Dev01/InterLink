import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { companyService } from '../services/companyService';

export default function CompanyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    companyService.getCompanyById(id)
      .then((response) => {
        setCompany(response.data?.company ?? null);
      })
      .catch((error) => {
        console.error('Failed to load company details', error);
        setCompany(null);
      });
  }, [id]);

  const offers = useMemo(() => company?.jobOffers ?? [], [company]);

  if (!company) {
    return <div className="min-h-screen bg-surface px-8 py-16 text-on-surface">Chargement de l'entreprise...</div>;
  }

  return (
    <div className="min-h-screen bg-surface px-6 py-10 md:px-12">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-surface-variant bg-white p-8 shadow-sm">
        <button className="mb-6 rounded-xl border border-surface-variant px-4 py-2 text-sm font-bold" onClick={() => navigate(-1)} type="button">
          Retour
        </button>

        <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Entreprise</p>
        <h1 className="mt-2 text-3xl font-black text-on-surface">{company.name}</h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          {company.industry || 'Secteur non renseigne'} · {company.isVerified ? 'Verifiee' : 'Non verifiee'}
        </p>

        {company.siteWeb ? (
          <a className="mt-4 inline-flex rounded-xl border border-surface-variant px-4 py-2 text-sm font-semibold text-primary hover:bg-surface" href={company.siteWeb} rel="noreferrer" target="_blank">
            Visiter le site web
          </a>
        ) : null}

        <div className="mt-8">
          <h2 className="text-xl font-black text-on-surface">Offres publiees</h2>
          <div className="mt-4 grid gap-3">
            {offers.length ? offers.map((offer: any) => (
              <button
                className="rounded-xl border border-surface-variant px-4 py-3 text-left hover:bg-surface"
                key={offer.id}
                onClick={() => navigate(`/job/${offer.id}`)}
                type="button"
              >
                <p className="text-sm font-bold text-on-surface">{offer.title}</p>
                <p className="text-xs text-on-surface-variant">{offer.location || 'Lieu non renseigne'}</p>
              </button>
            )) : (
              <p className="text-sm text-on-surface-variant">Aucune offre publiee pour le moment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RecruiterLayout } from './RecruiterLayout';
import { offerService } from '../services/offerService';
import { useOfferStore } from '../store/offerStore';

export default function RecruiterEditOfferForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fetchMyOffers = useOfferStore((state) => state.fetchMyOffers);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    location: '',
    durationMonths: '',
    remote: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      return;
    }

    offerService.getJobById(id)
      .then((res) => {
        const offer = res.data?.offer;
        if (!offer) {
          throw new Error('Offre introuvable');
        }

        setFormData({
          title: offer.title || '',
          description: offer.description || '',
          skills: (offer.offerSkills ?? []).map((item: any) => item.skill?.name).filter(Boolean).join(', '),
          location: offer.location || '',
          durationMonths: offer.durationMonths ? String(offer.durationMonths) : '',
          remote: Boolean(offer.remote),
        });
      })
      .catch((err: any) => {
        setError(err?.response?.data?.message || err.message || 'Erreur lors du chargement de l\'offre');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        location: formData.location || undefined,
        durationMonths: formData.durationMonths ? Number(formData.durationMonths) : undefined,
        remote: formData.remote,
        skills: formData.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      };

      const response = await offerService.updateJob(id, payload);
      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la modification');
      }

      await fetchMyOffers();
      navigate('/recruiter/jobs');
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Erreur lors de la modification');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <RecruiterLayout>
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-black text-on-surface mb-6">Modifier l'offre</h2>
        {error ? <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div> : null}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] border border-surface-variant shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-2">Titre</label>
            <input
              required
              value={formData.title}
              onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full border border-surface-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-2">Description</label>
            <textarea
              required
              rows={5}
              value={formData.description}
              onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              className="w-full border border-surface-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-2">Competences</label>
            <input
              required
              value={formData.skills}
              onChange={(event) => setFormData((prev) => ({ ...prev, skills: event.target.value }))}
              className="w-full border border-surface-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-2">Lieu</label>
              <input
                value={formData.location}
                onChange={(event) => setFormData((prev) => ({ ...prev, location: event.target.value }))}
                className="w-full border border-surface-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-2">Duree (mois)</label>
              <input
                type="number"
                min={1}
                value={formData.durationMonths}
                onChange={(event) => setFormData((prev) => ({ ...prev, durationMonths: event.target.value }))}
                className="w-full border border-surface-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.remote}
              onChange={(event) => setFormData((prev) => ({ ...prev, remote: event.target.checked }))}
              className="rounded border-surface-variant text-primary focus:ring-primary/20"
            />
            <span className="text-sm font-bold text-on-surface-variant">Remote possible</span>
          </label>

          <div className="pt-4 flex justify-end gap-4">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 font-bold text-on-surface-variant hover:bg-surface rounded-xl transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={isSubmitting} className="bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-primary-container transition-colors disabled:opacity-50">
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </RecruiterLayout>
  );
}

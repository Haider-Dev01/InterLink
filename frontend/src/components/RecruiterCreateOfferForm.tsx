import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecruiterLayout } from './RecruiterLayout';
import { offerService } from '../services/offerService';
import { useOfferStore } from '../store/offerStore';

export default function RecruiterCreateOfferForm() {
  const navigate = useNavigate();
  const fetchMyOffers = useOfferStore((state) => state.fetchMyOffers);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    location: '',
    type: 'internship',
    durationMonths: '',
    remote: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        location: formData.location || undefined,
        type: formData.type,
        durationMonths: formData.durationMonths ? Number(formData.durationMonths) : undefined,
        remote: formData.remote,
        skills: formData.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      };

      const response = await offerService.createJob(payload);
      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la creation de l\'offre');
      }

      await fetchMyOffers();
      navigate('/recruiter/jobs');
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Erreur lors de la creation de l\'offre');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RecruiterLayout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-black text-on-surface mb-6">Nouvelle Offre</h2>

        {error ? <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div> : null}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] border border-surface-variant shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-2">Titre</label>
            <input
              required
              value={formData.title}
              onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full border border-surface-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Frontend Intern"
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
              placeholder="Decrivez les missions et le profil recherche"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-2">Competences (separees par des virgules)</label>
            <input
              required
              value={formData.skills}
              onChange={(event) => setFormData((prev) => ({ ...prev, skills: event.target.value }))}
              className="w-full border border-surface-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="React, TypeScript, Prisma"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-2">Lieu</label>
              <input
                value={formData.location}
                onChange={(event) => setFormData((prev) => ({ ...prev, location: event.target.value }))}
                className="w-full border border-surface-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Paris"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(event) => setFormData((prev) => ({ ...prev, type: event.target.value }))}
                className="w-full border border-surface-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="internship">Internship</option>
                <option value="full-time">Full-time</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-2">Duree (mois)</label>
              <input
                type="number"
                min={1}
                value={formData.durationMonths}
                onChange={(event) => setFormData((prev) => ({ ...prev, durationMonths: event.target.value }))}
                className="w-full border border-surface-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="6"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.remote}
                  onChange={(event) => setFormData((prev) => ({ ...prev, remote: event.target.checked }))}
                  className="rounded border-surface-variant text-primary focus:ring-primary/20"
                />
                <span className="text-sm font-bold text-on-surface-variant">Remote possible</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 font-bold text-on-surface-variant hover:bg-surface rounded-xl transition-colors">
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-primary-container transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creation...' : "Creer l'offre"}
            </button>
          </div>
        </form>
      </div>
    </RecruiterLayout>
  );
}

import { useState, useEffect } from 'react';
import { RecruiterLayout } from './RecruiterLayout';
import { offerService } from '../services/offerService';
import { useNavigate, useParams } from 'react-router-dom';
import { useOfferStore } from '../store/offerStore';

export default function RecruiterEditOfferForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fetchMyOffers = useOfferStore(s => s.fetchMyOffers);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    type: 'INTERNSHIP',
    isRemote: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchOffer = async () => {
      try {
        const res = await offerService.getOfferById(id);
        if (res.success && res.data) {
          const offer = res.data;
          setFormData({
            title: offer.title || '',
            description: offer.description || '',
            requirements: Array.isArray(offer.requirements) ? offer.requirements.join(', ') : offer.requirements || '',
            location: offer.location || '',
            type: offer.type || 'INTERNSHIP',
            isRemote: offer.isRemote || false
          });
        } else {
          setError('Impossible de charger l\'offre.');
        }
      } catch (err) {
        setError('Erreur lors du chargement de l\'offre.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOffer();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const data = {
        ...formData,
        requirements: formData.requirements.split(',').map(r => r.trim()).filter(Boolean)
      };
      
      const res = await offerService.updateOffer(id, data);
      if (res.success) {
        await fetchMyOffers();
        navigate('/recruiter/offers');
      } else {
        setError(res.message || 'Erreur lors de la modification de l\'offre');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification de l\'offre');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <RecruiterLayout>
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </RecruiterLayout>
    );
  }

  return (
    <RecruiterLayout>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-black text-on-surface mb-6">Modifier l'Offre</h2>
        
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}
        
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] border border-surface-variant shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-2">Titre de l'offre</label>
            <input 
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-surface-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="ex: UI/UX Designer Junior"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-2">Description</label>
            <textarea 
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full border border-surface-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Décrivez les missions..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-2">Compétences requises (séparées par des virgules)</label>
            <input 
              required
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              className="w-full border border-surface-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Figma, React, Node.js"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-2">Lieu</label>
              <input 
                required
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full border border-surface-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Paris, France"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-on-surface-variant mb-2">Type</label>
              <select 
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border border-surface-variant rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="INTERNSHIP">Stage</option>
                <option value="APPRENTICESHIP">Alternance</option>
                <option value="CDI">CDI</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isRemote"
              name="isRemote"
              checked={formData.isRemote}
              onChange={handleChange}
              className="rounded border-surface-variant text-primary focus:ring-primary/20"
            />
            <label htmlFor="isRemote" className="text-sm font-bold text-on-surface-variant">Télétravail possible</label>
          </div>
          
          <div className="pt-4 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="px-6 py-3 font-bold text-on-surface-variant hover:bg-surface rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-primary-container transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> : null}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </RecruiterLayout>
  );
}

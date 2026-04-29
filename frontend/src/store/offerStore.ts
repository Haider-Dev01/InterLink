import { create } from 'zustand';
import { offerService } from '../services/offerService';

export type OfferState = {
  myOffers: any[];
  isLoading: boolean;
  error: string | null;
  fetchMyOffers: () => Promise<void>;
};

export const useOfferStore = create<OfferState>((set) => ({
  myOffers: [],
  isLoading: false,
  error: null,
  
  fetchMyOffers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await offerService.getMyJobs();
      if (response.success) {
        set({ myOffers: response.data?.offers ?? [], isLoading: false });
      } else {
        set({ error: 'Erreur lors du chargement des offres', isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Erreur lors du chargement des offres', isLoading: false });
    }
  }
}));

import { create } from 'zustand';

export type UserType = 'student' | 'recruiter' | 'admin';

export type CandidateSearchDraft = {
  keywords: string;
  location: string;
  format: string;
  duration: string;
  startDate: string;
};

export type CreateOfferDraft = {
  title: string;
  department: string;
  location: string;
  type: string;
  workMode: string;
  duration: string;
  description: string;
  skills: string;
};

export type UserProfile = {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
};

export type UiState = {
  assistantPanelOpen: boolean;
};

export type AppStoreState = {
  currentPath: string;
  scrollProgress: number;
  matchScore: number;
  userType: UserType;
  candidateSearchDraft: CandidateSearchDraft;
  createOfferDraft: CreateOfferDraft;
  user: UserProfile;
  ui: UiState;
  setCurrentPath: (currentPath: string) => void;
  setScrollProgress: (scrollProgress: number) => void;
  setMatchScore: (matchScore: number) => void;
  setUserType: (userType: UserType) => void;
  setCandidateSearchDraft: (candidateSearchDraft: Partial<CandidateSearchDraft>) => void;
  resetCandidateSearchDraft: () => void;
  setCreateOfferDraft: (createOfferDraft: Partial<CreateOfferDraft>) => void;
  resetCreateOfferDraft: () => void;
  setUser: (user: Partial<UserProfile>) => void;
  setUiState: (ui: Partial<UiState>) => void;
};

const initialCandidateSearchDraft: CandidateSearchDraft = {
  keywords: 'React, UX, produit',
  location: 'Tunis',
  format: 'Hybride',
  duration: '2 a 3 mois',
  startDate: '2026-06',
};

const initialCreateOfferDraft: CreateOfferDraft = {
  title: 'Frontend Intern',
  department: 'Produit',
  location: 'Paris',
  type: 'Stage',
  workMode: 'Hybride',
  duration: '6 mois',
  description: 'Construire des interfaces React/Tailwind performantes au sein de l’équipe produit.',
  skills: 'React, TailwindCSS, JavaScript, communication',
};

export const useAppStore = create<AppStoreState>()((set) => ({
  currentPath: '/',
  scrollProgress: 0,
  matchScore: 92,
  userType: 'student',
  candidateSearchDraft: initialCandidateSearchDraft,
  createOfferDraft: initialCreateOfferDraft,
  user: {
    firstName: 'Thomas',
    lastName: 'Dubois',
    role: 'Candidat',
    email: 'thomas.d@email.com',
  },
  ui: {
    assistantPanelOpen: true,
  },
  setCurrentPath: (currentPath) => set({ currentPath }),
  setScrollProgress: (scrollProgress) => set({ scrollProgress }),
  setMatchScore: (matchScore) => set({ matchScore }),
  setUserType: (userType) => set({ userType }),
  setCandidateSearchDraft: (candidateSearchDraft) =>
    set((state) => ({
      candidateSearchDraft: { ...state.candidateSearchDraft, ...candidateSearchDraft },
    })),
  resetCandidateSearchDraft: () => set({ candidateSearchDraft: initialCandidateSearchDraft }),
  setCreateOfferDraft: (createOfferDraft) =>
    set((state) => ({
      createOfferDraft: { ...state.createOfferDraft, ...createOfferDraft },
    })),
  resetCreateOfferDraft: () => set({ createOfferDraft: initialCreateOfferDraft }),
  setUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),
  setUiState: (ui) => set((state) => ({ ui: { ...state.ui, ...ui } })),
}));

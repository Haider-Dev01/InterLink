export const candidateNavItems = [
  { label: 'Tableau de bord', icon: 'dashboard', to: '/dashboard-candidat' },
  { label: 'Candidatures', icon: 'description', to: '/dashboard-candidat/candidatures', badge: '4' },
  { label: 'Mon CV Nexus', icon: 'assignment_ind', to: '/dashboard-candidat/cv-nexus' },
  { label: 'Offres Sauvegardées', icon: 'bookmark', to: '/dashboard-candidat/offres-sauvegardees' },
  { label: 'Coaching IA', icon: 'forum', to: '/dashboard-candidat/coaching-ia' },
  { label: 'Analyse CV', icon: 'analytics', to: '/dashboard-candidat/analyse-cv' },
];

export const recruiterNavItems = [
  { label: "Vue d'ensemble", icon: 'dashboard', to: '/dashboard-recruteur' },
  { label: 'Mes Offres', icon: 'work', to: '/dashboard-recruteur/offres', badge: '3' },
  { label: 'Candidats', icon: 'group', to: '/dashboard-recruteur/candidats' },
  { label: 'Rapports IA', icon: 'analytics', to: '/dashboard-recruteur/rapports-ia' },
];

export const adminNavItems = [
  { label: 'Dashboard', icon: 'grid_view', to: '/dashboard-administrateur' },
  { label: 'Utilisateurs', icon: 'group', to: '/admin-utilisateurs' },
  { label: 'Offres & Stages', icon: 'work', to: '/admin-offres', badge: '12' },
  { label: 'Analytique IA', icon: 'insert_chart', to: '/dashboard-administrateur/analytique-ia' },
  { label: 'Paramètres', icon: 'settings', to: '/dashboard-administrateur/parametres' },
];

export const candidateApplications = [
  {
    id: 'APP-1024',
    company: 'Pulse Studio',
    role: 'Frontend Developer Intern',
    status: 'Entretien',
    statusTone: 'secondary',
    appliedAt: '14 avr. 2026',
    nextStep: 'Simulation technique jeudi 18:30',
    score: 94,
    city: 'Paris',
  },
  {
    id: 'APP-1028',
    company: 'DataSpring',
    role: 'Product Design Intern',
    status: 'Analyse IA',
    statusTone: 'primary',
    appliedAt: '12 avr. 2026',
    nextStep: 'CV comparé à 42 profils recrutés',
    score: 88,
    city: 'Lyon',
  },
  {
    id: 'APP-1031',
    company: 'Nova Commerce',
    role: 'Growth & CRM Intern',
    status: 'Relance',
    statusTone: 'emerald',
    appliedAt: '09 avr. 2026',
    nextStep: 'Email de suivi recommandé demain',
    score: 81,
    city: 'Remote',
  },
  {
    id: 'APP-1036',
    company: 'Atlas AI',
    role: 'AI Ops Intern',
    status: 'Refus',
    statusTone: 'red',
    appliedAt: '03 avr. 2026',
    nextStep: 'Suggestion IA: renforcer vos métriques projet',
    score: 73,
    city: 'Berlin',
  },
];

export const savedOffers = [
  {
    id: 'OFF-224',
    title: 'UX Research Intern',
    company: 'Loop Venture',
    location: 'Tunis',
    format: 'Hybride',
    match: 91,
    tags: ['UX', 'Interviews', 'Figma'],
  },
  {
    id: 'OFF-228',
    title: 'Frontend React Intern',
    company: 'Neural Labs',
    location: 'Paris',
    format: 'Remote-first',
    match: 96,
    tags: ['React', 'Tailwind', 'GSAP'],
  },
  {
    id: 'OFF-231',
    title: 'Product Marketing Intern',
    company: 'Mira SaaS',
    location: 'Marseille',
    format: 'Présentiel',
    match: 84,
    tags: ['Go-to-market', 'CRM', 'Analytics'],
  },
];

export const cvNexusModules = [
  { label: 'Résumé exécutif', completion: 100, hint: 'Ton positionnement est clair et orienté produit.' },
  { label: 'Expériences projets', completion: 86, hint: 'Ajoute un résultat chiffré sur le projet e-commerce.' },
  { label: 'Compétences techniques', completion: 92, hint: 'La stack React/Tailwind ressort très bien.' },
  { label: 'Portfolio', completion: 68, hint: 'Deux cas d’étude premium augmenteraient le score.' },
];

export const coachingSessions = [
  {
    title: 'Simulation entretien RH',
    mentor: 'InternLink Coach AI',
    summary: 'Travail sur la clarté de ta présentation et tes transitions.',
    progress: 78,
  },
  {
    title: 'Pitch 45 secondes',
    mentor: 'Voice Match Engine',
    summary: 'Ton pitch est fluide, mais les résultats projet peuvent être plus concrets.',
    progress: 64,
  },
  {
    title: 'Négociation et questions',
    mentor: 'Hiring Signal AI',
    summary: 'Prépare 3 questions fortes pour la fin d’entretien.',
    progress: 52,
  },
];

export const internshipSuggestions = [
  {
    company: 'PixelForge',
    title: 'Frontend React / Motion',
    location: 'Tunis',
    type: 'Hybride',
    salary: '900 DT / mois',
    score: 95,
  },
  {
    company: 'ScaleHub',
    title: 'Growth Ops Intern',
    location: 'Remote',
    type: 'Télétravail',
    salary: '1 100 € / mois',
    score: 89,
  },
  {
    company: 'Orbit Studio',
    title: 'Product Designer Intern',
    location: 'Paris',
    type: 'Présentiel',
    salary: '1 300 € / mois',
    score: 86,
  },
];

export const recruiterOffers = [
  {
    id: 'R-201',
    title: 'Frontend Intern',
    city: 'Paris',
    applicants: 34,
    qualified: 11,
    status: 'Active',
    fillRate: 78,
  },
  {
    id: 'R-204',
    title: 'Data Analyst Intern',
    city: 'Lille',
    applicants: 21,
    qualified: 8,
    status: 'Active',
    fillRate: 64,
  },
  {
    id: 'R-208',
    title: 'Talent Acquisition Intern',
    city: 'Remote',
    applicants: 18,
    qualified: 6,
    status: 'Draft',
    fillRate: 42,
  },
];

export const recruiterCandidates = [
  {
    name: 'Thomas Dubois',
    role: 'Frontend / UX',
    score: 94,
    experience: '2 projets livrés',
    availability: 'Juin 2026',
    location: 'Tunis',
  },
  {
    name: 'Sarra Ben Amor',
    role: 'Data & Product',
    score: 91,
    experience: 'SQL, Python, dashboards',
    availability: 'Mai 2026',
    location: 'Sfax',
  },
  {
    name: 'Youssef Gharbi',
    role: 'Growth Marketing',
    score: 86,
    experience: 'CRM, automation, lifecycle',
    availability: 'Immédiate',
    location: 'Remote',
  },
  {
    name: 'Ines Trabelsi',
    role: 'UI Design',
    score: 89,
    experience: 'Figma, design systems',
    availability: 'Juillet 2026',
    location: 'Tunis',
  },
];

export const recruiterActivitySeries = [
  { name: 'Lun', candidatures: 12, entretiens: 4, shortlists: 3 },
  { name: 'Mar', candidatures: 18, entretiens: 6, shortlists: 4 },
  { name: 'Mer', candidatures: 22, entretiens: 7, shortlists: 5 },
  { name: 'Jeu', candidatures: 16, entretiens: 5, shortlists: 3 },
  { name: 'Ven', candidatures: 24, entretiens: 8, shortlists: 6 },
];

export const adminApplicationsSeries = [
  { name: 'Jan', applications: 220, matches: 180 },
  { name: 'Fév', applications: 260, matches: 205 },
  { name: 'Mar', applications: 310, matches: 248 },
  { name: 'Avr', applications: 350, matches: 281 },
  { name: 'Mai', applications: 420, matches: 336 },
  { name: 'Juin', applications: 470, matches: 381 },
];

export const adminMatchingDistribution = [
  { name: '90-100', value: 34 },
  { name: '80-89', value: 29 },
  { name: '70-79', value: 18 },
  { name: '60-69', value: 12 },
  { name: '<60', value: 7 },
];

export const adminUserGrowth = [
  { name: 'Sem 1', candidats: 340, recruteurs: 44 },
  { name: 'Sem 2', candidats: 420, recruteurs: 51 },
  { name: 'Sem 3', candidats: 530, recruteurs: 63 },
  { name: 'Sem 4', candidats: 610, recruteurs: 72 },
  { name: 'Sem 5', candidats: 760, recruteurs: 88 },
  { name: 'Sem 6', candidats: 910, recruteurs: 103 },
];

export const adminRecruiterActivity = [
  { name: 'Tech', active: 68 },
  { name: 'Finance', active: 42 },
  { name: 'Retail', active: 37 },
  { name: 'Health', active: 28 },
  { name: 'Media', active: 24 },
];

export const adminKpis = [
  { label: 'Applications IA', value: '4 820', trend: '+18%', icon: 'insights', tone: 'primary' },
  { label: 'Match moyen', value: '88%', trend: '+6 pts', icon: 'auto_graph', tone: 'secondary' },
  { label: 'Recruteurs actifs', value: '103', trend: '+14%', icon: 'groups_2', tone: 'emerald' },
  { label: 'Croissance candidats', value: '910', trend: '+22%', icon: 'trending_up', tone: 'amber' },
];

export const audienceTestimonials = [
  {
    name: 'Amine B.',
    role: 'Candidat',
    quote: "Grâce à InternLink, j'ai décroché un entretien en 48 heures.",
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
  },
  {
    name: 'Sarra M.',
    role: 'Candidate',
    quote: 'Le matching IA m’a aidée à cibler les offres qui me correspondent vraiment.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  },
  {
    name: 'Sophie Martin',
    role: 'Recruteuse',
    quote: 'La shortlist automatisée nous fait gagner des heures chaque semaine.',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=120&q=80',
  },
];

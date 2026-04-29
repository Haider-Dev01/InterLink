export const routeMap: Record<string, string> = {
  '/': '/',
  '/index.html': '/',
  '/landing': '/',
  '/landing_page.html': '/',
  '/candidats': '/candidats',
  '/recruteurs': '/recruteurs',
  '/login': '/login',
  '/login.html': '/login',
  '/register': '/register',
  '/register.html': '/register',
  '/signup': '/register',
  '/inscription.html': '/register',
  '/assistant-ia': '/assistant-ia',
  '/assistant_ia.html': '/assistant-ia',
  '/analyse-cv': '/analyse-cv',
  '/analyse_cv.html': '/analyse-cv',
  '/dashboard': '/dashboard',
  '/dashboard-candidat': '/candidate/dashboard',
  '/daboard_candidat.html': '/candidate/dashboard',
  '/dashboard-candidat/candidatures': '/candidate/dashboard/candidatures',
  '/dashboard-candidat/offres-sauvegardees': '/candidate/dashboard/offres-sauvegardees',
  '/dashboard-candidat/cv-nexus': '/candidate/dashboard/cv-nexus',
  '/dashboard-candidat/coaching-ia': '/candidate/dashboard/coaching-ia',
  '/dashboard-candidat/analyse-cv': '/candidate/dashboard/analyse-cv',
  '/dashboard-candidat/trouver-stage': '/candidate/dashboard/trouver-stage',
  '/candidate/dashboard': '/candidate/dashboard',
  '/candidate/dashboard/candidatures': '/candidate/dashboard/candidatures',
  '/candidate/dashboard/offres-sauvegardees': '/candidate/dashboard/offres-sauvegardees',
  '/candidate/dashboard/cv-nexus': '/candidate/dashboard/cv-nexus',
  '/candidate/dashboard/coaching-ia': '/candidate/dashboard/coaching-ia',
  '/candidate/dashboard/analyse-cv': '/candidate/dashboard/analyse-cv',
  '/candidate/dashboard/trouver-stage': '/candidate/dashboard/trouver-stage',
  '/candidatures': '/candidate/dashboard/candidatures',
  '/cv-nexus': '/candidate/dashboard/cv-nexus',
  '/offres-sauvegardees': '/candidate/dashboard/offres-sauvegardees',
  '/coaching-ia': '/candidate/dashboard/coaching-ia',
  '/trouver-stage': '/candidate/dashboard/trouver-stage',
  '/profile': '/profile',
  '/profile/me': '/profile/me',
  '/notifications': '/notifications',
  '/dashboard-recruteur': '/dashboard-recruteur',
  '/dashboard_recruteur.html': '/dashboard-recruteur',
  '/dashboard-recruteur/offres': '/dashboard-recruteur/offres',
  '/dashboard-recruteur/candidats': '/dashboard-recruteur/candidats',
  '/dashboard-recruteur/rapports-ia': '/dashboard-recruteur/rapports-ia',
  '/dashboard-recruteur/creer-offre': '/dashboard-recruteur/creer-offre',
  '/dashboard-administrateur': '/dashboard-administrateur',
  '/dashboard_administrateur.html': '/dashboard-administrateur',
  '/dashboard-administrateur/analytique-ia': '/dashboard-administrateur/analytique-ia',
  '/dashboard-administrateur/parametres': '/dashboard-administrateur/parametres',
  '/dashboard-administrateur/utilisateurs': '/dashboard-administrateur/utilisateurs',
  '/dashboard-administrateur/offres': '/dashboard-administrateur/offres',
  '/admin-utilisateurs': '/dashboard-administrateur/utilisateurs',
  '/admin_utilisateurs.html': '/dashboard-administrateur/utilisateurs',
  '/admin-offres': '/dashboard-administrateur/offres',
  '/admin_offres.html': '/dashboard-administrateur/offres',
  '/user-settings': '/user-settings',
  '/parametres': '/user-settings',
};

export function resolveAppRoute(href: string | null | undefined): string | null {
  if (!href || href === '#') {
    return null;
  }

  if (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  ) {
    return null;
  }

  try {
    const url = new URL(href, window.location.origin);
    return routeMap[url.pathname] ?? null;
  } catch {
    return routeMap[href] ?? null;
  }
}

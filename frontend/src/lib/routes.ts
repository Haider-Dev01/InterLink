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
  '/dashboard-candidat': '/dashboard-candidat',
  '/daboard_candidat.html': '/dashboard-candidat',
  '/dashboard-candidat/candidatures': '/dashboard-candidat/candidatures',
  '/dashboard-candidat/offres-sauvegardees': '/dashboard-candidat/offres-sauvegardees',
  '/dashboard-candidat/cv-nexus': '/dashboard-candidat/cv-nexus',
  '/dashboard-candidat/coaching-ia': '/dashboard-candidat/coaching-ia',
  '/dashboard-candidat/analyse-cv': '/dashboard-candidat/analyse-cv',
  '/dashboard-candidat/trouver-stage': '/dashboard-candidat/trouver-stage',
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

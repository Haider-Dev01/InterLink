import adminOffresHtml from '../../admin_offres.html?raw';
import adminUtilisateursHtml from '../../admin_utilisateurs.html?raw';
import analyseCvHtml from '../../analyse_cv.html?raw';
import assistantIaHtml from '../../assistant_ia.html?raw';
import dashboardCandidatHtml from '../../daboard_candidat.html?raw';
import dashboardAdministrateurHtml from '../../dashboard_administrateur.html?raw';
import dashboardRecruteurHtml from '../../dashboard_recruteur.html?raw';
import landingPageHtml from '../../landing_page.html?raw';
import loginHtml from '../../login.html?raw';
import registerHtml from '../../register.html?raw';

export {
  adminOffresHtml,
  adminUtilisateursHtml,
  analyseCvHtml,
  assistantIaHtml,
  dashboardAdministrateurHtml,
  dashboardCandidatHtml,
  dashboardRecruteurHtml,
  landingPageHtml,
  loginHtml,
  registerHtml,
};

export const userSettingsHtml = `<!DOCTYPE html>
<html class="light scroll-smooth" lang="fr">
<head>
  <meta charset="utf-8" />
  <meta content="width=device-width, initial-scale=1.0" name="viewport" />
  <title>Paramètres Utilisateur | InternLink</title>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f7f9fb; }
    .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
    .particle {
      position: fixed;
      pointer-events: none;
      opacity: 0.6;
      mix-blend-mode: multiply;
    }
    .card-hover-scale {
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .card-hover-scale:hover {
      transform: translateY(-6px) scale(1.01);
      box-shadow: 0 20px 40px rgba(0, 40, 142, 0.15);
    }
    .reveal-up { opacity: 0; transform: translateY(50px); }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #e0e3e5; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: #00288e; }
  </style>
</head>
<body class="text-on-surface antialiased overflow-x-hidden flex">
  <div id="p1-4" class="particle" style="width: 60px; height: 60px; background: radial-gradient(circle, rgba(70, 72, 212, 0.3) 0%, transparent 70%); border-radius: 50%; top: 15%; left: 10%; filter: blur(2px);"></div>
  <div id="p1-3" class="particle" style="width: 40px; height: 40px; background: radial-gradient(circle, rgba(0, 40, 142, 0.25) 0%, transparent 70%); border-radius: 50%; top: 35%; right: 15%; filter: blur(1.5px);"></div>
  <div id="p1-2" class="particle" style="width: 50px; height: 50px; background: radial-gradient(circle, rgba(70, 72, 212, 0.2) 0%, transparent 70%); border-radius: 50%; bottom: 20%; left: 8%; filter: blur(2px);"></div>
  <div id="p1-1" class="particle" style="width: 45px; height: 45px; background: radial-gradient(circle, rgba(0, 40, 142, 0.3) 0%, transparent 70%); border-radius: 50%; bottom: 15%; right: 12%; filter: blur(1.5px);"></div>

  <div class="fixed inset-0 opacity-[0.03] z-0 pointer-events-none" style="background-image: radial-gradient(#000000 1px, transparent 1px); background-size: 24px 24px;"></div>
  <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-secondary/5 to-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

  <aside class="w-60 h-screen bg-white/80 backdrop-blur-xl border-r border-surface-variant/50 flex flex-col p-4 gap-2 fixed left-0 top-0 z-50 transition-all">
    <div class="mb-6 px-2 pt-2">
      <a href="index.html" class="flex items-center gap-2 group mb-1">
        <span class="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform" data-icon="hub">hub</span>
        <span class="text-xl font-black text-primary tracking-tight">InternLink</span>
      </a>
      <p class="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.2em] mt-3 opacity-60">Paramètres Utilisateur</p>
    </div>

    <nav class="flex-1 flex flex-col gap-2 relative z-10">
      <a href="daboard_candidat.html" class="flex items-center gap-3 text-on-surface-variant px-4 py-3 hover:bg-surface-variant/40 hover:text-primary rounded-xl font-medium transition-all duration-200">
        <span class="material-symbols-outlined text-[20px]">dashboard</span>
        <span class="text-sm">Tableau de bord</span>
      </a>
      <a href="user-settings" class="flex items-center gap-3 bg-primary/10 text-primary rounded-xl px-4 py-3 font-bold transition-all duration-200">
        <span class="material-symbols-outlined text-[20px]">manage_accounts</span>
        <span class="text-sm">Préférences</span>
      </a>
      <a href="assistant_ia.html" class="flex items-center gap-3 text-on-surface-variant px-4 py-3 hover:bg-surface-variant/40 hover:text-primary rounded-xl font-medium transition-all duration-200">
        <span class="material-symbols-outlined text-[20px]">forum</span>
        <span class="text-sm">Assistant IA</span>
      </a>
      <a href="analyse_cv.html" class="flex items-center gap-3 text-on-surface-variant px-4 py-3 hover:bg-surface-variant/40 hover:text-primary rounded-xl font-medium transition-all duration-200">
        <span class="material-symbols-outlined text-[20px]">analytics</span>
        <span class="text-sm">Analyse CV</span>
      </a>
    </nav>

    <div class="mt-auto relative z-10 pt-4 border-t border-surface-variant/50">
      <button class="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl shadow-xl shadow-primary/30 hover:shadow-2xl hover:bg-primary-container hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
        <span class="material-symbols-outlined text-[18px]">save</span>
        <span>Enregistrer</span>
      </button>
    </div>
  </aside>

  <main class="flex-1 ml-60 min-h-screen relative z-10">
    <header class="h-20 px-8 sticky top-0 bg-white/80 backdrop-blur-xl border-b border-surface-variant/50 z-40 flex items-center justify-between transition-all duration-300">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-black text-on-surface hidden md:block">Paramètres de Thomas</h1>
      </div>

      <div class="flex items-center gap-6">
        <div class="hidden md:flex items-center gap-3 bg-white border border-surface-variant px-4 py-2 rounded-xl shadow-sm">
          <span class="material-symbols-outlined text-on-surface-variant text-[20px]">shield</span>
          <span class="text-sm font-medium text-on-surface-variant">Confidentialité Premium activée</span>
        </div>

        <div class="flex items-center gap-4 border-l border-surface-variant/50 pl-6">
          <button id="logout-button" class="relative w-10 h-10 bg-white border border-surface-variant rounded-full flex items-center justify-center text-on-surface-variant hover:text-red-600 hover:border-red-200 transition-colors shadow-sm" title="Déconnexion">
            <span class="material-symbols-outlined">logout</span>
          </button>
          <div class="text-right hidden lg:block">
            <p class="text-sm font-bold text-on-surface leading-none">Thomas Dubois</p>
            <p class="text-[10px] font-bold text-primary uppercase mt-1">Étudiant Master 2</p>
          </div>
          <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-surface-variant hover:border-primary transition-colors cursor-pointer shadow-sm">
            <img alt="Profil Étudiant" class="w-full h-full object-cover" src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80" />
          </div>
        </div>
      </div>
    </header>

    <div class="p-8 max-w-7xl mx-auto space-y-8">
      <div id="stat-cards" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card-hover-scale bg-white p-6 rounded-[2rem] border border-surface-variant shadow-sm">
          <div class="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
            <span class="material-symbols-outlined">verified_user</span>
          </div>
          <p class="text-sm font-bold text-on-surface-variant">Sécurité du compte</p>
          <h3 class="text-3xl font-black mt-1">98%</h3>
        </div>

        <div class="card-hover-scale bg-white p-6 rounded-[2rem] border border-surface-variant shadow-sm">
          <div class="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center mb-4">
            <span class="material-symbols-outlined">notifications_active</span>
          </div>
          <p class="text-sm font-bold text-on-surface-variant">Alertes personnalisées</p>
          <h3 class="text-3xl font-black mt-1">12</h3>
        </div>

        <div class="card-hover-scale bg-white p-6 rounded-[2rem] border border-surface-variant shadow-sm">
          <div class="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
            <span class="material-symbols-outlined">sync</span>
          </div>
          <p class="text-sm font-bold text-on-surface-variant">Synchronisations actives</p>
          <h3 class="text-3xl font-black mt-1">3</h3>
        </div>
      </div>

      <div id="main-content" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6 reveal-up">
          <div class="card-hover-scale bg-white border border-surface-variant rounded-[2rem] p-8 shadow-sm">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-2xl font-black text-on-surface">Profil</h2>
              <span class="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full">Nexus Sync</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label class="space-y-2 block">
                <span class="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-1">Prénom</span>
                <input value="Thomas" class="w-full px-4 py-3.5 bg-surface border border-surface-variant rounded-2xl outline-none font-medium" />
              </label>
              <label class="space-y-2 block">
                <span class="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-1">Nom</span>
                <input value="Dubois" class="w-full px-4 py-3.5 bg-surface border border-surface-variant rounded-2xl outline-none font-medium" />
              </label>
              <label class="space-y-2 block md:col-span-2">
                <span class="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-1">Email</span>
                <input value="thomas.d@email.com" class="w-full px-4 py-3.5 bg-surface border border-surface-variant rounded-2xl outline-none font-medium" />
              </label>
              <label class="space-y-2 block md:col-span-2">
                <span class="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-1">Titre du profil</span>
                <input value="Frontend Developer / UX-minded Student" class="w-full px-4 py-3.5 bg-surface border border-surface-variant rounded-2xl outline-none font-medium" />
              </label>
            </div>
          </div>

          <div class="card-hover-scale bg-white border border-surface-variant rounded-[2rem] p-8 shadow-sm">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-2xl font-black text-on-surface">Préférences de matching</h2>
              <span class="text-sm font-bold text-primary">92% de cohérence</span>
            </div>

            <div class="space-y-6">
              <div>
                <div class="flex justify-between text-xs font-bold mb-2">
                  <span class="text-on-surface-variant">Type de contrat préféré</span>
                  <span class="text-primary">Stage / Alternance</span>
                </div>
                <div class="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                  <div class="bg-gradient-to-r from-primary to-secondary h-full progress-bar-fill w-0" style="width: 92%"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs font-bold mb-2">
                  <span class="text-on-surface-variant">Télétravail</span>
                  <span class="text-secondary">Hybride</span>
                </div>
                <div class="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                  <div class="bg-gradient-to-r from-secondary to-primary h-full progress-bar-fill w-0" style="width: 78%"></div>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button class="py-3 bg-surface border border-surface-variant rounded-xl text-sm font-bold text-on-surface hover:bg-surface-variant/50 hover:text-primary transition-colors">React</button>
                <button class="py-3 bg-surface border border-surface-variant rounded-xl text-sm font-bold text-on-surface hover:bg-surface-variant/50 hover:text-primary transition-colors">Tailwind</button>
                <button class="py-3 bg-surface border border-surface-variant rounded-xl text-sm font-bold text-on-surface hover:bg-surface-variant/50 hover:text-primary transition-colors">TypeScript</button>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-6 reveal-up">
          <div class="card-hover-scale bg-gradient-to-br from-primary to-secondary rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
            <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            <div class="relative z-10">
              <h3 class="text-lg font-bold flex items-center gap-2 mb-1">
                <span class="material-symbols-outlined">auto_awesome</span> Recommandation IA
              </h3>
              <p class="text-xs text-white/80">Activez les alertes "Remote-first" pour augmenter votre visibilité.</p>
            </div>
          </div>

          <div class="card-hover-scale bg-white p-6 rounded-[2rem] border border-surface-variant shadow-sm">
            <h3 class="font-black text-on-surface mb-4">Notifications</h3>
            <div class="space-y-3">
              <label class="flex items-center justify-between p-4 bg-surface rounded-xl border border-surface-variant/50">
                <span class="text-sm font-bold">Nouveaux matchs IA</span>
                <input type="checkbox" checked class="w-5 h-5 rounded-lg text-primary focus:ring-primary" />
              </label>
              <label class="flex items-center justify-between p-4 bg-surface rounded-xl border border-surface-variant/50">
                <span class="text-sm font-bold">Invitations aux entretiens</span>
                <input type="checkbox" checked class="w-5 h-5 rounded-lg text-primary focus:ring-primary" />
              </label>
              <label class="flex items-center justify-between p-4 bg-surface rounded-xl border border-surface-variant/50">
                <span class="text-sm font-bold">Résumé hebdomadaire</span>
                <input type="checkbox" class="w-5 h-5 rounded-lg text-primary focus:ring-primary" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</body>
</html>`;

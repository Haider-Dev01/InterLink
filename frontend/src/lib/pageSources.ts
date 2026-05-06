import adminOffresHtml from '../templates/admin_offres.html?raw';
import adminUtilisateursHtml from '../templates/admin_utilisateurs.html?raw';
import analyseCvHtml from '../templates/analyse_cv.html?raw';
import assistantIaHtml from '../templates/assistant_ia.html?raw';
import dashboardCandidatHtml from '../templates/daboard_candidat.html?raw';
import dashboardAdministrateurHtml from '../templates/dashboard_administrateur.html?raw';
import dashboardRecruteurHtml from '../templates/dashboard_recruteur.html?raw';
import landingPageHtml from '../templates/landing_page.html?raw';
import registerHtml from '../templates/register.html?raw';

export const loginHtml = `
<!DOCTYPE html>
<html class="light scroll-smooth" lang="fr">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Connexion | InternLink Nexus</title>
    
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    
    <style>
        body { font-family: 'Inter', sans-serif; }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        
        @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .animated-bg {
            background: linear-gradient(-45deg, #f7f9fb, #e0e7ff, #f0f4ff, #ffffff);
            background-size: 400% 400%;
            animation: gradientBG 15s ease infinite;
        }

        .reveal-card { opacity: 1; }

        .glass-effect {
            background: rgba(255, 255, 255, 1);
            border: 1px solid rgba(255, 255, 255, 0.5);
        }
        .glass-effect:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }
    </style>

    <script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#00288e",
                        "secondary": "#4648d4",
                        "surface": "#f7f9fb",
                        "on-surface": "#191c1e",
                        "on-surface-variant": "#444653"
                    }
                }
            }
        }
    </script>
</head>
<body class="animated-bg min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

    <div class="particle" id="p1" style="width:12px;height:12px;background:#dde1ff;top:15%;left:8%;position:fixed;border-radius:50%;pointer-events:none;z-index:5;"></div>
    <div class="particle" id="p2" style="width:8px;height:8px;background:#e1e0ff;top:60%;left:92%;position:fixed;border-radius:50%;pointer-events:none;z-index:5;"></div>
    <div class="particle" id="p3" style="width:16px;height:16px;background:#6ffbbe;opacity:0.5;top:80%;left:20%;position:fixed;border-radius:50%;pointer-events:none;z-index:5;"></div>

    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>

    <div class="w-full max-w-[360px] z-10">
        
        <div class="text-center mb-8 reveal-card">
            <div class="flex items-center justify-center gap-3 mb-2">
                <span class="material-symbols-outlined text-primary text-4xl" data-icon="hub">hub</span>
                <span class="text-3xl font-black text-primary tracking-tight">InternLink</span>
            </div>
            <p class="text-on-surface-variant font-medium text-lg">Connectez-vous au futur du recrutement IA</p>
        </div>

        <div class="glass-effect rounded-[2.5rem] p-6 shadow-2xl shadow-primary/10 reveal-card">
            
            <div class="relative flex bg-surface p-1 rounded-2xl mb-8 user-type-toggle border border-surface-variant/50">
                <button id="tab-student" type="button" class="relative z-10 flex-1 flex items-center justify-center gap-1 py-3 text-[11px] font-bold text-primary transition-colors duration-300">
                    <span class="material-symbols-outlined text-[14px]">school</span>
                    Étudiant
                </button>
                <button id="tab-recruiter" type="button" class="relative z-10 flex-1 flex items-center justify-center gap-1 py-3 text-[11px] font-bold text-on-surface-variant transition-colors duration-300">
                    <span class="material-symbols-outlined text-[14px]">business_center</span>
                    Recruteur
                </button>
                <button id="tab-admin" type="button" class="relative z-10 flex-1 flex items-center justify-center gap-1 py-3 text-[11px] font-bold text-on-surface-variant transition-colors duration-300">
                    <span class="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                    Admin
                </button>
                <div id="user-slider" class="absolute top-1 left-1 w-[calc(33.33%-4px)] h-[calc(100%-8px)] bg-white rounded-xl shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"></div>
            </div>

            <form id="login-form" class="space-y-5">
                <div class="space-y-1.5">
                    <label class="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">RÔLE</label>
                    <div class="relative group">
                        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[18px]">person</span>
                        <select name="role" class="w-full appearance-none pl-11 pr-10 py-2.5 bg-white border border-surface-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-[13px] font-semibold shadow-sm">
                            <option value="candidate">Étudiant</option>
                            <option value="recruiter">Recruteur</option>
                            <option value="admin">Administrateur</option>
                        </select>
                        <span class="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">expand_more</span>
                    </div>
                </div>

                <div class="space-y-1.5">
                    <label class="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">ADRESSE EMAIL</label>
                    <div class="relative group">
                        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[18px]">mail</span>
                        <input type="email" name="email" placeholder="nom@exemple.com" class="w-full pl-11 pr-4 py-2.5 bg-white border border-surface-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-[13px] font-medium placeholder:text-on-surface-variant/40" required>
                    </div>
                </div>

                <div class="space-y-1.5">
                    <div class="flex justify-between items-center">
                        <label class="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant ml-1">MOT DE PASSE</label>
                        <a href="#" class="text-[10px] font-bold text-primary hover:underline">Oublié ?</a>
                    </div>
                    <div class="relative group">
                        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-[18px]">lock</span>
                        <input type="password" name="password" placeholder="••••••••" class="w-full pl-11 pr-4 py-2.5 bg-white border border-surface-variant rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-[13px] font-medium placeholder:text-on-surface-variant/40" required>
                        <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                            <span class="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                    </div>
                </div>

                <div class="flex items-center gap-2 ml-1 py-1">
                    <input type="checkbox" id="remember" class="w-4 h-4 border-surface-variant rounded text-primary focus:ring-primary">
                    <label for="remember" class="text-[12px] font-medium text-on-surface-variant select-none">Rester connecté</label>
                </div>

                <button type="submit" class="w-full bg-primary text-white font-black py-3 rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group">
                    <span class="text-sm">Accéder à InternLink</span>
                    <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
            </form>

            <div class="mt-8">
                <div class="relative flex items-center justify-center mb-6">
                    <div class="absolute w-full border-t border-surface-variant/50"></div>
                    <span class="relative bg-white px-3 text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60">OU CONTINUER AVEC</span>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <button type="button" class="flex items-center justify-center gap-2 py-2.5 bg-white border border-surface-variant rounded-2xl hover:bg-surface transition-all font-bold text-[12px] shadow-sm group">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-4 h-4 group-hover:scale-110 transition-transform" alt="Google">
                        <span>Google</span>
                    </button>
                    <button type="button" class="flex items-center justify-center gap-2 py-2.5 bg-white border border-surface-variant rounded-2xl hover:bg-surface transition-all font-bold text-[12px] shadow-sm group">
                        <img src="https://www.svgrepo.com/show/512317/github-142.svg" class="w-4 h-4 group-hover:scale-110 transition-transform" alt="Github">
                        <span>Github</span>
                    </button>
                </div>
            </div>
        </div>

        <p class="text-center mt-6">
            <span class="text-on-surface-variant font-medium text-[12px]">Pas encore de compte ?</span>
            <a href="/register" class="text-primary font-black text-[12px] hover:underline ml-1">Rejoignez-nous gratuitement</a>
        </p>
    </div>
</body>
</html>
`;

export {
  adminOffresHtml,
  adminUtilisateursHtml,
  analyseCvHtml,
  assistantIaHtml,
  dashboardAdministrateurHtml,
  dashboardCandidatHtml,
  dashboardRecruteurHtml,
  landingPageHtml,
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

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Logo from './Logo';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm sticky top-0 z-40" id="react-navbar">
      <nav className="flex justify-between items-center w-full px-6 h-16">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group" id="logo-link">
            <Logo size="md" />
          </Link>

          <div className="hidden md:flex gap-6 items-center">
            <Link className="text-blue-700 font-semibold text-sm tracking-tight" to="/">Accueil</Link>
            <Link className="text-slate-500 text-sm tracking-tight hover:bg-slate-100 transition-colors px-3 py-2 rounded-lg" to="/candidats">Candidats</Link>
            <Link className="text-slate-500 text-sm tracking-tight hover:bg-slate-100 transition-colors px-3 py-2 rounded-lg" to="/recruteurs">Recruteurs</Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link to="/register" className="text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-colors px-4 py-2 rounded-lg">Créer un compte</Link>
              <Link to="/login" className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">Se connecter</Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <button className="material-symbols-outlined text-slate-500 hover:bg-slate-100 p-2 rounded-full transition-colors">notifications</button>
              <div className="group relative">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-bold text-on-surface leading-none">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[10px] font-bold text-primary uppercase mt-1">{user?.role}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-outline-variant/30 hover:border-primary transition-colors shadow-sm">
                    <img 
                      alt="Profil" 
                      src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Simple Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-surface-variant opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <Link to={user?.role === 'admin' ? '/dashboard-administrateur' : user?.role === 'recruiter' ? '/dashboard-recruteur' : '/dashboard-candidat'} className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-variant/40 rounded-lg">
                      <span className="material-symbols-outlined text-[18px]">dashboard</span>
                      Tableau de bord
                    </Link>
                    <Link to="/parametres" className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-variant/40 rounded-lg">
                      <span className="material-symbols-outlined text-[18px]">settings</span>
                      Paramètres
                    </Link>
                    <hr className="my-2 border-surface-variant/50" />
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

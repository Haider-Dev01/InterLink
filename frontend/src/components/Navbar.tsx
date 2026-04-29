import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchService } from '../services/searchService';
import type { SearchCompany, SearchJob, SearchUser } from '../services/searchService';
import { useAuthStore } from '../store/authStore';
import Logo from './Logo';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [jobs, setJobs] = useState<SearchJob[]>([]);
  const [companies, setCompanies] = useState<SearchCompany[]>([]);

  const fullName = `${user?.firstName || user?.profile?.firstName || ''} ${user?.lastName || user?.profile?.lastName || ''}`.trim();
  const avatarSrc =
    user?.avatar
    || user?.profile?.avatar
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'Utilisateur')}&background=00288e&color=fff&rounded=true`;

  const hasResults = useMemo(
    () => users.length > 0 || jobs.length > 0 || companies.length > 0,
    [users.length, jobs.length, companies.length],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let isActive = true;

    if (debouncedQuery.length < 2) {
      setUsers([]);
      setJobs([]);
      setCompanies([]);
      setIsSearching(false);
      return () => {
        isActive = false;
      };
    }

    setIsSearching(true);

    searchService.search(debouncedQuery, 'all', 6)
      .then((response) => {
        if (!isActive) {
          return;
        }

        setUsers(response.data?.users ?? []);
        setJobs(response.data?.jobs ?? []);
        setCompanies(response.data?.companies ?? []);
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }
        console.error('Global search failed', error);
        setUsers([]);
        setJobs([]);
        setCompanies([]);
      })
      .finally(() => {
        if (isActive) {
          setIsSearching(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [debouncedQuery]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigateFromSearch = (path: string) => {
    setIsOpen(false);
    setSearchInput('');
    setDebouncedQuery('');
    setUsers([]);
    setJobs([]);
    setCompanies([]);
    navigate(path);
  };

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm sticky top-0 z-40" id="react-navbar">
      <nav className="flex justify-between items-center w-full px-6 h-16 gap-4">
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

        <div className="relative hidden lg:block w-full max-w-xl" ref={searchRef}>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
            <input
              className="w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
              onChange={(event) => setSearchInput(event.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder="Rechercher utilisateurs, entreprises, offres..."
              type="text"
              value={searchInput}
            />
          </div>

          {isOpen && (searchInput.trim().length >= 2 || hasResults || isSearching) ? (
            <div className="absolute left-0 right-0 mt-2 max-h-[26rem] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl z-50">
              {isSearching ? (
                <p className="px-4 py-3 text-sm text-slate-500">Recherche en cours...</p>
              ) : null}

              {!isSearching && !hasResults ? (
                <p className="px-4 py-3 text-sm text-slate-500">Aucun resultat trouve.</p>
              ) : null}

              {users.length ? (
                <div className="border-b border-slate-100">
                  <p className="px-4 pt-3 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Utilisateurs</p>
                  {users.map((searchUser) => (
                    <button
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50"
                      key={searchUser.id}
                      onClick={() => navigateFromSearch(`/profile/${searchUser.id}`)}
                      type="button"
                    >
                      {searchUser.profileImage ? (
                        <img alt={`${searchUser.firstName} ${searchUser.lastName}`.trim()} className="h-9 w-9 rounded-full object-cover" src={searchUser.profileImage} />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                          <span className="material-symbols-outlined text-[18px]">person</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {`${searchUser.firstName} ${searchUser.lastName}`.trim() || searchUser.email}
                        </p>
                        <p className="truncate text-xs text-slate-500">{searchUser.role} - {searchUser.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}

              {jobs.length ? (
                <div className="border-b border-slate-100">
                  <p className="px-4 pt-3 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Offres</p>
                  {jobs.map((job) => (
                    <button
                      className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-slate-50"
                      key={job.id}
                      onClick={() => navigateFromSearch(`/job/${job.id}`)}
                      type="button"
                    >
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <span className="material-symbols-outlined text-[18px]">work</span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{job.title}</p>
                        <p className="truncate text-xs text-slate-500">{job.company?.name || 'Entreprise'} - {job.location || 'Lieu non renseigne'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}

              {companies.length ? (
                <div>
                  <p className="px-4 pt-3 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Entreprises</p>
                  {companies.map((company) => (
                    <button
                      className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-slate-50"
                      key={company.id}
                      onClick={() => navigateFromSearch(`/company/${company.id}`)}
                      type="button"
                    >
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                        <span className="material-symbols-outlined text-[18px]">business</span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{company.name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {company.industry || 'Secteur non renseigne'}{company.isVerified ? ' - Verifiee' : ''}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link to="/register" className="text-slate-600 text-sm font-semibold hover:bg-slate-100 transition-colors px-4 py-2 rounded-lg">Creer un compte</Link>
              <Link to="/login" className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">Se connecter</Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <button className="material-symbols-outlined text-slate-500 hover:bg-slate-100 p-2 rounded-full transition-colors">notifications</button>
              <div className="group relative">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-bold text-on-surface leading-none">{fullName || 'Utilisateur'}</p>
                    <p className="text-[10px] font-bold text-primary uppercase mt-1">{user?.role}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-outline-variant/30 hover:border-primary transition-colors shadow-sm">
                    <img
                      alt="Profil"
                      src={avatarSrc}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-surface-variant opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <Link to={user?.role === 'admin' ? '/dashboard-administrateur' : user?.role === 'recruiter' ? '/dashboard-recruteur' : '/candidate/dashboard'} className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-variant/40 rounded-lg">
                      <span className="material-symbols-outlined text-[18px]">dashboard</span>
                      Tableau de bord
                    </Link>
                    <Link to="/parametres" className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-variant/40 rounded-lg">
                      <span className="material-symbols-outlined text-[18px]">settings</span>
                      Parametres
                    </Link>
                    <hr className="my-2 border-surface-variant/50" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Deconnexion
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

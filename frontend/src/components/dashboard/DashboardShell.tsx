import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

import type { ReactNode } from 'react';

import Logo from '../Logo';

type Tone = 'primary' | 'secondary' | 'red';

export type DashboardVariant = 'glass' | 'admin';

export type DashboardNavItem = {
  label: ReactNode;
  icon: ReactNode;
  to: string;
  badge?: ReactNode;
  badgeTone?: Tone;
};

export type DashboardProfile = {
  name: string;
  role: string;
  image: string;
};

export type DashboardAction = {
  icon: ReactNode;
  label: ReactNode;
  to: string;
};

export type DashboardShellProps = {
  variant?: DashboardVariant;
  sectionLabel?: ReactNode;
  navItems: DashboardNavItem[];
  title: ReactNode;
  subtitle?: ReactNode;
  searchPlaceholder?: string;
  profile?: DashboardProfile;
  onAvatarClick?: () => void;
  action?: DashboardAction;
  children: ReactNode;
};

function toneClasses(tone?: Tone) {
  switch (tone) {
    case 'secondary':
      return 'bg-secondary text-white';
    case 'red':
      return 'bg-red-100 text-red-600';
    default:
      return 'bg-primary text-white';
  }
}

function SidebarNavLink({ item, variant }: { item: DashboardNavItem; variant: DashboardVariant }) {
  const location = useLocation();
  const isActive = location.pathname === item.to;

  const baseClassName =
    variant === 'admin'
      ? 'nav-link flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all'
      : 'nav-link flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200';

  const activeClassName =
    variant === 'admin'
      ? 'bg-primary text-white font-bold shadow-md shadow-primary/20'
      : 'bg-primary/10 text-primary font-bold';

  const idleClassName =
    variant === 'admin'
      ? 'text-on-surface-variant hover:bg-primary/5 hover:text-primary'
      : 'text-on-surface-variant hover:bg-surface-variant/40 hover:text-primary font-medium';

  return (
    <Link className={`${baseClassName} ${isActive ? activeClassName : idleClassName}`} to={item.to}>
      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
      <span className="text-sm">{item.label}</span>
      {item.badge ? (
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : toneClasses(item.badgeTone)}`}
        >
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function DashboardBackdrop({ variant }: { variant: DashboardVariant }) {
  if (variant === 'admin') {
    return (
      <>
        <div className="page-particle particle" id="p1" style={{ width: 8, height: 8, background: '#00288e', opacity: 0.35, top: '12%', left: '18%' }} />
        <div className="page-particle particle" id="p2" style={{ width: 10, height: 10, background: '#4648d4', opacity: 0.28, top: '58%', left: '20%' }} />
        <div className="page-particle particle" id="p3" style={{ width: 12, height: 12, background: '#00288e', opacity: 0.22, top: '72%', left: '86%' }} />
        <div className="page-particle particle" id="p4" style={{ width: 6, height: 6, background: '#4648d4', opacity: 0.3, top: '30%', left: '85%' }} />
        <div
          className="fixed inset-0 opacity-[0.02] z-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
      </>
    );
  }

  return (
    <>
      <div
        className="page-particle particle"
        id="p1-4"
        style={{
          width: 60,
          height: 60,
          background: 'radial-gradient(circle, rgba(70, 72, 212, 0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          top: '15%',
          left: '10%',
          filter: 'blur(2px)',
        }}
      />
      <div
        className="page-particle particle"
        id="p1-3"
        style={{
          width: 40,
          height: 40,
          background: 'radial-gradient(circle, rgba(0, 40, 142, 0.25) 0%, transparent 70%)',
          borderRadius: '50%',
          top: '35%',
          right: '15%',
          filter: 'blur(1.5px)',
        }}
      />
      <div
        className="page-particle particle"
        id="p1-2"
        style={{
          width: 50,
          height: 50,
          background: 'radial-gradient(circle, rgba(70, 72, 212, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          bottom: '20%',
          left: '8%',
          filter: 'blur(2px)',
        }}
      />
      <div
        className="page-particle particle"
        id="p1-1"
        style={{
          width: 45,
          height: 45,
          background: 'radial-gradient(circle, rgba(0, 40, 142, 0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          bottom: '15%',
          right: '12%',
          filter: 'blur(1.5px)',
        }}
      />
      <div
        className="fixed inset-0 opacity-[0.03] z-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />
      <div className="fixed top-1/2 left-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-secondary/5 to-primary/5 blur-[120px] -z-10 pointer-events-none" />
    </>
  );
}

export function DashboardShell({
  variant = 'glass',
  sectionLabel,
  navItems,
  title,
  subtitle,
  searchPlaceholder,
  profile,
  onAvatarClick,
  action,
  children,
}: DashboardShellProps) {
  const isAdmin = variant === 'admin';

  return (
    <div className={`min-h-screen overflow-x-hidden ${isAdmin ? 'text-on-surface' : 'text-on-surface antialiased'}`}>
      <style>{`
        .particle { position: fixed; pointer-events: none; mix-blend-mode: multiply; }
        .card-hover-scale { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .card-hover-scale:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 20px 40px rgba(0, 40, 142, 0.15); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e0e3e5; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #00288e; }
      `}</style>

      <DashboardBackdrop variant={variant} />

      <aside
        className={
          isAdmin
            ? 'fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-surface-variant/50 bg-white'
            : 'fixed left-0 top-0 z-50 flex h-screen w-60 flex-col gap-2 border-r border-surface-variant/50 bg-white/80 p-4 backdrop-blur-xl transition-all'
        }
      >
        <div className={isAdmin ? 'p-6' : 'mb-6 px-2 pt-2'}>
          <Link className={isAdmin ? '' : 'mb-1 inline-flex'} to="/">
            <Logo animated size={isAdmin ? 'lg' : 'md'} />
          </Link>
          {sectionLabel ? (
            <p className={`${isAdmin ? 'mt-6 px-4' : 'mt-3'} text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60`}>
              {sectionLabel}
            </p>
          ) : null}
        </div>

        <nav className={isAdmin ? 'mt-4 flex-1 space-y-1 px-4' : 'relative z-10 flex flex-1 flex-col gap-2'}>
          {navItems.map((item) => (
            <SidebarNavLink item={item} key={item.to} variant={variant} />
          ))}
        </nav>

        {action ? (
          <div className={isAdmin ? 'p-4 pt-0' : 'relative z-10 mt-auto border-t border-surface-variant/50 pt-4'}>
            <Link
              className="interactive-scale flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-white shadow-xl shadow-primary/30 transition-all duration-300 hover:-translate-y-1 hover:bg-primary-container hover:shadow-2xl"
              to={action.to}
            >
              <span className="material-symbols-outlined text-[18px]">{action.icon}</span>
              <span>{action.label}</span>
            </Link>
          </div>
        ) : null}

        {isAdmin && profile ? (
          <div className="border-t border-surface-variant/50 p-4">
            <div className="flex cursor-pointer items-center gap-3 rounded-xl bg-surface p-3 transition-colors hover:bg-surface-variant/50" onClick={onAvatarClick}>
              <img alt={profile.name} className="h-10 w-10 rounded-full shadow-sm" src={profile.image} />
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-sm font-bold text-on-surface">{profile.name}</p>
                <p className="truncate text-[10px] font-medium uppercase tracking-wider text-primary">{profile.role}</p>
              </div>
              <span className="material-symbols-outlined text-sm text-on-surface-variant">unfold_more</span>
            </div>
          </div>
        ) : null}
      </aside>

      <main className={`relative z-10 min-h-screen flex-1 ${isAdmin ? 'ml-64 p-8' : 'ml-60'}`}>
        {isAdmin ? (
          <header className="mb-8 flex items-center justify-between" data-animate="hero">
            <div>
              <h1 className="text-2xl font-black text-on-surface">{title}</h1>
              {subtitle ? <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p> : null}
            </div>

            <div className="flex items-center gap-6">
              {searchPlaceholder ? (
                <div className="relative hidden md:block">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                  <input
                    className="w-72 rounded-xl border border-surface-variant bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder={searchPlaceholder}
                    type="text"
                  />
                </div>
              ) : null}

              <button className="interactive-scale relative flex h-10 w-10 items-center justify-center rounded-full border border-surface-variant bg-white text-on-surface-variant shadow-sm transition-colors hover:border-primary hover:text-primary">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
              </button>

              <button
                onClick={() => useAuthStore.getState().logout()}
                className="interactive-scale flex h-10 w-10 items-center justify-center rounded-full border border-surface-variant bg-white text-on-surface-variant shadow-sm transition-colors hover:border-red-200 hover:text-red-600"
                title="Déconnexion"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </div>
          </header>
        ) : (
          <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-surface-variant/50 bg-white/80 px-8 backdrop-blur-xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <h1 className="hidden text-xl font-black text-on-surface md:block" data-animate="hero">
                {title}
              </h1>
            </div>

            <div className="flex items-center gap-6">
              {searchPlaceholder ? (
                <div className="hidden items-center gap-3 rounded-xl border border-surface-variant bg-white px-4 py-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 md:flex">
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant">search</span>
                  <input
                    className="w-64 border-none bg-transparent text-sm font-medium outline-none placeholder:text-on-surface-variant/60 focus:ring-0"
                    placeholder={searchPlaceholder}
                    type="text"
                  />
                </div>
              ) : null}

              <div className="flex items-center gap-4 border-l border-surface-variant/50 pl-6">
                <button className="interactive-scale relative flex h-10 w-10 items-center justify-center rounded-full border border-surface-variant bg-white text-on-surface-variant shadow-sm transition-colors hover:border-primary hover:text-primary">
                  <span className="material-symbols-outlined">notifications</span>
                  <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 animate-pulse" />
                </button>

                <button
                  onClick={() => useAuthStore.getState().logout()}
                  className="interactive-scale flex h-10 w-10 items-center justify-center rounded-full border border-surface-variant bg-white text-on-surface-variant shadow-sm transition-colors hover:border-red-200 hover:text-red-600"
                  title="Déconnexion"
                >
                  <span className="material-symbols-outlined">logout</span>
                </button>

                {profile ? (
                  <>
                    <div className="hidden text-right lg:block">
                      <p className="leading-none text-sm font-bold text-on-surface">{profile.name}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase text-primary">{profile.role}</p>
                    </div>
                    <div 
                      className="h-10 w-10 overflow-hidden rounded-full border-2 border-surface-variant shadow-sm transition-colors hover:border-primary cursor-pointer"
                      onClick={onAvatarClick}
                    >
                      <img alt={profile.name} className="h-full w-full object-cover" src={profile.image} />
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </header>
        )}

        <div className={isAdmin ? 'space-y-8' : 'mx-auto max-w-7xl space-y-8 p-8'}>{children}</div>
      </main>
    </div>
  );
}

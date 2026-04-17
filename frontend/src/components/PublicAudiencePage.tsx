import { Link } from 'react-router-dom';

import type { ReactNode } from 'react';

import Logo from './Logo';
import { audienceTestimonials } from '../lib/data/dashboardData';

type CtaLink = { to: string; label: ReactNode };
type HighlightItem = { icon: ReactNode; label: string; value: ReactNode };
type PanelItem = { icon: ReactNode; title: string; body: ReactNode };

export function PublicAudiencePage({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  highlights,
  panels,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
  highlights: HighlightItem[];
  panels: PanelItem[];
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-surface text-on-surface">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="fixed left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-secondary/5 to-primary/5 blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/">
            <Logo animated size="md" />
          </Link>
          <div className="flex items-center gap-3">
            <Link className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100" to="/login">
              Connexion
            </Link>
            <Link className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800" to="/signup">
              S'inscrire
            </Link>
          </div>
        </div>
      </header>

      <section className="relative px-6 pb-24 pt-16">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div data-animate="hero">
            <p className="mb-5 text-[11px] font-black uppercase tracking-[0.28em] text-primary">{eyebrow}</p>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.05] text-slate-900 md:text-6xl">{title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{subtitle}</p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link className="rounded-2xl bg-primary px-8 py-4 font-bold text-white shadow-xl shadow-primary/20 transition-transform hover:scale-[1.02]" to={primaryCta.to}>
                {primaryCta.label}
              </Link>
              <Link className="rounded-2xl border border-surface-variant bg-white px-8 py-4 font-bold text-on-surface transition-colors hover:border-primary hover:text-primary" to={secondaryCta.to}>
                {secondaryCta.label}
              </Link>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {highlights.map((item) => (
                <div className="rounded-[1.75rem] border border-surface-variant bg-white/90 p-5 shadow-sm" data-animate="card" key={item.label}>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <p className="text-sm font-bold text-on-surface-variant">{item.label}</p>
                  <h3 className="mt-1 text-2xl font-black text-on-surface">{item.value}</h3>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            {panels.map((panel, index) => (
              <div
                className={`rounded-[2rem] border border-white/30 p-7 text-white shadow-xl ${index === 0 ? 'bg-gradient-to-br from-primary to-secondary' : 'bg-slate-900/90'}`}
                data-animate="card"
                key={panel.title}
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                  <span className="material-symbols-outlined">{panel.icon}</span>
                </div>
                <h3 className="text-2xl font-black">{panel.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/80">{panel.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white/70 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center" data-animate="hero">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-primary">Social Proof</p>
            <h2 className="mt-4 text-4xl font-black text-on-surface">Ils avancent plus vite avec InternLink</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {audienceTestimonials.map((item) => (
              <div className="rounded-[2rem] border border-surface-variant bg-white p-7 shadow-sm" data-animate="card" key={item.name}>
                <div className="mb-5 flex items-center gap-4">
                  <img alt={item.name} className="h-14 w-14 rounded-2xl object-cover" src={item.avatar} />
                  <div>
                    <h3 className="font-black text-on-surface">{item.name}</h3>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{item.role}</p>
                  </div>
                </div>
                <p className="text-sm leading-7 text-on-surface-variant">{item.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

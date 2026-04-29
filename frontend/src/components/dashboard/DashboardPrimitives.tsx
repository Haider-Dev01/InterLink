import type { HTMLAttributes, ReactNode } from 'react';

type Tone = string;

export function SurfaceCard({ className = '', children, ...props }: { className?: string; children?: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card-hover-scale rounded-[2rem] border border-surface-variant bg-white shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}

function toneMap(tone: Tone) {
  switch (tone) {
    case 'secondary':
      return 'bg-secondary/10 text-secondary';
    case 'emerald':
      return 'bg-emerald-50 text-emerald-600';
    case 'amber':
      return 'bg-amber-50 text-amber-600';
    case 'red':
      return 'bg-red-50 text-red-600';
    default:
      return 'bg-primary/10 text-primary';
  }
}

export function KpiCard({ icon, label, value, trend, tone = 'primary' }: { icon: ReactNode; label: ReactNode; value: ReactNode; trend?: ReactNode; tone?: Tone }) {
  return (
    <SurfaceCard className="p-6" data-animate="card">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${toneMap(tone)}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="text-sm font-bold text-on-surface-variant">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <h3 className="text-3xl font-black text-on-surface">{value}</h3>
        {trend ? <span className="rounded-full bg-surface px-3 py-1 text-xs font-black uppercase tracking-widest text-primary">{trend}</span> : null}
      </div>
    </SurfaceCard>
  );
}

export function SectionTitle({ eyebrow, title, subtitle }: { eyebrow?: ReactNode; title: ReactNode; subtitle?: ReactNode }) {
  return (
    <div data-animate="hero">
      {eyebrow ? <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-on-surface-variant/60">{eyebrow}</p> : null}
      <h2 className="text-2xl font-black text-on-surface">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm text-on-surface-variant">{subtitle}</p> : null}
    </div>
  );
}

export function ProgressMetric({
  label,
  value,
  tone = 'from-primary to-secondary',
  inverted = false,
  animated = false,
}: {
  label: ReactNode;
  value: number;
  tone?: string;
  inverted?: boolean;
  animated?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold">
        <span className={inverted ? 'text-white' : 'text-on-surface-variant'}>{label}</span>
        <span className={inverted ? 'text-white/80' : 'text-primary'}>{value}%</span>
      </div>
      <div className={inverted ? 'h-2.5 overflow-hidden rounded-full bg-white/20' : 'h-2 overflow-hidden rounded-full bg-surface-variant'}>
        <div
          className={`progress-bar-fill-react h-full bg-gradient-to-r ${tone}${animated ? ' progress-bar-shimmer progress-bar-glow' : ''}`}
          data-width={value}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

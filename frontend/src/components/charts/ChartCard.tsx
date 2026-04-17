import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { ReactNode } from 'react';

import { SurfaceCard } from '../dashboard/DashboardPrimitives';

const PIE_COLORS = ['#00288e', '#4648d4', '#7c83ff', '#9aa4ff', '#c6cbff'];

function TooltipContent(props: any) {
  const { active, payload, label } = props ?? {};

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-surface-variant bg-white px-4 py-3 shadow-xl">
      {label ? <p className="mb-2 text-xs font-black uppercase tracking-widest text-on-surface-variant">{label}</p> : null}
      <div className="space-y-1">
        {payload.map((entry: any) => (
          <div className="flex items-center justify-between gap-5 text-sm" key={String(entry.dataKey ?? entry.name ?? entry.value)}>
            <span className="font-bold text-on-surface-variant">{entry.name ?? entry.dataKey}</span>
            <span className="font-black text-on-surface">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartCard({ title, subtitle, children, height = 280 }: { title: ReactNode; subtitle?: ReactNode; children: ReactNode; height?: number }) {
  return (
    <SurfaceCard className="p-6" data-animate="card">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-on-surface">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p> : null}
        </div>
      </div>
      <div style={{ height }}>{children}</div>
    </SurfaceCard>
  );
}

export function ApplicationsAreaChart({ data, firstKey = 'applications', secondKey = 'matches' }: { data: Array<Record<string, unknown>>; firstKey?: string; secondKey?: string }) {
  return (
    <ResponsiveContainer height="100%" width="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="applicationsGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#00288e" stopOpacity={0.38} />
            <stop offset="95%" stopColor="#00288e" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="matchesGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="#4648d4" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#4648d4" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#e0e3e5" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#444653', fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: '#444653', fontSize: 12 }} tickLine={false} axisLine={false} />
        <Tooltip content={<TooltipContent />} />
        <Area dataKey={firstKey} fill="url(#applicationsGradient)" name="Applications" stroke="#00288e" strokeWidth={3} type="monotone" />
        <Area dataKey={secondKey} fill="url(#matchesGradient)" name="Matches" stroke="#4648d4" strokeWidth={3} type="monotone" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ActivityBarChart({ data, keys, colors }: { data: Array<Record<string, unknown>>; keys: Array<{ dataKey: string; name: string }>; colors: string[] }) {
  return (
    <ResponsiveContainer height="100%" width="100%">
      <BarChart barGap={10} data={data}>
        <CartesianGrid stroke="#e0e3e5" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: '#444653', fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: '#444653', fontSize: 12 }} tickLine={false} axisLine={false} />
        <Tooltip content={<TooltipContent />} />
        {keys.map((key, index) => (
          <Bar dataKey={key.dataKey} fill={colors[index]} key={key.dataKey} name={key.name} radius={[10, 10, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DistributionPieChart({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <ResponsiveContainer height="100%" width="100%">
      <PieChart>
        <Tooltip content={<TooltipContent />} />
        <Pie cx="50%" cy="50%" data={data} dataKey="value" innerRadius={70} outerRadius={100} paddingAngle={4}>
          {data.map((entry, index) => (
            <Cell fill={PIE_COLORS[index % PIE_COLORS.length]} key={`${entry.name}-${entry.value}`} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

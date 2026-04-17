import type { ChangeEventHandler, ReactNode } from 'react';

export function Field({ label, placeholder = '', value, onChange, type = 'text' }: { label: ReactNode; placeholder?: string; value: string; onChange: ChangeEventHandler<HTMLInputElement>; type?: string }) {
  return (
    <label className="block space-y-2">
      <span className="ml-1 text-xs font-black uppercase tracking-widest text-on-surface-variant">{label}</span>
      <input
        className="w-full rounded-2xl border border-surface-variant bg-surface px-4 py-3.5 font-medium outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

export function SelectField({ label, value, onChange, options }: { label: ReactNode; value: string; onChange: ChangeEventHandler<HTMLSelectElement>; options: string[] }) {
  return (
    <label className="block space-y-2">
      <span className="ml-1 text-xs font-black uppercase tracking-widest text-on-surface-variant">{label}</span>
      <select
        className="w-full rounded-2xl border border-surface-variant bg-surface px-4 py-3.5 font-medium outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
        onChange={onChange}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TextareaField({ label, placeholder = '', value, onChange, rows = 5 }: { label: ReactNode; placeholder?: string; value: string; onChange: ChangeEventHandler<HTMLTextAreaElement>; rows?: number }) {
  return (
    <label className="block space-y-2">
      <span className="ml-1 text-xs font-black uppercase tracking-widest text-on-surface-variant">{label}</span>
      <textarea
        className="w-full rounded-2xl border border-surface-variant bg-surface px-4 py-3.5 font-medium outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        value={value}
      />
    </label>
  );
}

export function ChipGroup({ label, options, value, onChange }: { label: ReactNode; options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-3">
      <span className="ml-1 block text-xs font-black uppercase tracking-widest text-on-surface-variant">{label}</span>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const active = value === option;

          return (
            <button
              className={`interactive-scale rounded-xl border px-4 py-3 text-sm font-bold transition-all ${
                active
                  ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                  : 'border-surface-variant bg-surface text-on-surface hover:bg-surface-variant/50 hover:text-primary'
              }`}
              key={option}
              onClick={() => onChange(option)}
              type="button"
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

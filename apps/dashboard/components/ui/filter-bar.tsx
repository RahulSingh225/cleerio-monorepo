import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value?: string;
  onChange?: (value: string) => void;
}

export function FilterDropdown({ label, options, value, onChange }: FilterDropdownProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="appearance-none bg-white border border-[var(--border)] rounded-lg px-3 py-2 pr-8 text-sm font-medium text-[var(--text-primary)] cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)] transition-colors"
      >
        <option value="">{label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)] pointer-events-none" />
    </div>
  );
}

interface FilterBarProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function FilterBar({ children, actions }: FilterBarProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-2 flex-wrap">{children}</div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

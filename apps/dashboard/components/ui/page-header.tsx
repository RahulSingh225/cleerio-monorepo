import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  tabs?: { label: string; active?: boolean; onClick?: () => void }[];
}

export function PageHeader({ title, subtitle, actions, tabs }: PageHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-[var(--text-secondary)] mt-1">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
      {tabs && (
        <div className="flex items-center gap-1 border-b border-[var(--border)]">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={tab.onClick}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab.active
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

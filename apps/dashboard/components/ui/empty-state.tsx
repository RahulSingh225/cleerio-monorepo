'use client';

import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
      <div className="w-14 h-14 rounded-full bg-[var(--surface-secondary)] flex items-center justify-center text-[var(--text-tertiary)]">
        {icon}
      </div>
      <div className="space-y-1.5">
        <h4 className="text-base font-semibold text-[var(--text-primary)]">{title}</h4>
        <p className="text-sm text-[var(--text-secondary)] max-w-xs mx-auto">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

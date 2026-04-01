import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'critical' | 'info' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-gray-50 text-gray-600 border-gray-200',
};

const dotColors: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  critical: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-gray-400',
};

export function StatusBadge({ label, variant = 'neutral', dot = false }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${variantStyles[variant]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {label}
    </span>
  );
}

export function DpdBadge({ days }: { days: number }) {
  let variant: BadgeVariant = 'success';
  if (days > 60) variant = 'critical';
  else if (days > 30) variant = 'warning';
  else if (days > 0) variant = 'info';

  return (
    <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded ${
      variant === 'critical' ? 'bg-red-100 text-red-700' :
      variant === 'warning' ? 'bg-amber-100 text-amber-700' :
      variant === 'info' ? 'bg-blue-100 text-blue-700' :
      'bg-emerald-100 text-emerald-700'
    }`}>
      {days} Days
    </span>
  );
}

export function RiskBadge({ score }: { score: number }) {
  let color = 'bg-blue-500';
  if (score >= 80) color = 'bg-red-500';
  else if (score >= 50) color = 'bg-amber-500';
  else if (score >= 20) color = 'bg-blue-500';
  else color = 'bg-emerald-500';

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-[var(--text-primary)]">{score}</span>
    </div>
  );
}

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: { value: string; direction: 'up' | 'down' };
  iconBgColor?: string;
}

export function MetricCard({ icon, label, value, trend, iconBgColor = 'bg-blue-50 text-blue-600' }: MetricCardProps) {
  return (
    <div className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgColor}`}>
          {icon}
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend.direction === 'up' 
              ? 'text-emerald-700 bg-emerald-50' 
              : 'text-red-700 bg-red-50'
          }`}>
            {trend.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}

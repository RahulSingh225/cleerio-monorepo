'use client';

import React from 'react';
import { Hash, Sigma, TrendingUp, Layers, BarChart3 } from 'lucide-react';

interface KpiStripProps {
  results: any[];
  totalCount: number;
  isGrouped: boolean;
}

export function KpiStrip({ results, totalCount, isGrouped }: KpiStripProps) {
  if (results.length === 0) return null;

  const kpis = isGrouped
    ? computeGroupedKpis(results)
    : computeDynamicKpis(results, totalCount);

  if (kpis.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 px-5 animate-fade-in">
      {kpis.map((kpi, i) => (
        <div key={i} className="relative overflow-hidden rounded-xl border border-gray-100 bg-white p-4 hover:shadow-md transition-all group">
          <div className={`absolute top-0 left-0 right-0 h-0.5 ${kpi.gradient}`} />
          <div className="flex items-start justify-between mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.iconBg}`}>
              {kpi.icon}
            </div>
          </div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">{kpi.label}</p>
          <p className="text-xl font-bold text-gray-900 tracking-tight mt-0.5">{kpi.value}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Dynamically compute KPIs by scanning the actual result columns.
 * No hardcoded field assumptions — works with whatever columns the query returns.
 */
function computeDynamicKpis(results: any[], totalCount: number) {
  const kpis: KpiItem[] = [];
  if (results.length === 0) return kpis;

  const sampleRow = results[0];
  const columns = Object.keys(sampleRow);

  // Always show total count
  kpis.push({
    label: 'Total Records',
    value: totalCount.toLocaleString(),
    icon: <Hash className="w-4 h-4 text-blue-600" />,
    iconBg: 'bg-blue-50',
    gradient: 'bg-gradient-to-r from-blue-500 to-indigo-500',
  });

  // Find numeric columns and compute aggregates dynamically
  const numericCols = columns.filter(col => {
    if (col === 'id') return false;
    const sample = results.find(r => r[col] != null)?.[col];
    return sample != null && !isNaN(parseFloat(String(sample)));
  });

  const gradients = [
    { gradient: 'bg-gradient-to-r from-emerald-500 to-teal-500', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { gradient: 'bg-gradient-to-r from-amber-500 to-orange-500', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
    { gradient: 'bg-gradient-to-r from-violet-500 to-purple-500', iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
    { gradient: 'bg-gradient-to-r from-cyan-500 to-blue-500', iconBg: 'bg-cyan-50', iconColor: 'text-cyan-600' },
  ];

  // Show sum for up to 2 numeric columns, avg for up to 2 more
  const sumCols = numericCols.slice(0, 2);
  const avgCols = numericCols.slice(2, 4);

  sumCols.forEach((col, i) => {
    const total = results.reduce((sum, r) => sum + (parseFloat(r[col]) || 0), 0);
    const style = gradients[i % gradients.length];
    kpis.push({
      label: `Total ${formatColName(col)}`,
      value: formatCompact(total),
      icon: <Sigma className={`w-4 h-4 ${style.iconColor}`} />,
      iconBg: style.iconBg,
      gradient: style.gradient,
    });
  });

  avgCols.forEach((col, i) => {
    const total = results.reduce((sum, r) => sum + (parseFloat(r[col]) || 0), 0);
    const avg = results.length > 0 ? total / results.length : 0;
    const style = gradients[(i + 2) % gradients.length];
    kpis.push({
      label: `Avg ${formatColName(col)}`,
      value: formatCompact(avg),
      icon: <TrendingUp className={`w-4 h-4 ${style.iconColor}`} />,
      iconBg: style.iconBg,
      gradient: style.gradient,
    });
  });

  return kpis.slice(0, 5);
}

function computeGroupedKpis(results: any[]) {
  const kpis: KpiItem[] = [];
  const totalGroups = results.length;
  const totalRecords = results.reduce((sum, r) => sum + (parseInt(r.recordCount) || 0), 0);
  const topGroup = results.length > 0 ? results[0] : null;

  kpis.push({
    label: 'Groups',
    value: totalGroups.toLocaleString(),
    icon: <Layers className="w-4 h-4 text-blue-600" />,
    iconBg: 'bg-blue-50',
    gradient: 'bg-gradient-to-r from-blue-500 to-indigo-500',
  });

  kpis.push({
    label: 'Total Records',
    value: totalRecords.toLocaleString(),
    icon: <Hash className="w-4 h-4 text-emerald-600" />,
    iconBg: 'bg-emerald-50',
    gradient: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  });

  if (topGroup) {
    kpis.push({
      label: 'Top Group',
      value: String(topGroup.groupKey || '—'),
      icon: <TrendingUp className="w-4 h-4 text-amber-600" />,
      iconBg: 'bg-amber-50',
      gradient: 'bg-gradient-to-r from-amber-500 to-orange-500',
    });
  }

  kpis.push({
    label: 'Avg per Group',
    value: totalGroups > 0 ? Math.round(totalRecords / totalGroups).toLocaleString() : '0',
    icon: <BarChart3 className="w-4 h-4 text-violet-600" />,
    iconBg: 'bg-violet-50',
    gradient: 'bg-gradient-to-r from-violet-500 to-purple-500',
  });

  // Add KPIs for any additional aggregation columns
  const aggCols = Object.keys(results[0] || {}).filter(k => !['groupKey', 'recordCount'].includes(k));
  aggCols.forEach((col) => {
    const total = results.reduce((sum, r) => sum + (parseFloat(r[col]) || 0), 0);
    kpis.push({
      label: `Total ${formatColName(col)}`,
      value: formatCompact(total),
      icon: <Sigma className="w-4 h-4 text-cyan-600" />,
      iconBg: 'bg-cyan-50',
      gradient: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    });
  });

  return kpis.slice(0, 5);
}

// ── Helpers ──

interface KpiItem {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  gradient: string;
}

function formatColName(col: string): string {
  return col
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .replace(/_/g, ' ')
    .trim();
}

function formatCompact(num: number): string {
  if (Math.abs(num) >= 10_000_000) return `${(num / 10_000_000).toFixed(1)}Cr`;
  if (Math.abs(num) >= 100_000) return `${(num / 100_000).toFixed(1)}L`;
  if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

'use client';

import React, { useState } from 'react';
import { BarChart3, PieChart } from 'lucide-react';

interface ChartPanelProps {
  results: any[];
  groupBy: string;
}

const COLORS = [
  '#2D5BFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#EC4899', '#14B8A6', '#F97316', '#6366F1',
  '#84CC16', '#E11D48', '#0EA5E9', '#D946EF', '#22D3EE',
];

export function ChartPanel({ results, groupBy }: ChartPanelProps) {
  const [chartType, setChartType] = useState<'bar' | 'donut'>('bar');

  if (results.length === 0 || !groupBy) {
    return (
      <div className="px-5">
        <div className="card p-12 flex flex-col items-center justify-center text-center">
          <BarChart3 className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-500">Enable Group By to see charts</p>
          <p className="text-xs text-gray-400 mt-1">Select a grouping field from the sidebar to visualize your data.</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...results.map(r => parseInt(r.recordCount) || 0));
  const totalRecords = results.reduce((sum, r) => sum + (parseInt(r.recordCount) || 0), 0);

  return (
    <div className="px-5 space-y-4 animate-fade-in">
      {/* Chart type toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700">
          Distribution by <span className="text-[var(--primary)]">{groupBy.replace('dynamic.', '')}</span>
        </h3>
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setChartType('bar')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
              chartType === 'bar' ? 'bg-white text-[var(--primary)] shadow-sm' : 'text-gray-500'
            }`}>
            <BarChart3 className="w-3 h-3" /> Bar
          </button>
          <button onClick={() => setChartType('donut')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
              chartType === 'donut' ? 'bg-white text-[var(--primary)] shadow-sm' : 'text-gray-500'
            }`}>
            <PieChart className="w-3 h-3" /> Donut
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart */}
        <div className="card p-5 overflow-hidden">
          {chartType === 'bar' ? (
            <BarChartView results={results} maxCount={maxCount} />
          ) : (
            <DonutChartView results={results} totalRecords={totalRecords} />
          )}
        </div>

        {/* Legend / Data table */}
        <div className="card p-4 overflow-hidden">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Breakdown</p>
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
            {results.slice(0, 20).map((r, i) => {
              const count = parseInt(r.recordCount) || 0;
              const pct = totalRecords > 0 ? ((count / totalRecords) * 100).toFixed(1) : '0';
              return (
                <div key={i} className="flex items-center gap-2 group hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs font-medium text-gray-700 flex-1 truncate">{r.groupKey || '(empty)'}</span>
                  <span className="text-xs font-bold text-gray-900 tabular-nums">{count.toLocaleString()}</span>
                  <span className="text-[10px] text-gray-400 w-10 text-right tabular-nums">{pct}%</span>
                </div>
              );
            })}
            {results.length > 20 && (
              <p className="text-[10px] text-gray-400 text-center pt-1">+{results.length - 20} more groups</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Bar Chart (pure CSS) ──
function BarChartView({ results, maxCount }: { results: any[]; maxCount: number }) {
  return (
    <div className="space-y-2">
      {results.slice(0, 15).map((r, i) => {
        const count = parseInt(r.recordCount) || 0;
        const width = maxCount > 0 ? (count / maxCount) * 100 : 0;
        return (
          <div key={i} className="group">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-medium text-gray-600 truncate max-w-[60%]">{r.groupKey || '(empty)'}</span>
              <span className="text-[11px] font-bold text-gray-900 tabular-nums">{count.toLocaleString()}</span>
            </div>
            <div className="w-full h-6 bg-gray-50 rounded-md overflow-hidden">
              <div
                className="h-full rounded-md transition-all duration-700 ease-out group-hover:opacity-90"
                style={{
                  width: `${width}%`,
                  background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}DD, ${COLORS[i % COLORS.length]}88)`,
                }}
              />
            </div>
          </div>
        );
      })}
      {results.length > 15 && (
        <p className="text-[10px] text-gray-400 text-center pt-1">Showing top 15 of {results.length} groups</p>
      )}
    </div>
  );
}

// ── Donut Chart (SVG) ──
function DonutChartView({ results, totalRecords }: { results: any[]; totalRecords: number }) {
  const radius = 80;
  const stroke = 28;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  const slices = results.slice(0, 10).map((r, i) => {
    const count = parseInt(r.recordCount) || 0;
    const pct = totalRecords > 0 ? count / totalRecords : 0;
    const dashLength = pct * circumference;
    const offset = cumulativeOffset;
    cumulativeOffset += dashLength;
    return {
      dashLength,
      dashOffset: circumference - offset,
      color: COLORS[i % COLORS.length],
      label: r.groupKey || '(empty)',
      count,
      pct: (pct * 100).toFixed(1),
    };
  });

  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Background ring */}
          <circle cx="100" cy="100" r={radius} fill="none" stroke="#F3F4F6" strokeWidth={stroke} />
          {/* Data slices */}
          {slices.map((slice, i) => (
            <circle
              key={i}
              cx="100" cy="100" r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={stroke}
              strokeDasharray={`${slice.dashLength} ${circumference - slice.dashLength}`}
              strokeDashoffset={slice.dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
              className="transition-all duration-700"
              style={{ opacity: 0.85 }}
            />
          ))}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 tracking-tight">{totalRecords.toLocaleString()}</span>
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Total</span>
        </div>
      </div>
    </div>
  );
}

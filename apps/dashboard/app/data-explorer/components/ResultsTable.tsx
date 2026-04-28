'use client';

import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, TableProperties, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface ResultsTableProps {
  results: any[];
  columns: string[];
  totalCount: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSort: (field: string) => void;
  onPageChange: (page: number) => void;
}

export function ResultsTable({
  results, columns, totalCount, page, pageSize,
  isLoading, sortBy, sortDir, onSort, onPageChange,
}: ResultsTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (isLoading) {
    return (
      <div className="mx-5 card p-16 flex flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-[var(--primary)] animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-500 mt-2">Running query...</p>
        <p className="text-xs text-gray-400">Analyzing your portfolio data</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="mx-5 card p-16 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-2">
          <TableProperties className="w-8 h-8 text-gray-300" />
        </div>
        <h4 className="text-base font-bold text-gray-700">No Results Yet</h4>
        <p className="text-sm text-gray-400 max-w-sm">
          Build your query using the filter panel on the left, then click <strong>Run Query</strong> to explore your data.
        </p>
      </div>
    );
  }

  // Format column header
  const formatHeader = (col: string) => {
    return col
      .replace('dynamic.', '📋 ')
      .replace('comm.', '📨 ')
      .replace('repayment.', '💰 ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, s => s.toUpperCase())
      .trim();
  };

  return (
    <div className="mx-5 card overflow-hidden animate-fade-in">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
              {columns.map((col) => (
                <th key={col}
                  onClick={() => onSort(col)}
                  className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-gray-600 hover:bg-gray-100/50 transition-colors select-none group">
                  <div className="flex items-center gap-1">
                    {formatHeader(col)}
                    {sortBy === col ? (
                      sortDir === 'asc'
                        ? <ArrowUp className="w-3 h-3 text-[var(--primary)]" />
                        : <ArrowDown className="w-3 h-3 text-[var(--primary)]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {results.map((row, i) => (
              <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                {columns.map((col) => (
                  <td key={col} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap max-w-[220px] truncate">
                    {row[col] != null ? (
                      formatCell(col, row[col])
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
        <p className="text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-700">{((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, totalCount)}</span> of{' '}
          <span className="font-semibold text-gray-700">{totalCount.toLocaleString()}</span> records
        </p>

        <div className="flex items-center gap-1">
          <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
          </button>

          {/* Page numbers */}
          {generatePageNumbers(page, totalPages).map((p, i) => (
            p === '...' ? (
              <span key={`dots-${i}`} className="px-1 text-xs text-gray-400">...</span>
            ) : (
              <button key={p} onClick={() => onPageChange(p as number)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  p === page
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}>
                {p}
              </button>
            )
          ))}

          <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──

function formatCell(col: string, value: any): React.ReactNode {
  const str = String(value);

  // Numeric columns — format with commas
  if (['outstanding', 'emiAmount', 'loanAmount', 'totalRepaid', 'recordCount', 'amount'].some(k => col.includes(k))) {
    const num = parseFloat(str);
    if (!isNaN(num)) {
      return <span className="font-mono tabular-nums">{num.toLocaleString('en-IN')}</span>;
    }
  }

  // DPD — color code
  if (col === 'currentDpd' || col === 'groupKey') {
    const num = parseInt(str);
    if (col === 'currentDpd' && !isNaN(num)) {
      const color = num > 90 ? 'text-red-600 bg-red-50' : num > 30 ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50';
      return <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${color}`}>{num}</span>;
    }
  }

  // Status / delivery fields — badge
  if (col.includes('Status') || col.includes('status') || col === 'comm.deliveryStatus') {
    const statusColor = getStatusColor(str.toLowerCase());
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>{str}</span>;
  }

  return str;
}

function getStatusColor(status: string): string {
  if (['delivered', 'sent', 'read', 'success'].includes(status)) return 'bg-emerald-50 text-emerald-700';
  if (['failed', 'error', 'rejected'].includes(status)) return 'bg-red-50 text-red-700';
  if (['pending', 'queued', 'processing'].includes(status)) return 'bg-amber-50 text-amber-700';
  return 'bg-gray-50 text-gray-700';
}

function generatePageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | string)[] = [1];
  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');
  pages.push(total);

  return pages;
}

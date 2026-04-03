'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Activity, Loader2, AlertTriangle } from 'lucide-react';

export default function BatchRunsPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState<string | null>(null);
  const [errors, setErrors] = useState<any[]>([]);

  useEffect(() => { fetchRuns(); }, []);

  const fetchRuns = async () => {
    try { const res = await api.get('/batch-runs'); setRuns(res.data.data || []); }
    catch (err) { console.error('Failed to fetch batch runs'); }
    finally { setIsLoading(false); }
  };

  const fetchErrors = async (id: string) => {
    setSelectedRun(id);
    try { const res = await api.get(`/batch-runs/${id}/errors`); setErrors(res.data.data || []); }
    catch (err) { setErrors([]); }
  };

  const statusVariant = (s: string) => {
    if (s === 'completed') return 'success';
    if (s === 'processing') return 'warning';
    if (s === 'failed') return 'critical';
    return 'neutral';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Batch Runs" subtitle="Monitor bulk processing operations." />

      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-secondary)]">
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Batch Type</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Progress</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Success / Failed</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Created</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {isLoading ? Array.from({ length: 3 }).map((_, i) => (
              <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-4 bg-[var(--surface-secondary)] rounded animate-pulse" /></td></tr>
            )) : runs.map((run) => {
              const total = run.totalRecords || 1;
              const processed = run.processedRecords || 0;
              const pct = Math.round((processed / total) * 100);
              return (
                <tr key={run.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-[var(--text-primary)]">{run.batchType || '—'}</td>
                  <td className="px-5 py-3"><StatusBadge label={run.status} variant={statusVariant(run.status)} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--primary)] rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-[var(--text-tertiary)]">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs text-emerald-600 font-medium">{run.succeededRecords || 0}</span>
                    <span className="text-xs text-[var(--text-tertiary)]"> / </span>
                    <span className="text-xs text-red-500 font-medium">{run.failedRecords || 0}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-[var(--text-tertiary)]">{run.createdAt ? new Date(run.createdAt).toLocaleString() : '—'}</td>
                  <td className="px-5 py-3">
                    {(run.failedRecords || 0) > 0 && (
                      <button onClick={() => fetchErrors(run.id)} className="text-xs text-orange-500 hover:text-orange-700 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Errors
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!isLoading && runs.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
            <Activity className="w-10 h-10 text-[var(--text-tertiary)]" />
            <h4 className="text-base font-semibold text-[var(--text-primary)]">No Batch Runs</h4>
            <p className="text-sm text-[var(--text-secondary)]">Batch operations will appear here once portfolios are processed.</p>
          </div>
        )}
      </div>

      {/* Errors panel */}
      {selectedRun && errors.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-red-500">Errors for batch {selectedRun.substring(0, 8)}...</h3>
            <button onClick={() => setSelectedRun(null)} className="text-xs text-[var(--text-tertiary)]">Close</button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {errors.map((err, i) => (
              <div key={i} className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs">
                <p className="font-medium text-red-700">Row {err.rowIndex}: {err.errorType}</p>
                <p className="text-red-500 mt-0.5">{err.errorMessage}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

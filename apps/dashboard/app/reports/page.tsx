'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { FileText, Plus, Download, Loader2, X } from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReport, setNewReport] = useState({ reportType: 'portfolio_summary', filters: {} as any });

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try { const res = await api.get('/report-jobs'); setReports(res.data.data || []); }
    catch (err) { console.error('Failed to fetch reports'); }
    finally { setIsLoading(false); }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/report-jobs', newReport);
      setShowModal(false);
      fetchReports();
    } catch (err) { alert('Failed to request report.'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Reports"
        subtitle="Generate and download analytics reports."
        actions={
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Request Report
          </button>
        }
      />

      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-secondary)]">
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Report Type</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Requested</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Completed</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {isLoading ? Array.from({ length: 3 }).map((_, i) => (
              <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="h-4 bg-[var(--surface-secondary)] rounded animate-pulse" /></td></tr>
            )) : reports.map((r) => (
              <tr key={r.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-[var(--text-primary)] capitalize">{r.reportType?.replace(/_/g, ' ')}</td>
                <td className="px-5 py-3">
                  <StatusBadge label={r.status} variant={r.status === 'completed' ? 'success' : r.status === 'failed' ? 'critical' : 'warning'} />
                </td>
                <td className="px-5 py-3 text-sm text-[var(--text-tertiary)]">{r.queuedAt ? new Date(r.queuedAt).toLocaleString() : '—'}</td>
                <td className="px-5 py-3 text-sm text-[var(--text-tertiary)]">{r.completedAt ? new Date(r.completedAt).toLocaleString() : '—'}</td>
                <td className="px-5 py-3">
                  {r.status === 'completed' && r.fileUrl && (
                    <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[var(--primary)] font-medium hover:underline">
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && reports.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
            <FileText className="w-10 h-10 text-[var(--text-tertiary)]" />
            <h4 className="text-base font-semibold text-[var(--text-primary)]">No Reports</h4>
            <p className="text-sm text-[var(--text-secondary)]">Request a report to get started.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[var(--border)] rounded-xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Request Report</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleRequest} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Report Type</label>
                <select value={newReport.reportType} onChange={(e) => setNewReport({...newReport, reportType: e.target.value})} className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]">
                  <option value="portfolio_summary">Portfolio Summary</option>
                  <option value="dpd_distribution">DPD Distribution</option>
                  <option value="communication_delivery">Communication Delivery</option>
                  <option value="collection_performance">Collection Performance</option>
                </select>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-[var(--primary)] text-white font-semibold py-2.5 rounded-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                {isSubmitting ? 'Requesting...' : 'Generate Report'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

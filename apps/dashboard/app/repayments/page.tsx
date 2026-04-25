'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { DragDropUpload } from '@/components/ui/drag-drop-upload';
import { EmptyState } from '@/components/ui/empty-state';
import { CreditCard, Loader2, Upload, Check, Clock, FileText } from 'lucide-react';

export default function RepaymentsPage() {
  const [syncs, setSyncs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => { fetchSyncs(); }, []);

  const fetchSyncs = async () => {
    try {
      const res = await api.get('/repayment-syncs');
      setSyncs(res.data.data || []);
    } catch (err) { console.error('Failed to load repayment syncs'); }
    finally { setIsLoading(false); }
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    await api.post('/repayment-syncs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Give the backend a small delay to create the sync record
    setTimeout(() => {
      fetchSyncs();
    }, 1000);
  };

  const totalUpdated = syncs.reduce((sum, s) => sum + (s.recordsUpdated || 0), 0);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Repayments"
        subtitle="Upload repayment data and track portfolio outstanding reductions."
        actions={
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" /> Upload Repayment
          </button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Total Syncs</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{syncs.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Records Updated</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{totalUpdated.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-bold text-[var(--primary)] mt-1">{syncs.filter(s => s.status === 'completed').length}</p>
        </div>
      </div>

      {/* Upload area */}
      {showUpload && (
        <div className="card p-6 animate-fade-in">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Upload Repayment File</h3>
          <DragDropUpload
            onUpload={handleUpload}
            label="Drop repayment CSV/XLSX here"
            sublabel="File should contain user_id, payment_date, and amount columns."
          />
        </div>
      )}

      {/* Sync History */}
      {syncs.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-7 h-7" />}
          title="No Repayment Syncs"
          description="Upload your first repayment file to update borrower outstanding balances."
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-secondary)]">
                <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Sync Date</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Source</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Records Updated</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {syncs.map((sync: any) => (
                <tr key={sync.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-[var(--text-primary)]">{sync.syncDate || '—'}</td>
                  <td className="px-5 py-3 text-sm text-[var(--text-secondary)] uppercase">{sync.sourceType}</td>
                  <td className="px-5 py-3">
                    <StatusBadge
                      label={sync.status}
                      variant={sync.status === 'completed' ? 'success' : sync.status === 'processing' ? 'warning' : 'neutral'}
                    />
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold text-[var(--text-primary)]">{(sync.recordsUpdated || 0).toLocaleString()}</td>
                  <td className="px-5 py-3 text-sm text-[var(--text-secondary)]">
                    {sync.createdAt ? new Date(sync.createdAt).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

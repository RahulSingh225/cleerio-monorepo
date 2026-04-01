'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Plus, Layers, Trash2, Save, ArrowRight, X, Loader2 } from 'lucide-react';

export default function BucketsPage() {
  const [buckets, setBuckets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newBucket, setNewBucket] = useState({ bucketName: '', dpdMin: 0, dpdMax: 30, displayLabel: '', priority: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchBuckets(); }, []);

  const fetchBuckets = async () => {
    try {
      const response = await api.get('/dpd-bucket-configs');
      setBuckets(response.data.data || []);
    } catch (err) { console.error('Failed to fetch buckets'); }
    finally { setIsLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/dpd-bucket-configs', newBucket);
      setShowModal(false);
      setNewBucket({ bucketName: '', dpdMin: 0, dpdMax: 30, displayLabel: '', priority: 0 });
      fetchBuckets();
    } catch (err) { alert('Failed to create bucket.'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Risk Segmentation"
        subtitle="Define DPD buckets to categorize delinquent accounts."
        actions={
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Bucket
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card h-48 animate-pulse bg-[var(--surface-secondary)]" />
        )) : buckets.map((bucket) => (
          <div key={bucket.id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-semibold text-[var(--primary)] uppercase tracking-wider">Priority {bucket.priority}</span>
                <h3 className="text-base font-bold text-[var(--text-primary)] mt-0.5">{bucket.bucketName}</h3>
              </div>
              <StatusBadge label={bucket.isActive !== false ? 'Active' : 'Inactive'} variant={bucket.isActive !== false ? 'success' : 'neutral'} />
            </div>

            <div className="flex items-center justify-between p-3 bg-[var(--surface-secondary)] rounded-lg border border-[var(--border-light)] mb-3">
              <div>
                <span className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase">Min DPD</span>
                <p className="text-lg font-bold text-[var(--text-primary)]">{bucket.dpdMin}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--text-tertiary)]" />
              <div className="text-right">
                <span className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase">Max DPD</span>
                <p className="text-lg font-bold text-[var(--text-primary)]">{bucket.dpdMax || '∞'}</p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)]">{bucket.displayLabel || 'No label set'}</p>
          </div>
        ))}

        {!isLoading && buckets.length === 0 && (
          <div className="col-span-full card py-16 flex flex-col items-center justify-center text-center space-y-3">
            <Layers className="w-10 h-10 text-[var(--text-tertiary)]" />
            <h4 className="text-base font-semibold text-[var(--text-primary)]">No Risk Tiers Defined</h4>
            <p className="text-sm text-[var(--text-secondary)] max-w-xs">Create DPD buckets to enable targeted collection automation.</p>
            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">Add First Bucket</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-[var(--border)] rounded-xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Layers className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">New DPD Bucket</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Bucket Name</label>
                  <input type="text" required value={newBucket.bucketName} onChange={(e) => setNewBucket({...newBucket, bucketName: e.target.value.toUpperCase().replace(/\s+/g, '_')})} placeholder="EARLY_BUCKET" className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Display Label</label>
                  <input type="text" value={newBucket.displayLabel} onChange={(e) => setNewBucket({...newBucket, displayLabel: e.target.value})} placeholder="1-30 Days DPD" className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Min DPD</label>
                  <input type="number" required value={newBucket.dpdMin} onChange={(e) => setNewBucket({...newBucket, dpdMin: parseInt(e.target.value)})} className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Max DPD</label>
                  <input type="number" required value={newBucket.dpdMax} onChange={(e) => setNewBucket({...newBucket, dpdMax: parseInt(e.target.value)})} className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]" />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-[var(--primary)] text-white font-semibold py-2.5 rounded-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSubmitting ? 'Creating...' : 'Create Bucket'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

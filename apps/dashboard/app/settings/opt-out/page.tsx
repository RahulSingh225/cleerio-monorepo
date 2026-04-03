'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Plus, ShieldOff, X, Save, Loader2, Trash2, Phone } from 'lucide-react';

export default function OptOutPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEntry, setNewEntry] = useState({ mobile: '', channel: '', reason: '', source: 'manual' });

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    try {
      const res = await api.get('/opt-out');
      setEntries(res.data.data || []);
    } catch (err) { console.error('Failed to fetch opt-out list'); }
    finally { setIsLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/opt-out', newEntry);
      setShowModal(false);
      setNewEntry({ mobile: '', channel: '', reason: '', source: 'manual' });
      fetchEntries();
    } catch (err) { alert('Failed to add to DNC list.'); }
    finally { setIsSubmitting(false); }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this number from the DNC list?')) return;
    try {
      await api.delete(`/opt-out/${id}`);
      fetchEntries();
    } catch (err) { alert('Failed to remove.'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Do Not Contact List"
        subtitle="Manage opted-out mobile numbers for regulatory compliance."
        actions={
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add to DNC
          </button>
        }
      />

      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-secondary)]">
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Mobile</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Channel</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Reason</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Source</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Date</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {isLoading ? Array.from({ length: 3 }).map((_, i) => (
              <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-4 bg-[var(--surface-secondary)] rounded animate-pulse" /></td></tr>
            )) : entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                    <span className="text-sm font-mono font-medium text-[var(--text-primary)]">{entry.mobile}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <StatusBadge label={entry.channel || 'All'} variant={entry.channel ? 'info' : 'neutral'} />
                </td>
                <td className="px-5 py-3 text-sm text-[var(--text-secondary)]">{entry.reason || '—'}</td>
                <td className="px-5 py-3">
                  <StatusBadge label={entry.source || 'manual'} variant="neutral" />
                </td>
                <td className="px-5 py-3 text-sm text-[var(--text-tertiary)]">
                  {entry.optedOutAt ? new Date(entry.optedOutAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => handleRemove(entry.id)} className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isLoading && entries.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
            <ShieldOff className="w-10 h-10 text-[var(--text-tertiary)]" />
            <h4 className="text-base font-semibold text-[var(--text-primary)]">DNC List Empty</h4>
            <p className="text-sm text-[var(--text-secondary)] max-w-xs">No mobile numbers are opted out. All contacts are eligible for communication.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-[var(--border)] rounded-xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-600"><ShieldOff className="w-5 h-5" /></div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Add to DNC List</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Mobile Number</label>
                <input type="text" required value={newEntry.mobile} onChange={(e) => setNewEntry({...newEntry, mobile: e.target.value})} placeholder="+919876543210" className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Channel (blank = all)</label>
                  <select value={newEntry.channel} onChange={(e) => setNewEntry({...newEntry, channel: e.target.value})} className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]">
                    <option value="">All Channels</option>
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="ivr">IVR</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Reason</label>
                  <input type="text" value={newEntry.reason} onChange={(e) => setNewEntry({...newEntry, reason: e.target.value})} placeholder="Customer request" className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]" />
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-red-600 text-white font-semibold py-2.5 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldOff className="w-4 h-4" />}
                {isSubmitting ? 'Adding...' : 'Add to DNC List'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Mail, Filter, X, ChevronRight, Loader2, Radio } from 'lucide-react';

const statusConfig: Record<string, { variant: string; label: string }> = {
  scheduled: { variant: 'info', label: 'Scheduled' },
  queued: { variant: 'warning', label: 'Queued' },
  sent: { variant: 'success', label: 'Sent' },
  delivered: { variant: 'success', label: 'Delivered' },
  failed: { variant: 'critical', label: 'Failed' },
  cancelled: { variant: 'neutral', label: 'Cancelled' },
};

const channelIcons: Record<string, string> = { sms: '💬', whatsapp: '📱', ivr: '📞', voice_bot: '🤖' };

export default function CommunicationsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', channel: '' });
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => { fetchEvents(); }, [filters]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.channel) params.append('channel', filters.channel);
      const res = await api.get(`/comm-events?${params.toString()}`);
      setEvents(res.data.data || []);
    } catch (err) { console.error('Failed to fetch comm events'); }
    finally { setIsLoading(false); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this scheduled communication?')) return;
    try {
      await api.put(`/comm-events/${id}/cancel`);
      fetchEvents();
    } catch (err) { alert('Failed to cancel.'); }
  };

  // Summary metrics
  const totalScheduled = events.filter(e => e.status === 'scheduled').length;
  const totalSent = events.filter(e => e.status === 'sent' || e.status === 'delivered').length;
  const totalFailed = events.filter(e => e.status === 'failed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Communications"
        subtitle="Track and manage scheduled and sent communications."
        actions={
          <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors">
            <Filter className="w-4 h-4" /> Filters
          </button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Total Events</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{events.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Scheduled</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalScheduled}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Sent / Delivered</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{totalSent}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Failed</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{totalFailed}</p>
        </div>
      </div>

      {/* Filter bar */}
      {showFilter && (
        <div className="card p-4 flex items-center gap-4">
          <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="bg-white border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20">
            <option value="">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="queued">Queued</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={filters.channel} onChange={(e) => setFilters({...filters, channel: e.target.value})} className="bg-white border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20">
            <option value="">All Channels</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="ivr">IVR</option>
          </select>
          <button onClick={() => setFilters({ status: '', channel: '' })} className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-secondary)]">
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Channel</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Record ID</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Scheduled At</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Sent At</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Idempotency Key</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {isLoading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-4 bg-[var(--surface-secondary)] rounded animate-pulse" /></td></tr>
            )) : events.map((event) => (
              <tr key={event.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                <td className="px-5 py-3">
                  <span className="text-lg">{channelIcons[event.channel] || '📤'}</span>
                  <span className="ml-1.5 text-xs font-medium text-[var(--text-secondary)] uppercase">{event.channel}</span>
                </td>
                <td className="px-5 py-3">
                  <code className="text-xs font-mono text-[var(--text-primary)]">{event.recordId?.substring(0, 8)}...</code>
                </td>
                <td className="px-5 py-3">
                  <StatusBadge
                    label={statusConfig[event.status]?.label || event.status}
                    variant={(statusConfig[event.status]?.variant || 'neutral') as any}
                  />
                </td>
                <td className="px-5 py-3 text-sm text-[var(--text-secondary)]">
                  {event.scheduledAt ? new Date(event.scheduledAt).toLocaleString() : '—'}
                </td>
                <td className="px-5 py-3 text-sm text-[var(--text-secondary)]">
                  {event.sentAt ? new Date(event.sentAt).toLocaleString() : '—'}
                </td>
                <td className="px-5 py-3">
                  <code className="text-[10px] font-mono text-[var(--text-tertiary)]">{event.idempotencyKey?.substring(0, 20)}...</code>
                </td>
                <td className="px-5 py-3">
                  {event.status === 'scheduled' && (
                    <button onClick={() => handleCancel(event.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isLoading && events.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
            <Radio className="w-10 h-10 text-[var(--text-tertiary)]" />
            <h4 className="text-base font-semibold text-[var(--text-primary)]">No Communication Events</h4>
            <p className="text-sm text-[var(--text-secondary)] max-w-xs">Upload a portfolio and configure workflow rules to generate scheduled communications.</p>
          </div>
        )}
      </div>
    </div>
  );
}

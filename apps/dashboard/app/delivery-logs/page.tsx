'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { MessageSquare, Loader2, Filter } from 'lucide-react';

const statusConfig: Record<string, { variant: string; label: string }> = {
  sent: { variant: 'info', label: 'Sent' },
  delivered: { variant: 'success', label: 'Delivered' },
  read: { variant: 'success', label: 'Read' },
  failed: { variant: 'critical', label: 'Failed' },
  bounced: { variant: 'warning', label: 'Bounced' },
};

export default function DeliveryLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/delivery-logs');
      setLogs(res.data.data || []);
    } catch (err) { console.error('Failed to load delivery logs'); }
    finally { setIsLoading(false); }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Delivery Logs"
        subtitle="Track message delivery status from SMS, WhatsApp, and IVR providers."
      />

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {['sent', 'delivered', 'read', 'failed'].map(status => {
          const count = logs.filter(l => l.deliveryStatus === status).length;
          const config = statusConfig[status];
          return (
            <div key={status} className="card p-4">
              <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{config?.label || status}</p>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-7 h-7" />}
          title="No Delivery Logs"
          description="Provider delivery callbacks will appear here once communications are dispatched."
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-secondary)]">
                <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Provider</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Message ID</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Delivered</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Read</th>
                <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-[var(--text-primary)]">{log.providerName || '—'}</td>
                  <td className="px-5 py-3"><code className="text-xs font-mono text-[var(--text-secondary)]">{log.providerMsgId?.substring(0, 16) || '—'}</code></td>
                  <td className="px-5 py-3">
                    <StatusBadge
                      label={statusConfig[log.deliveryStatus]?.label || log.deliveryStatus || 'unknown'}
                      variant={(statusConfig[log.deliveryStatus]?.variant || 'neutral') as any}
                    />
                  </td>
                  <td className="px-5 py-3 text-sm text-[var(--text-secondary)]">{log.deliveredAt ? new Date(log.deliveredAt).toLocaleString() : '—'}</td>
                  <td className="px-5 py-3 text-sm text-[var(--text-secondary)]">{log.readAt ? new Date(log.readAt).toLocaleString() : '—'}</td>
                  <td className="px-5 py-3 text-xs text-red-500">{log.errorMessage || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

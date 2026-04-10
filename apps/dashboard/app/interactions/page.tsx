'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Timeline } from '@/components/ui/timeline';
import { Bot, Loader2, MessageSquare, Phone, ThumbsUp, AlertTriangle, Link as LinkIcon, ShieldOff, Filter } from 'lucide-react';

const typeConfig: Record<string, { icon: any; iconBg: string; iconColor: string; label: string }> = {
  ptp: { icon: ThumbsUp, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', label: 'Promise to Pay' },
  dispute: { icon: AlertTriangle, iconBg: 'bg-red-100', iconColor: 'text-red-500', label: 'Dispute' },
  callback_request: { icon: Phone, iconBg: 'bg-blue-100', iconColor: 'text-blue-600', label: 'Callback Request' },
  reply: { icon: MessageSquare, iconBg: 'bg-purple-100', iconColor: 'text-purple-600', label: 'Reply' },
  link_click: { icon: LinkIcon, iconBg: 'bg-amber-100', iconColor: 'text-amber-600', label: 'Link Click' },
  opt_out: { icon: ShieldOff, iconBg: 'bg-gray-100', iconColor: 'text-gray-500', label: 'Opt Out' },
};

export default function InteractionsPage() {
  const [interactions, setInteractions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchInteractions(); }, []);

  const fetchInteractions = async () => {
    try {
      const res = await api.get('/interactions?limit=100');
      setInteractions(res.data.data || []);
    } catch (err) { console.error('Failed to load interactions'); }
    finally { setIsLoading(false); }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>;
  }

  const timelineEvents = interactions.map((i: any) => {
    const config = typeConfig[i.interactionType] || typeConfig.reply;
    const Icon = config.icon;
    return {
      id: i.id,
      icon: <Icon className="w-4 h-4" />,
      iconBg: config.iconBg,
      iconColor: config.iconColor,
      title: config.label,
      description: i.channel ? `Via ${i.channel.toUpperCase()}` : undefined,
      timestamp: i.createdAt ? new Date(i.createdAt).toLocaleString() : '—',
      details: i.details && Object.keys(i.details).length > 0 ? (
        <div className="text-[10px] font-mono text-[var(--text-tertiary)] bg-[var(--surface-secondary)] rounded-lg p-2 mt-1">
          {JSON.stringify(i.details, null, 2)}
        </div>
      ) : undefined,
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Interaction Feed"
        subtitle="Real-time borrower interactions — PTP, disputes, callbacks, and replies."
      />

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(typeConfig).slice(0, 4).map(([key, config]) => {
          const count = interactions.filter(i => i.interactionType === key).length;
          const Icon = config.icon;
          return (
            <div key={key} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.iconBg}`}>
                <Icon className={`w-5 h-5 ${config.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{count}</p>
                <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{config.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {interactions.length === 0 ? (
        <EmptyState
          icon={<Bot className="w-7 h-7" />}
          title="No Interactions Yet"
          description="Interactions will appear here as borrowers respond to communications via SMS, WhatsApp, or IVR."
        />
      ) : (
        <div className="card p-6">
          <Timeline events={timelineEvents} />
        </div>
      )}
    </div>
  );
}

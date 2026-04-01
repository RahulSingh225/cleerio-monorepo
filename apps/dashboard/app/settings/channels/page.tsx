'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Mail, MessageSquare, Phone, Radio, Loader2 } from 'lucide-react';

const channelIcons: Record<string, any> = {
  sms: MessageSquare,
  whatsapp: MessageSquare,
  ivr: Phone,
  voice_bot: Radio,
  email: Mail,
};

export default function ChannelsPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => { fetchChannels(); }, []);

  const fetchChannels = async () => {
    try {
      const response = await api.get('/channel-configs');
      setChannels(response.data.data || []);
    } catch (err) { console.error('Failed to fetch channels'); }
    finally { setIsLoading(false); }
  };

  const toggleChannel = async (channel: any) => {
    setUpdating(channel.channel);
    try {
      await api.put(`/channel-configs/${channel.channel}`, { isEnabled: !channel.isEnabled });
      fetchChannels();
    } catch (err) { alert('Failed to update channel.'); }
    finally { setUpdating(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Channel Configuration"
        subtitle="Manage communication channels for debt collection outreach."
      />

      {isLoading ? (
        <div className="card p-12 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--text-tertiary)]" />
        </div>
      ) : (
        <div className="space-y-3">
          {channels.map((ch) => {
            const Icon = channelIcons[ch.channel] || Mail;
            return (
              <div key={ch.id} className="card p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${ch.isEnabled ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] capitalize">{ch.channel.replace('_', ' ')}</h3>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {ch.providerName || 'No provider'} · Daily cap: {ch.dailyCap || '∞'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge label={ch.isEnabled ? 'Active' : 'Disabled'} variant={ch.isEnabled ? 'success' : 'neutral'} />
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={ch.isEnabled} onChange={() => toggleChannel(ch)} className="sr-only peer" disabled={updating === ch.channel} />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--primary)]" />
                  </label>
                </div>
              </div>
            );
          })}
          {channels.length === 0 && (
            <div className="card py-16 flex flex-col items-center text-center space-y-3">
              <Mail className="w-10 h-10 text-[var(--text-tertiary)]" />
              <h4 className="text-base font-semibold text-[var(--text-primary)]">No Channels Configured</h4>
              <p className="text-sm text-[var(--text-secondary)]">Channels are seeded by the platform. Contact admin to set up.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

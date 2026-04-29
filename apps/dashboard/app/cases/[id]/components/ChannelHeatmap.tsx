'use client';
import React from 'react';

interface ChannelHeatmapProps { channelBreakdown: Record<string, { sent: number; delivered: number; read: number; replied: number; failed: number }>; bestChannel: string; }

export function ChannelHeatmap({ channelBreakdown, bestChannel }: ChannelHeatmapProps) {
  const channels = Object.entries(channelBreakdown);
  if (channels.length === 0) return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Channel Performance</h3>
      <p className="text-xs text-[var(--text-tertiary)]">No communication data yet.</p>
    </div>
  );
  const maxSent = Math.max(...channels.map(([, s]) => s.sent), 1);
  const channelLabels: Record<string, string> = { sms: 'SMS', whatsapp: 'WhatsApp', ivr: 'IVR', voice_bot: 'Voice Bot', email: 'Email' };
  const channelColors: Record<string, string> = { sms: '#3B82F6', whatsapp: '#22C55E', ivr: '#F59E0B', voice_bot: '#8B5CF6', email: '#EC4899' };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Channel Performance</h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 uppercase">Best: {channelLabels[bestChannel] || bestChannel}</span>
      </div>
      <div className="space-y-3">
        {channels.map(([ch, stats]) => {
          const deliveryRate = stats.sent > 0 ? Math.round((stats.delivered / stats.sent) * 100) : 0;
          const color = channelColors[ch] || '#6B7280';
          return (
            <div key={ch}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-[var(--text-primary)]">{channelLabels[ch] || ch}</span>
                <span className="text-[var(--text-tertiary)]">{stats.sent} sent · {deliveryRate}% delivered</span>
              </div>
              <div className="flex items-center gap-1 h-5">
                <div className="h-full rounded-md transition-all" style={{ width: `${(stats.delivered / maxSent) * 100}%`, backgroundColor: color, opacity: 0.9, minWidth: stats.delivered > 0 ? '4px' : 0 }} />
                <div className="h-full rounded-md transition-all" style={{ width: `${(stats.read / maxSent) * 100}%`, backgroundColor: color, opacity: 0.6, minWidth: stats.read > 0 ? '4px' : 0 }} />
                <div className="h-full rounded-md transition-all" style={{ width: `${(stats.replied / maxSent) * 100}%`, backgroundColor: color, opacity: 0.4, minWidth: stats.replied > 0 ? '4px' : 0 }} />
                <div className="h-full rounded-md transition-all" style={{ width: `${(stats.failed / maxSent) * 100}%`, backgroundColor: '#EF4444', opacity: 0.7, minWidth: stats.failed > 0 ? '4px' : 0 }} />
              </div>
              <div className="flex gap-3 mt-0.5 text-[9px] text-[var(--text-tertiary)]">
                <span>✓ {stats.delivered}</span><span>👁 {stats.read}</span><span>💬 {stats.replied}</span>
                {stats.failed > 0 && <span className="text-red-400">✕ {stats.failed}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

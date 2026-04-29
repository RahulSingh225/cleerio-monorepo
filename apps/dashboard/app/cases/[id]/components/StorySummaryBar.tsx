'use client';
import React from 'react';
import { Radio, Send, MessageSquare, ThumbsUp, IndianRupee } from 'lucide-react';

interface StorySummaryBarProps { summary: any; }

export function StorySummaryBar({ summary }: StorySummaryBarProps) {
  if (!summary) return null;
  const cards = [
    { icon: <Radio className="w-4 h-4" />, label: 'Reachability', value: `${summary.deliveryRate || 0}%`, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
    { icon: <Send className="w-4 h-4" />, label: 'Comms Sent', value: summary.totalSent || 0, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50' },
    { icon: <MessageSquare className="w-4 h-4" />, label: 'Reply Rate', value: `${summary.replyRate || 0}%`, color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50' },
    { icon: <ThumbsUp className="w-4 h-4" />, label: 'PTPs Made', value: summary.ptpHistory?.total || 0, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
    { icon: <IndianRupee className="w-4 h-4" />, label: 'Payments', value: summary.repaymentTrend?.length || 0, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
          <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
            <span className={`bg-gradient-to-br ${card.color} bg-clip-text text-transparent`}>{card.icon}</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{card.label}</p>
            <p className="text-xl font-bold text-[var(--text-primary)]">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

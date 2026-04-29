'use client';
import React, { useState } from 'react';
import {
  MessageSquare, PhoneCall, Mail, Send, IndianRupee, ThumbsUp,
  Ban, AlertCircle, Activity, Clock, CheckCircle2, Eye, MousePointerClick,
  XCircle, Sparkles, Volume2, ChevronDown, ChevronUp,
} from 'lucide-react';

const sentimentColors: Record<string, { bg: string; text: string }> = {
  cooperative: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  hesitant: { bg: 'bg-amber-50', text: 'text-amber-700' },
  agitated: { bg: 'bg-red-50', text: 'text-red-700' },
  unresponsive: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

const stageOrder = ['IDENTITY', 'PURPOSE', 'PUSH_1', 'PUSH_2', 'PUSH_3', 'CONSEQUENCES', 'ESCALATION', 'PAYMENT_LINK'];

function StageFunnel({ stage }: { stage: string }) {
  const idx = stageOrder.indexOf(stage);
  const progress = idx >= 0 ? ((idx + 1) / stageOrder.length) * 100 : 0;
  return (
    <div className="mt-1">
      <div className="flex items-center justify-between text-[9px] text-[var(--text-tertiary)] mb-0.5">
        <span>Stage: {stage}</span><span>{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

interface EnrichedTimelineProps { timeline: any[]; }

export function EnrichedTimeline({ timeline }: EnrichedTimelineProps) {
  const [filter, setFilter] = useState('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'communication', label: 'Comms' },
    { key: 'interaction', label: 'Interactions' },
    { key: 'repayment', label: 'Payments' },
    { key: 'insight', label: 'AI Insights' },
  ];

  const filtered = filter === 'all' ? timeline : timeline.filter(e => e.type === filter);

  const getIcon = (event: any) => {
    if (event.type === 'communication') {
      if (event.channel === 'ivr' || event.channel === 'voice_bot') return { icon: <PhoneCall className="w-3.5 h-3.5" />, bg: 'bg-amber-100 text-amber-600' };
      if (event.channel === 'whatsapp') return { icon: <MessageSquare className="w-3.5 h-3.5" />, bg: 'bg-green-100 text-green-600' };
      if (event.channel === 'email') return { icon: <Mail className="w-3.5 h-3.5" />, bg: 'bg-pink-100 text-pink-600' };
      return { icon: <MessageSquare className="w-3.5 h-3.5" />, bg: 'bg-blue-100 text-blue-600' };
    }
    if (event.type === 'repayment') return { icon: <IndianRupee className="w-3.5 h-3.5" />, bg: 'bg-emerald-100 text-emerald-600' };
    if (event.type === 'insight') return { icon: <Sparkles className="w-3.5 h-3.5" />, bg: 'bg-purple-100 text-purple-600' };
    if (event.category === 'ptp') return { icon: <ThumbsUp className="w-3.5 h-3.5" />, bg: 'bg-amber-100 text-amber-600' };
    if (event.category === 'opt_out') return { icon: <Ban className="w-3.5 h-3.5" />, bg: 'bg-red-100 text-red-600' };
    if (event.category === 'dispute') return { icon: <AlertCircle className="w-3.5 h-3.5" />, bg: 'bg-orange-100 text-orange-600' };
    return { icon: <Activity className="w-3.5 h-3.5" />, bg: 'bg-violet-100 text-violet-600' };
  };

  return (
    <div className="card">
      <div className="p-5 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--primary)]" /> Unified Borrower Timeline
        </h3>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">All activity merged across portfolios, sorted chronologically.</p>
        <div className="flex items-center gap-1.5 mt-3">
          {filters.map(f => {
            const cnt = f.key === 'all' ? timeline.length : timeline.filter(e => e.type === f.key).length;
            return (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filter === f.key ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'}`}>
                {f.label} ({cnt})
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5">
        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <Activity className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">No activity recorded.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[var(--primary)] via-gray-200 to-transparent" />
            <div className="space-y-0">
              {filtered.map((event: any) => {
                const ic = getIcon(event);
                const expanded = expandedIds.has(event.id);
                const d = event.details || {};
                return (
                  <div key={event.id} className="relative flex gap-4 pb-5 last:pb-0 group">
                    <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${ic.bg} shadow-sm ring-4 ring-white`}>{ic.icon}</div>
                    <div className="flex-1 card p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => toggleExpand(event.id)}>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold uppercase text-[var(--text-primary)]">
                            {event.type === 'communication' ? `${event.channel || 'comm'} sent` : event.type === 'repayment' ? 'Payment Received' : event.type === 'insight' ? 'AI Insight' : (event.category || event.type).replace(/_/g, ' ')}
                          </span>
                          {event.channel && event.type !== 'communication' && <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full uppercase">{event.channel}</span>}
                          {event.status && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${['delivered','read','sent','completed'].includes(event.status) ? 'bg-emerald-50 text-emerald-700' : ['failed','error'].includes(event.status) ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>{event.status}</span>}
                          {/* Sentiment badge for IVR */}
                          {d.sentiment && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sentimentColors[d.sentiment]?.bg || 'bg-gray-100'} ${sentimentColors[d.sentiment]?.text || 'text-gray-600'}`}>{d.sentiment}</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <time className="text-[10px] text-[var(--text-tertiary)] whitespace-nowrap">
                            {event.timestamp ? new Date(event.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </time>
                          {expanded ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
                        </div>
                      </div>

                      {/* IVR Stage Funnel */}
                      {d.stageReached && <StageFunnel stage={d.stageReached} />}

                      {/* Expanded details */}
                      {expanded && (
                        <div className="mt-3 space-y-2 animate-fade-in">
                          {/* Communication body */}
                          {event.type === 'communication' && d.resolvedBody && (
                            <p className="text-sm text-[var(--text-secondary)] bg-[var(--surface-secondary)] p-2.5 rounded-lg border border-[var(--border-light)] line-clamp-5">{d.resolvedBody}</p>
                          )}
                          {/* Delivery journey */}
                          {event.type === 'communication' && (
                            <div className="flex items-center gap-3 text-[10px] text-[var(--text-tertiary)]">
                              {d.providerName && <span>Provider: <b>{d.providerName}</b></span>}
                              {d.deliveredAt && <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Delivered</span>}
                              {d.readAt && <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-blue-500" /> Read</span>}
                              {d.linkClicked && <span className="flex items-center gap-1"><MousePointerClick className="w-3 h-3 text-violet-500" /> Clicked</span>}
                            </div>
                          )}
                          {d.replyContent && <div className="text-sm text-[var(--text-primary)] bg-blue-50 p-2.5 rounded-lg border border-blue-100"><span className="text-[10px] font-bold text-blue-600 uppercase block mb-1">Borrower Reply</span>&ldquo;{d.replyContent}&rdquo;</div>}
                          {d.failureReason && <div className="text-xs text-red-700 bg-red-50 p-2 rounded-lg flex items-center gap-2"><XCircle className="w-3.5 h-3.5 shrink-0" />{d.failureReason}</div>}
                          {/* Transcript */}
                          {d.transcript?.text && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">Call Summary</p>
                              <p className="text-sm text-amber-900 leading-relaxed">{d.transcript.text}</p>
                              {d.transcript.confidence && <p className="text-[10px] text-amber-600 mt-1">Confidence: {(Number(d.transcript.confidence) * 100).toFixed(0)}%</p>}
                            </div>
                          )}
                          {/* Audio player */}
                          {d.recording?.audioUrl && (
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <Volume2 className="w-4 h-4 text-[var(--primary)] shrink-0" />
                              <div className="flex-1">
                                <audio controls className="w-full h-8" preload="none"><source src={d.recording.audioUrl} /></audio>
                                {d.recording.durationSeconds && <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{Math.floor(d.recording.durationSeconds / 60)}:{String(d.recording.durationSeconds % 60).padStart(2, '0')} duration</p>}
                              </div>
                            </div>
                          )}
                          {/* Repayment */}
                          {event.type === 'repayment' && <div className="flex items-center gap-4"><div className="text-lg font-bold text-emerald-600">₹{Number(d.amount || 0).toLocaleString()}</div>{d.paymentType && <span className="text-[10px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full uppercase">{d.paymentType}</span>}</div>}
                          {/* PTP */}
                          {event.category === 'ptp' && d.ptpDate && <p className="text-sm text-amber-700">PTP: ₹{Number(d.ptpAmount || 0).toLocaleString()} by {d.ptpDate}</p>}
                          {/* AI Insight */}
                          {event.type === 'insight' && d.content && (
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-3">
                              <p className="text-sm text-purple-900">{typeof d.content === 'string' ? d.content : JSON.stringify(d.content)}</p>
                              {d.confidence && <p className="text-[10px] text-purple-600 mt-1">Confidence: {(Number(d.confidence) * 100).toFixed(0)}%</p>}
                            </div>
                          )}
                          {/* Outcome for IVR */}
                          {d.outcome && <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">Outcome: {d.outcome}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

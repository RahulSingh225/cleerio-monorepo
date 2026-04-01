'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles, MoreHorizontal } from 'lucide-react';

export const AgentNode = memo(() => {
  return (
    <div className="min-w-[240px] bg-white border border-[var(--border)] rounded-xl shadow-md overflow-hidden group hover:border-indigo-400 hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-indigo-50 border-b border-indigo-100">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-500 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider block">AI Agent</span>
            <span className="text-sm font-bold text-[var(--text-primary)]">Initial Email Outreach</span>
          </div>
        </div>
        <button className="p-1 rounded hover:bg-indigo-100 text-[var(--text-tertiary)]">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="p-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border-light)]">
          <p className="text-xs text-[var(--text-secondary)]">Tone: <span className="font-medium text-indigo-600">Friendly, Persistent</span></p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: '78%' }} />
          </div>
          <span className="text-[10px] font-medium text-indigo-600">78% Success</span>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {['GPT-4', 'Empathy Model', 'Legal Aware'].map(t => (
            <span key={t} className="px-2 py-0.5 rounded bg-indigo-50 text-[10px] text-indigo-700 font-medium border border-indigo-100">
              {t}
            </span>
          ))}
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white !shadow-md" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white !shadow-md" />
    </div>
  );
});

AgentNode.displayName = 'AgentNode';

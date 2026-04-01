'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Shuffle, MoreHorizontal, ArrowRight } from 'lucide-react';

export const MapperNode = memo(() => {
  return (
    <div className="min-w-[220px] bg-white border border-[var(--border)] rounded-xl shadow-md overflow-hidden group hover:border-amber-400 hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border-b border-amber-100">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-amber-500 text-white">
            <Shuffle className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider block">Condition</span>
            <span className="text-sm font-bold text-[var(--text-primary)]">Check Response</span>
          </div>
        </div>
        <button className="p-1 rounded hover:bg-amber-100 text-[var(--text-tertiary)]">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <p className="text-xs text-[var(--text-secondary)]">Wait: 48 hours</p>
        <div className="space-y-1.5">
          {[
            { from: 'responded', to: 'Settlement Flow' },
            { from: 'no_response', to: 'Escalation' },
          ].map((m) => (
            <div key={m.from} className="flex items-center gap-2 p-2 rounded bg-[var(--surface-secondary)] text-xs">
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">{m.from}</span>
              <ArrowRight className="w-3 h-3 text-[var(--text-tertiary)]" />
              <span className="text-[var(--text-secondary)]">{m.to}</span>
            </div>
          ))}
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white !shadow-md" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white !shadow-md" />
    </div>
  );
});

MapperNode.displayName = 'MapperNode';

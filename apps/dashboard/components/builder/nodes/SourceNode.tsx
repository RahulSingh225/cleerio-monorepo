'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, FileText, MoreHorizontal } from 'lucide-react';

export const SourceNode = memo(() => {
  return (
    <div className="min-w-[240px] bg-white border border-[var(--border)] rounded-xl shadow-md overflow-hidden group hover:border-emerald-400 hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border-b border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-500 text-white">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider block">Trigger</span>
            <span className="text-sm font-bold text-[var(--text-primary)]">New Overdue Invoice</span>
          </div>
        </div>
        <button className="p-1 rounded hover:bg-emerald-100 text-[var(--text-tertiary)]">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border-light)]">
          <FileText className="h-4 w-4 text-emerald-600" />
          <div>
            <p className="text-xs font-medium text-[var(--text-primary)]">Criteria: {'>'} $500, {'>'} 5 days</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['userId', 'mobile', 'overdue', 'product'].map(f => (
            <span key={f} className="px-2 py-0.5 rounded bg-emerald-50 text-[10px] text-emerald-700 font-medium border border-emerald-100">
              {f}
            </span>
          ))}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white !shadow-md"
      />
    </div>
  );
});

SourceNode.displayName = 'SourceNode';

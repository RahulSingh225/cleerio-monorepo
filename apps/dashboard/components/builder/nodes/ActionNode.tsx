'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mail, MoreHorizontal } from 'lucide-react';

export const ActionNode = memo(() => {
  return (
    <div className="min-w-[220px] bg-white border border-[var(--border)] rounded-xl shadow-md overflow-hidden group hover:border-blue-400 hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-blue-100">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-blue-500 text-white">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">Channel</span>
            <span className="text-sm font-bold text-[var(--text-primary)]">Send Notification</span>
          </div>
        </div>
        <button className="p-1 rounded hover:bg-blue-100 text-[var(--text-tertiary)]">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="p-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border-light)]">
          <p className="text-xs font-medium text-[var(--text-primary)]">Payment Reminder SMS</p>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Template: TPL_REMINDER_V2</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
          <span>Priority: <span className="font-medium text-blue-600">High</span></span>
          <span>Channel: <span className="font-medium text-blue-600">SMS</span></span>
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !shadow-md" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white !shadow-md" />
    </div>
  );
});

ActionNode.displayName = 'ActionNode';

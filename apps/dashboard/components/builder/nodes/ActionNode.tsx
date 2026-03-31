'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mail, MessageSquare, Phone, MoreVertical } from 'lucide-react';

export const ActionNode = memo(() => {
  return (
    <div className="node-card min-w-[210px] shadow-2xl">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-[#27272a] bg-[#18181b]/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-green-600/10 text-green-500 border border-green-500/20">
              <Mail className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-tight">Channel Router</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-white/5">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] text-zinc-300 font-semibold tracking-tight">SMS Gateway</span>
            </div>
            <div className="text-[10px] font-mono text-zinc-600 underline">DEFAULT</div>
          </div>
          
          <div className="space-y-1.5">
             <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest leading-none">TEMPLATE</span>
             <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 font-medium leading-relaxed">
                "Hello {"{{name}}"}, your account is overdue by {"{{days}}"} days. Please pay {"{{amount}}"}...
             </div>
          </div>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-[#09090b]"
      />
    </div>
  );
});

ActionNode.displayName = 'ActionNode';

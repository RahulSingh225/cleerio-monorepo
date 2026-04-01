'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mail, MessageSquare, Phone, MoreVertical, Smartphone, Zap } from 'lucide-react';

export const ActionNode = memo(() => {
  return (
    <div className="min-w-[280px] bg-[#18181B]/80 backdrop-blur-xl border border-white/5 rounded-[24px] shadow-2xl overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-gradient-to-r from-blue-500/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20 border border-white/10 text-white">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] leading-none mb-1">Infrastructure</span>
               <span className="text-[14px] font-black text-white italic uppercase tracking-tight">Channel Router</span>
            </div>
          </div>
          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-zinc-600 hover:text-white">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 ring-1 ring-white/5">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
               <span className="text-[10px] text-white font-black uppercase tracking-widest">MSG91 GATEWAY</span>
            </div>
            <div className="text-[9px] font-black text-zinc-700 uppercase tracking-tighter italic">Primary</div>
          </div>
          
          <div className="space-y-3">
             <div className="flex items-center justify-between px-1">
                <label className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em]">Active Template</label>
                <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-500 uppercase">
                    <Zap className="h-3 w-3" />
                    Live
                </div>
             </div>
             <div className="p-4 rounded-2xl bg-zinc-950/50 border border-white/5 text-[10px] text-zinc-400 font-medium leading-relaxed italic relative overflow-hidden group-hover:border-blue-500/20 transition-all duration-500">
                "Hello <span className="text-blue-400">{"{{name}}"}</span>, your account is overdue by <span className="text-blue-400">{"{{days}}"}</span> days..."
                <div className="absolute top-0 right-0 p-2 opacity-5">
                    <Mail className="w-12 h-12" />
                </div>
             </div>
          </div>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-4 !h-4 !bg-blue-600 !border-4 !border-[#09090B] !shadow-xl"
      />
    </div>
  );
});

ActionNode.displayName = 'ActionNode';

'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles, Bot, Clock, ChevronRight, Zap, Target } from 'lucide-react';

export const AgentNode = memo(() => {
  return (
    <div className="min-w-[300px] bg-[#18181B]/80 backdrop-blur-xl border border-white/5 rounded-[24px] shadow-2xl overflow-hidden group hover:border-indigo-500/30 transition-all duration-500">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-gradient-to-r from-indigo-500/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20 border border-white/10 text-white">
              <Bot className="h-5 w-5 fill-current" />
            </div>
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] leading-none mb-1">Cognitive Engine</span>
               <span className="text-[14px] font-black text-white italic uppercase tracking-tight">Agent: Aira v2</span>
            </div>
          </div>
          <Sparkles className="h-4 w-4 text-indigo-400 fill-indigo-400/10 animate-pulse" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-3">
             <div className="flex items-center justify-between px-1">
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.15em]">Persuasion Matrix</span>
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">High Affinity</span>
             </div>
             <div className="h-2 w-full bg-black/40 rounded-full border border-white/5 p-0.5">
                <div className="h-full w-[85%] bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.4)]" />
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-black/40 border border-white/5 group-hover:border-indigo-500/10 transition-all duration-500">
                <div className="flex items-center gap-1.5">
                    <Target className="w-3 h-3 text-zinc-700" />
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter">Discount Cap</span>
                </div>
                <span className="text-sm font-black text-white italic">15.0%</span>
             </div>
             <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-black/40 border border-white/5 group-hover:border-indigo-500/10 transition-all duration-500">
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-zinc-700" />
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter">Session TTL</span>
                </div>
                <span className="text-sm font-black text-white italic">48 Hours</span>
             </div>
          </div>

          <button className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-white text-black text-[11px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 active:scale-[0.98]">
             Configure Neural Logic
             <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-4 !h-4 !bg-indigo-600 !border-4 !border-[#09090B] !shadow-xl"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-4 !h-4 !bg-indigo-600 !border-4 !border-[#09090B] !shadow-xl"
      />
    </div>
  );
});

AgentNode.displayName = 'AgentNode';

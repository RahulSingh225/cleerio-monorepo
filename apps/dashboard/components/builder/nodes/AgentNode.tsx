'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles, Bot, Clock, ChevronRight } from 'lucide-react';

export const AgentNode = memo(() => {
  return (
    <div className="figma-node min-w-[260px] relative">
      <div className="flex flex-col">
        {/* Header - Electric Blue for AI */}
        <div className="flex items-center justify-between p-4 border-b border-[#E4E4E7] bg-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Bot className="h-5 w-5 fill-current" />
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">NEGOTIATION</span>
               <span className="text-[13px] font-bold text-[#111827]">Agent: Aira v2</span>
            </div>
          </div>
          <Sparkles className="h-4 w-4 text-blue-500 fill-blue-500/10" />
        </div>

        {/* Content - Strategy Config */}
        <div className="p-5 space-y-4">
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#F9FAFB] border border-[#E4E4E7]">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#6B7280]">PERSUASION LEVEL</span>
                <span className="text-[10px] font-black text-amber-600">HIGH</span>
             </div>
             <div className="h-1.5 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                <div className="h-full w-[85%] bg-blue-600 rounded-full" />
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div className="flex flex-col gap-1 p-2.5 rounded-lg border border-[#E4E4E7] bg-white">
                <span className="text-[9px] font-bold text-zinc-400">MAX DISCOUNT</span>
                <span className="text-xs font-bold text-zinc-800">15%</span>
             </div>
             <div className="flex flex-col gap-1 p-2.5 rounded-lg border border-[#E4E4E7] bg-white">
                <span className="text-[9px] font-bold text-zinc-400">TIMEOUT</span>
                <span className="text-xs font-bold text-zinc-800">48h</span>
             </div>
          </div>

          <button className="w-full py-2.5 rounded-xl bg-[#111827] text-[11px] font-bold text-white hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-zinc-950/10">
             Configure AI Logic
             <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-blue-600 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-blue-600 !border-2 !border-white"
      />
    </div>
  );
});

AgentNode.displayName = 'AgentNode';

'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Shuffle, ArrowRight, Cog, Wand2 } from 'lucide-react';

export const MapperNode = memo(() => {
  const mappings = [
    { from: 'phoneNumber', to: 'mobile' },
    { from: 'debt_amount', to: 'outstanding' },
    { from: 'ext_id', to: 'userId' },
  ];

  return (
    <div className="min-w-[280px] bg-[#18181B]/80 backdrop-blur-xl border border-white/5 rounded-[24px] shadow-2xl overflow-hidden group hover:border-violet-500/30 transition-all duration-500">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-gradient-to-r from-violet-500/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-2xl bg-violet-600 shadow-lg shadow-violet-600/20 border border-white/10">
              <Shuffle className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-violet-500 uppercase tracking-[0.2em] leading-none mb-1">Logic Engine</span>
               <span className="text-[14px] font-black text-white italic uppercase tracking-tight">Field Mapper</span>
            </div>
          </div>
          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-zinc-600 hover:text-white">
            <Cog className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="space-y-3">
             <div className="flex items-center justify-between px-1">
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.15em]">Active Registry</span>
                <div className="flex items-center gap-1.5 text-[9px] font-black text-violet-400 uppercase">
                    <Wand2 className="w-3 h-3" />
                    Auto-Resolved
                </div>
             </div>
             <div className="flex flex-col gap-2">
                {mappings.map((m, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-black/40 border border-white/5 group-hover:border-violet-500/10 transition-all duration-500">
                     <span className="text-[10px] text-zinc-500 font-bold tracking-tight italic">{m.from}</span>
                     <ArrowRight className="h-3 w-3 text-zinc-800 group-hover:text-violet-500 transition-colors" />
                     <span className="text-[11px] text-white font-black uppercase tracking-tighter">{m.to}</span>
                  </div>
                ))}
             </div>
          </div>
          
          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] font-black text-zinc-500 hover:text-white hover:bg-white/5 hover:border-violet-500/20 transition-all active:scale-[0.98]">
            Customize Mapping Schema
          </button>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-4 !h-4 !bg-violet-600 !border-4 !border-[#09090B] !shadow-xl"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-4 !h-4 !bg-violet-600 !border-4 !border-[#09090B] !shadow-xl"
      />
    </div>
  );
});

MapperNode.displayName = 'MapperNode';

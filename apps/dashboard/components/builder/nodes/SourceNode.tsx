'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, FileText, MoreHorizontal, Zap } from 'lucide-react';

export const SourceNode = memo(() => {
  return (
    <div className="min-w-[280px] bg-[#18181B]/80 backdrop-blur-xl border border-white/5 rounded-[24px] shadow-2xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-gradient-to-r from-emerald-500/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/20 border border-white/10">
              <Database className="h-5 w-5 text-white fill-current" />
            </div>
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] leading-none mb-1">Infrastructure</span>
               <span className="text-[14px] font-black text-white italic uppercase tracking-tight">Data Origin</span>
            </div>
          </div>
          <button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-zinc-600 hover:text-white">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-black/40 border border-white/5 group-hover:border-emerald-500/20 transition-all transition-colors duration-500">
             <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                   <FileText className="h-4 w-4" />
                </div>
                <div className="flex flex-col overflow-hidden">
                   <span className="text-[11px] font-black text-white uppercase tracking-tighter truncate">Refine_Portfolio_Q2.csv</span>
                   <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Active Ingestion</span>
                </div>
             </div>
             
             <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-black text-zinc-600 uppercase">Records Identified</span>
                <span className="text-[10px] font-black text-emerald-500 tracking-widest">12,482</span>
             </div>
          </div>
          
          <div className="space-y-3">
             <div className="flex items-center gap-2 px-1">
                <Zap className="h-3 w-3 text-emerald-500/40" />
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.15em]">Detected Schema</span>
             </div>
             <div className="flex flex-wrap gap-2">
                {['userId', 'mobile', 'overdue', 'product'].map(f => (
                  <span key={f} className="px-2.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[9px] text-emerald-500 font-black uppercase tracking-tighter">
                    {f}
                  </span>
                ))}
             </div>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-4 !h-4 !bg-emerald-500 !border-4 !border-[#09090B] !shadow-xl group-hover:scale-125 transition-transform"
      />
    </div>
  );
});

SourceNode.displayName = 'SourceNode';

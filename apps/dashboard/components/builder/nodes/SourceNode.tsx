'use memo';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Database, FileText, ChevronRight, MoreHorizontal } from 'lucide-react';

export const SourceNode = memo(() => {
  return (
    <div className="figma-node min-w-[240px]">
      <div className="flex flex-col">
        {/* Header - Zinc/Gray for Data */}
        <div className="flex items-center justify-between p-4 border-b border-[#E4E4E7] bg-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#F4F4F5] text-zinc-600 border border-[#E4E4E7]">
              <Database className="h-5 w-5 fill-zinc-600/10" />
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">DATA SOURCE</span>
               <span className="text-[13px] font-bold text-[#111827]">Portfolio Ingestion</span>
            </div>
          </div>
          <MoreHorizontal className="h-4 w-4 text-zinc-400" />
        </div>

        {/* Content - Source Details */}
        <div className="p-5 space-y-4">
          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#F9FAFB] border border-[#E4E4E7]">
             <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                   <FileText className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col overflow-hidden">
                   <span className="text-[11px] font-bold text-zinc-800 truncate">NBFC_Portfolio_Apr.csv</span>
                   <span className="text-[10px] text-zinc-500 font-medium">1,248 Records Found</span>
                </div>
             </div>
          </div>
          
          <div className="flex flex-col gap-2">
             <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Detected Fields</span>
             <div className="flex flex-wrap gap-1.5 font-mono">
                {['userId', 'mobile', 'overdue', 'product'].map(f => (
                  <span key={f} className="px-2 py-0.5 rounded-md bg-white border border-[#E1E1E1] text-[9px] text-zinc-600 font-semibold uppercase">
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
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white shadow-sm"
      />
    </div>
  );
});

SourceNode.displayName = 'SourceNode';

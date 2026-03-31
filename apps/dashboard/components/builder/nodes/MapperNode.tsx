'use memo';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Shuffle, ArrowRight, Cog } from 'lucide-react';

export const MapperNode = memo(() => {
  const mappings = [
    { from: 'phoneNumber', to: 'mobile' },
    { from: 'debt_amount', to: 'outstanding' },
    { from: 'ext_id', to: 'userId' },
  ];

  return (
    <div className="figma-node min-w-[240px]">
      <div className="flex flex-col">
        {/* Header - Purple for Logic/Transformation */}
        <div className="flex items-center justify-between p-4 border-b border-[#E4E4E7] bg-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 border border-purple-600/20">
              <Shuffle className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest leading-none">DATA TRANSFORMATION</span>
               <span className="text-[13px] font-bold text-[#111827]">Field Registry Mapper</span>
            </div>
          </div>
          <Cog className="h-4 w-4 text-zinc-400" />
        </div>

        {/* Content - Mappings List */}
        <div className="p-5 space-y-4">
          <div className="flex flex-col gap-2">
             <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Configured Mappings</span>
             <div className="flex flex-col gap-1.5">
                {mappings.map((m, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#F9FAFB] border border-[#E4E4E7] text-[10px] group transition-all hover:border-purple-200">
                     <span className="text-zinc-500 font-mono italic">{m.from}</span>
                     <ArrowRight className="h-2.5 w-2.5 text-zinc-300" />
                     <span className="text-purple-600 font-bold tracking-tight">{m.to}</span>
                  </div>
                ))}
             </div>
          </div>
          
          <button className="w-full py-2 rounded-xl bg-white border border-[#E4E4E7] text-[10px] font-bold text-zinc-600 hover:bg-[#F9FAFB] hover:border-purple-300 transition-all shadow-sm active:scale-95">
            Modify Field Registry
          </button>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-purple-600 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-purple-600 !border-2 !border-white"
      />
    </div>
  );
});

MapperNode.displayName = 'MapperNode';

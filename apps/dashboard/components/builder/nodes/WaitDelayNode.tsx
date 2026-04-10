'use client';
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Timer } from 'lucide-react';

export function WaitDelayNode({ data, id, selected }: any) {
  const hours = data.delayHours || 0;
  const displayTime = hours >= 24 ? `${Math.floor(hours/24)}d ${hours%24}h` : `${hours}h`;
  return (
    <div className={`bg-white border-2 rounded-xl shadow-lg min-w-[200px] overflow-hidden transition-all ${selected ? 'border-amber-500 ring-4 ring-amber-100' : 'border-amber-300'}`}>
      <div className="bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-2.5 flex items-center gap-2">
        <Timer className="w-4 h-4 text-white" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">Wait</span>
      </div>
      <div className="p-4 text-center">
        <p className="text-2xl font-bold text-amber-600">{displayTime}</p>
        {data.repeatIntervalDays > 0 && (
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Repeats every {data.repeatIntervalDays}d</p>
        )}
      </div>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white" />
    </div>
  );
}

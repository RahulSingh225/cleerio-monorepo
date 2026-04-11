'use client';
import React from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Timer } from 'lucide-react';

export function WaitDelayNode({ data, id, selected }: any) {
  const { updateNodeData } = useReactFlow();
  const hours = data.delayHours || 0;
  const repeat = data.repeatIntervalDays || 0;

  return (
    <div className={`bg-white border-2 rounded-xl shadow-lg min-w-[200px] overflow-hidden transition-all ${selected ? 'border-amber-500 ring-4 ring-amber-100' : 'border-amber-300'}`}>
      <div className="bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-2.5 flex items-center gap-2">
        <Timer className="w-4 h-4 text-white" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">Wait</span>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex justify-between">
            <span>Delay (Hours)</span>
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={hours}
            onChange={(e) => updateNodeData(id, { delayHours: parseInt(e.target.value) || 0 })}
            className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-white"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            Repeat Interval (Days)
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={repeat}
            onChange={(e) => updateNodeData(id, { repeatIntervalDays: parseInt(e.target.value) || 0 })}
            className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-white"
          />
          <p className="text-[9px] text-gray-400 mt-1">0 = No repeat</p>
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white" />
    </div>
  );
}

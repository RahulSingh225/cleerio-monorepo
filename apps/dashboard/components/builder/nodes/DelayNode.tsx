'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';

export function DelayNode({ data, id }: { data: any; id: string }) {
  return (
    <div className="bg-white border-2 border-amber-300 rounded-xl shadow-lg min-w-[220px] overflow-hidden">
      <div className="bg-amber-50 px-4 py-2 flex items-center gap-2 border-b border-amber-100">
        <Clock className="w-4 h-4 text-amber-600" />
        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Timing</span>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Delay (days)</label>
          <input
            type="number"
            min="0"
            max="365"
            value={data.delayDays || 0}
            onChange={(e) => data.onChange?.(id, { delayDays: parseInt(e.target.value) || 0 })}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Repeat (days interval)</label>
          <input
            type="number"
            min="0"
            max="90"
            value={data.repeatInterval || 0}
            onChange={(e) => data.onChange?.(id, { repeatInterval: parseInt(e.target.value) || 0 })}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />
          <p className="text-[9px] text-gray-400 mt-1">0 = no repeat</p>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Priority</label>
          <input
            type="number"
            min="1"
            max="10"
            value={data.priority || 1}
            onChange={(e) => data.onChange?.(id, { priority: parseInt(e.target.value) || 1 })}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
          />
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white" />
    </div>
  );
}

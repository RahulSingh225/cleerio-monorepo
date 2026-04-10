'use client';
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Target } from 'lucide-react';

export function SegmentTriggerNode({ data, id, selected }: any) {
  return (
    <div className={`bg-white border-2 rounded-xl shadow-lg min-w-[240px] overflow-hidden transition-all ${selected ? 'border-emerald-500 ring-4 ring-emerald-100' : 'border-emerald-300'}`}>
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-2.5 flex items-center gap-2">
        <Target className="w-4 h-4 text-white" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">Segment Trigger</span>
      </div>
      <div className="p-4">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{data.segmentName || 'Select segment...'}</p>
        {data.recordCount !== undefined && (
          <p className="text-[10px] text-emerald-600 font-medium mt-1">{data.recordCount.toLocaleString()} records</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white" />
    </div>
  );
}

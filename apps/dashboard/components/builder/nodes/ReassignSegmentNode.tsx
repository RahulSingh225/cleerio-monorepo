'use client';
import React, { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { ArrowRightLeft } from 'lucide-react';
import { api } from '@/lib/api';

export function ReassignSegmentNode({ data, id, selected }: any) {
  const { updateNodeData } = useReactFlow();
  const [segments, setSegments] = useState<any[]>([]);

  useEffect(() => {
    api.get('/segments')
      .then(res => setSegments(res.data.data || []))
      .catch(() => {});
  }, []);

  return (
    <div className={`bg-white border-2 rounded-xl shadow-lg min-w-[240px] overflow-hidden transition-all ${selected ? 'border-indigo-500 ring-4 ring-indigo-100' : 'border-indigo-200'}`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white" />
      
      <div className="bg-gradient-to-r from-indigo-500 to-indigo-400 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-white" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Reassign</span>
        </div>
      </div>

      <div className="p-4 bg-indigo-50/30">
        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Target Segment</label>
        <select
          value={data.targetSegmentId || ''}
          onChange={(e) => updateNodeData(id, { targetSegmentId: e.target.value })}
          className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white"
        >
          <option value="">Select Segment...</option>
          {segments.map(seg => (
            <option key={seg.id} value={seg.id}>{seg.name}</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-2">After this step, the borrower will be moved to the selected segment and this journey will end for them.</p>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white" />
    </div>
  );
}

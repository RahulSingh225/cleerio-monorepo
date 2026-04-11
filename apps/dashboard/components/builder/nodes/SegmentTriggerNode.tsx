'use client';
import React, { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { Target, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export function SegmentTriggerNode({ data, id, selected }: any) {
  const { updateNodeData } = useReactFlow();
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/segments')
      .then(res => setSegments(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const segmentId = e.target.value;
    const segment = segments.find(s => s.id === segmentId);
    if (segment) {
      updateNodeData(id, { 
        segmentId: segment.id, 
        segmentName: segment.name,
        recordCount: segment.recordCount 
      });
    } else {
      updateNodeData(id, { segmentId: '', segmentName: '', recordCount: 0 });
    }
  };

  return (
    <div className={`bg-white border-2 rounded-xl shadow-lg min-w-[240px] overflow-hidden transition-all ${selected ? 'border-emerald-500 ring-4 ring-emerald-100' : 'border-emerald-300'}`}>
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-2.5 flex items-center gap-2">
        <Target className="w-4 h-4 text-white" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">Segment Trigger</span>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Target Audience</label>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading segments...
          </div>
        ) : (
          <select 
            value={data.segmentId || ''} 
            onChange={handleChange}
            className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-white"
          >
            <option value="">-- Select Segment --</option>
            {segments.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.recordCount || 0})
              </option>
            ))}
          </select>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white" />
    </div>
  );
}

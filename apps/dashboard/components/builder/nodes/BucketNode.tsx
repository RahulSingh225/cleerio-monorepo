'use client';

import React, { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Layers } from 'lucide-react';
import { api } from '@/lib/api';

export function BucketNode({ data, id }: { data: any; id: string }) {
  const [buckets, setBuckets] = useState<any[]>([]);

  useEffect(() => {
    api.get('/dpd-bucket-configs').then(res => setBuckets(res.data.data || [])).catch(() => {});
  }, []);

  return (
    <div className="bg-white border-2 border-emerald-300 rounded-xl shadow-lg min-w-[220px] overflow-hidden">
      <div className="bg-emerald-50 px-4 py-2 flex items-center gap-2 border-b border-emerald-100">
        <Layers className="w-4 h-4 text-emerald-600" />
        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">DPD Bucket</span>
      </div>
      <div className="p-4">
        <select
          value={data.bucketId || ''}
          onChange={(e) => data.onChange?.(id, { bucketId: e.target.value, bucketName: e.target.options[e.target.selectedIndex].text })}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-white"
        >
          <option value="">Select bucket...</option>
          {buckets.map(b => (
            <option key={b.id} value={b.id}>{b.bucketName} ({b.dpdMin}–{b.dpdMax})</option>
          ))}
        </select>
        {data.bucketName && (
          <p className="text-[10px] text-emerald-600 mt-2 font-medium">Selected: {data.bucketName}</p>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white" />
    </div>
  );
}

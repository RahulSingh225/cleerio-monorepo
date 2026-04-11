'use client';
import React from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export function ConditionCheckNode({ data, id, selected }: any) {
  const { updateNodeData } = useReactFlow();

  return (
    <div className={`bg-white border-2 rounded-xl shadow-lg min-w-[220px] overflow-hidden transition-all ${selected ? 'border-purple-500 ring-4 ring-purple-100' : 'border-purple-300'}`}>
      <div className="bg-gradient-to-r from-purple-500 to-purple-400 px-4 py-2.5 flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-white" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">Condition</span>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Logic Label</label>
          <input
            type="text"
            value={data.conditionLabel || ''}
            placeholder="e.g. Replied Yes?"
            onChange={(e) => updateNodeData(id, { conditionLabel: e.target.value })}
            className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 bg-white"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex-1 px-2 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
            <p className="text-[9px] font-bold text-emerald-600 uppercase">Yes</p>
          </div>
          <div className="flex-1 px-2 py-1.5 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-[9px] font-bold text-red-500 uppercase">No</p>
          </div>
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} id="yes" style={{ left: '30%' }} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} id="no" style={{ left: '70%' }} className="!w-3 !h-3 !bg-red-500 !border-2 !border-white" />
    </div>
  );
}

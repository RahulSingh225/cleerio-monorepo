'use client';
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { CheckCircle, XCircle, UserCheck } from 'lucide-react';

export function EndSuccessNode({ data, selected }: any) {
  return (
    <div className={`bg-white border-2 rounded-xl shadow-lg min-w-[180px] overflow-hidden transition-all ${selected ? 'border-green-500 ring-4 ring-green-100' : 'border-green-300'}`}>
      <div className="bg-gradient-to-r from-green-500 to-emerald-400 px-4 py-2.5 flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-white" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">Success</span>
      </div>
      <div className="p-4 text-center">
        <p className="text-sm text-[var(--text-secondary)]">{data.label || 'Journey completed'}</p>
      </div>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-green-500 !border-2 !border-white" />
    </div>
  );
}

export function EndFailureNode({ data, selected }: any) {
  return (
    <div className={`bg-white border-2 rounded-xl shadow-lg min-w-[180px] overflow-hidden transition-all ${selected ? 'border-red-500 ring-4 ring-red-100' : 'border-red-300'}`}>
      <div className="bg-gradient-to-r from-red-500 to-rose-400 px-4 py-2.5 flex items-center gap-2">
        <XCircle className="w-4 h-4 text-white" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">Escalate</span>
      </div>
      <div className="p-4 text-center">
        <p className="text-sm text-[var(--text-secondary)]">{data.label || 'Escalate to agent'}</p>
      </div>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-red-500 !border-2 !border-white" />
    </div>
  );
}

export function ManualReviewNode({ data, selected }: any) {
  return (
    <div className={`bg-white border-2 rounded-xl shadow-lg min-w-[200px] overflow-hidden transition-all ${selected ? 'border-orange-500 ring-4 ring-orange-100' : 'border-orange-300'}`}>
      <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2.5 flex items-center gap-2">
        <UserCheck className="w-4 h-4 text-white" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">Manual Review</span>
      </div>
      <div className="p-4 text-center">
        <p className="text-sm text-[var(--text-secondary)]">{data.label || 'Flag for human review'}</p>
      </div>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-orange-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-orange-500 !border-2 !border-white" />
    </div>
  );
}

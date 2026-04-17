'use client';
import React from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export function ConditionCheckNode({ data, id, selected }: any) {
  const { updateNodeData } = useReactFlow();

  const rules = data.rules || [];
  const operator = data.operator || 'AND';

  const addRule = () => {
    updateNodeData(id, {
      rules: [...rules, { field: '', operator: '===', value: '' }]
    });
  };

  const updateRule = (index: number, updates: any) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };
    updateNodeData(id, { rules: newRules });
  };

  const removeRule = (index: number) => {
    updateNodeData(id, { rules: rules.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className={`bg-white border-2 rounded-xl shadow-lg min-w-[320px] overflow-hidden transition-all ${selected ? 'border-purple-500 ring-4 ring-purple-100' : 'border-purple-300'}`}>
      <div className="bg-gradient-to-r from-purple-500 to-purple-400 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-white" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Condition</span>
        </div>
        <select 
          value={operator}
          onChange={(e) => updateNodeData(id, { operator: e.target.value })}
          className="bg-white/20 text-white text-[10px] font-bold border-none rounded px-1.5 py-0.5 focus:ring-0"
        >
          <option value="AND" className="text-gray-900">AND</option>
          <option value="OR" className="text-gray-900">OR</option>
        </select>
      </div>

      <div className="p-4 space-y-4">
        {/* Rules List */}
        <div className="space-y-2">
          {rules.length === 0 ? (
            <p className="text-[10px] text-gray-400 text-center py-2 bg-gray-50 rounded-lg border border-dashed border-gray-200">No rules defined. Always follows "Yes".</p>
          ) : (
            rules.map((rule: any, i: number) => (
              <div key={i} className="flex flex-col gap-1.5 p-2 bg-gray-50 rounded-lg border border-gray-100 relative group">
                <div className="flex gap-1">
                  <input
                    placeholder="Field"
                    value={rule.field}
                    onChange={(e) => updateRule(i, { field: e.target.value })}
                    className="flex-1 text-[10px] border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                  <select
                    value={rule.operator}
                    onChange={(e) => updateRule(i, { operator: e.target.value })}
                    className="w-16 text-[10px] border border-gray-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400"
                  >
                    <option value="===">==</option>
                    <option value="!==">!=</option>
                    <option value=">">&gt;</option>
                    <option value="<">&lt;</option>
                    <option value="contains">inc</option>
                    <option value="has_ptp">PTP?</option>
                  </select>
                  <input
                    placeholder="Value"
                    value={rule.value}
                    onChange={(e) => updateRule(i, { value: e.target.value })}
                    className="flex-1 text-[10px] border border-gray-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                </div>
                <button 
                  onClick={() => removeRule(i)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="text-[10px]">×</span>
                </button>
              </div>
            ))
          )}
        </div>

        <button 
          onClick={addRule}
          className="w-full py-1.5 text-[10px] font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors uppercase tracking-wider"
        >
          + Add Rule
        </button>

        <div className="flex gap-2 pt-1 border-t border-gray-100">
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

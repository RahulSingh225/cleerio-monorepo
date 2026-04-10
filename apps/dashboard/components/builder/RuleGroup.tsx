'use client';

import React from 'react';
import { Plus, FolderPlus, Trash2 } from 'lucide-react';
import type { CriteriaGroup, CriteriaCondition } from './types';
import { isGroup, createEmptyCondition, createEmptyGroup } from './types';
import { RuleCondition } from './RuleCondition';

interface FieldOption {
  key: string;
  label: string;
  dataType: string;
}

interface RuleGroupProps {
  group: CriteriaGroup;
  fields: FieldOption[];
  onChange: (updated: CriteriaGroup) => void;
  onDelete?: () => void;
  depth?: number;
}

const DEPTH_COLORS = [
  { border: 'border-l-blue-400', bg: 'bg-blue-50/50', pill: 'bg-blue-100 text-blue-700 border-blue-200' },
  { border: 'border-l-purple-400', bg: 'bg-purple-50/50', pill: 'bg-purple-100 text-purple-700 border-purple-200' },
  { border: 'border-l-teal-400', bg: 'bg-teal-50/50', pill: 'bg-teal-100 text-teal-700 border-teal-200' },
  { border: 'border-l-orange-400', bg: 'bg-orange-50/50', pill: 'bg-orange-100 text-orange-700 border-orange-200' },
];

export function RuleGroup({ group, fields, onChange, onDelete, depth = 0 }: RuleGroupProps) {
  const colors = DEPTH_COLORS[depth % DEPTH_COLORS.length];

  const toggleLogic = () => {
    onChange({ ...group, logic: group.logic === 'AND' ? 'OR' : 'AND' });
  };

  const addCondition = () => {
    onChange({ ...group, conditions: [...group.conditions, createEmptyCondition()] });
  };

  const addGroup = () => {
    onChange({ ...group, conditions: [...group.conditions, createEmptyGroup()] });
  };

  const updateCondition = (index: number, updated: CriteriaCondition | CriteriaGroup) => {
    const newConditions = [...group.conditions];
    newConditions[index] = updated;
    onChange({ ...group, conditions: newConditions });
  };

  const deleteCondition = (index: number) => {
    onChange({ ...group, conditions: group.conditions.filter((_, i) => i !== index) });
  };

  return (
    <div className={`border-l-[3px] ${colors.border} rounded-r-lg ${colors.bg} p-4 space-y-3 animate-fade-in`}>
      {/* Group header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logic toggle */}
          <button
            onClick={toggleLogic}
            className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all hover:scale-105 active:scale-95 ${colors.pill}`}
          >
            {group.logic}
          </button>
          <span className="text-[10px] text-[var(--text-tertiary)] font-medium">
            {group.logic === 'AND' ? 'All conditions must match' : 'Any condition must match'}
          </span>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Conditions */}
      <div className="space-y-2">
        {group.conditions.map((cond, i) => (
          <div key={i}>
            {i > 0 && (
              <div className="flex items-center gap-2 py-1">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${colors.pill}`}>
                  {group.logic}
                </span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>
            )}
            {isGroup(cond) ? (
              <RuleGroup
                group={cond}
                fields={fields}
                onChange={(updated) => updateCondition(i, updated)}
                onDelete={() => deleteCondition(i)}
                depth={depth + 1}
              />
            ) : (
              <RuleCondition
                condition={cond}
                fields={fields}
                onChange={(updated) => updateCondition(i, updated)}
                onDelete={() => deleteCondition(i)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Add buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={addCondition}
          className="flex items-center gap-1.5 text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] px-2.5 py-1.5 rounded-lg hover:bg-[var(--primary-light)] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Condition
        </button>
        <button
          onClick={addGroup}
          className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
        >
          <FolderPlus className="w-3.5 h-3.5" /> Add Group
        </button>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { CriteriaCondition } from './types';

const OPERATORS: Record<string, { label: string; types: string[] }> = {
  eq: { label: 'equals', types: ['string', 'number', 'date', 'boolean'] },
  neq: { label: 'not equals', types: ['string', 'number', 'date', 'boolean'] },
  gt: { label: '>', types: ['number', 'date'] },
  gte: { label: '≥', types: ['number', 'date'] },
  lt: { label: '<', types: ['number', 'date'] },
  lte: { label: '≤', types: ['number', 'date'] },
  between: { label: 'between', types: ['number'] },
  in: { label: 'in list', types: ['string'] },
  not_in: { label: 'not in list', types: ['string'] },
  contains: { label: 'contains', types: ['string'] },
};

interface FieldOption {
  key: string;
  label: string;
  dataType: string;
  isCore?: boolean;
}

interface RuleConditionProps {
  condition: CriteriaCondition;
  fields: FieldOption[];
  onChange: (updated: CriteriaCondition) => void;
  onDelete: () => void;
}

export function RuleCondition({ condition, fields, onChange, onDelete }: RuleConditionProps) {
  const selectedField = fields.find((f) => f.key === condition.field);
  const fieldType = selectedField?.dataType || 'string';
  const availableOps = Object.entries(OPERATORS).filter(([, v]) => v.types.includes(fieldType));

  return (
    <div className="flex items-center gap-2 group animate-fade-in">
      <GripVertical className="w-3.5 h-3.5 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 cursor-grab transition-opacity flex-shrink-0" />

      {/* Field selector */}
      <select
        value={condition.field}
        onChange={(e) => onChange({ ...condition, field: e.target.value, value: '' })}
        className="flex-1 min-w-[140px] text-sm border border-[var(--border)] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-30 focus:border-[var(--primary)] transition-colors"
      >
        <option value="">Select field...</option>
        {fields.filter(f => f.isCore).length > 0 && (
          <optgroup label="Core Fields">
            {fields.filter(f => f.isCore).map((f) => (
              <option key={f.key} value={f.key}>
                {f.label} ({f.dataType})
              </option>
            ))}
          </optgroup>
        )}
        {fields.filter(f => !f.isCore).length > 0 && (
          <optgroup label="Dynamic Fields">
            {fields.filter(f => !f.isCore).map((f) => (
              <option key={f.key} value={f.key}>
                {f.label} ({f.dataType})
              </option>
            ))}
          </optgroup>
        )}
      </select>

      {/* Operator */}
      <select
        value={condition.operator}
        onChange={(e) => onChange({ ...condition, operator: e.target.value as any })}
        className="w-[120px] text-sm border border-[var(--border)] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-30 focus:border-[var(--primary)] transition-colors"
      >
        {availableOps.map(([key, val]) => (
          <option key={key} value={key}>{val.label}</option>
        ))}
      </select>

      {/* Value input */}
      {condition.operator === 'between' ? (
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            placeholder="Min"
            value={Array.isArray(condition.value) ? condition.value[0] || '' : ''}
            onChange={(e) => {
              const arr = Array.isArray(condition.value) ? [...condition.value] : ['', ''];
              arr[0] = Number(e.target.value);
              onChange({ ...condition, value: arr });
            }}
            className="w-20 text-sm border border-[var(--border)] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-30 focus:border-[var(--primary)] transition-colors"
          />
          <span className="text-xs text-[var(--text-tertiary)]">–</span>
          <input
            type="number"
            placeholder="Max"
            value={Array.isArray(condition.value) ? condition.value[1] || '' : ''}
            onChange={(e) => {
              const arr = Array.isArray(condition.value) ? [...condition.value] : ['', ''];
              arr[1] = Number(e.target.value);
              onChange({ ...condition, value: arr });
            }}
            className="w-20 text-sm border border-[var(--border)] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-30 focus:border-[var(--primary)] transition-colors"
          />
        </div>
      ) : (
        <input
          type={fieldType === 'number' ? 'number' : 'text'}
          placeholder="Value"
          value={condition.value || ''}
          onChange={(e) =>
            onChange({ ...condition, value: fieldType === 'number' ? Number(e.target.value) : e.target.value })
          }
          className="flex-1 min-w-[120px] text-sm border border-[var(--border)] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-30 focus:border-[var(--primary)] transition-colors"
        />
      )}

      {/* Delete */}
      <button
        onClick={onDelete}
        className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

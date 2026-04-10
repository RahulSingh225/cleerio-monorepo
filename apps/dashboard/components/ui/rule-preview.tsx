'use client';

import React from 'react';
import type { CriteriaGroup, CriteriaCondition } from '../builder/types';

const OPERATOR_LABELS: Record<string, string> = {
  eq: '=', neq: '≠', gt: '>', gte: '≥', lt: '<', lte: '≤',
  in: 'in', not_in: 'not in', contains: 'contains', between: 'between',
};

interface RulePreviewProps {
  criteria: CriteriaGroup;
  compact?: boolean;
}

function isGroup(c: any): c is CriteriaGroup {
  return c && 'logic' in c && 'conditions' in c;
}

function formatValue(value: any): string {
  if (Array.isArray(value)) {
    if (value.length === 2 && typeof value[0] === 'number') return `${value[0]} – ${value[1]}`;
    return `[${value.join(', ')}]`;
  }
  return String(value);
}

function RuleNode({ node, depth = 0 }: { node: CriteriaCondition | CriteriaGroup; depth?: number }) {
  const colors = ['border-blue-300', 'border-purple-300', 'border-teal-300', 'border-orange-300'];
  const bgColors = ['bg-blue-50', 'bg-purple-50', 'bg-teal-50', 'bg-orange-50'];
  const pillColors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-teal-100 text-teal-700', 'bg-orange-100 text-orange-700'];
  const colorIdx = depth % colors.length;

  if (isGroup(node)) {
    if (node.conditions.length === 0) {
      return <span className="text-xs text-[var(--text-tertiary)] italic">No conditions</span>;
    }
    return (
      <div className={`border-l-2 ${colors[colorIdx]} pl-3 space-y-1.5 ${depth > 0 ? 'mt-1.5' : ''}`}>
        {node.conditions.map((cond, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${pillColors[colorIdx]} uppercase tracking-wider`}>
                {node.logic}
              </span>
            )}
            <RuleNode node={cond} depth={depth + 1} />
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Leaf condition
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <code className="px-1.5 py-0.5 bg-[var(--surface-secondary)] rounded text-[var(--primary)] font-semibold">
        {node.field}
      </code>
      <span className="text-[var(--text-tertiary)] font-medium">{OPERATOR_LABELS[node.operator] || node.operator}</span>
      <code className="px-1.5 py-0.5 bg-amber-50 rounded text-amber-700 font-semibold">
        {formatValue(node.value)}
      </code>
    </div>
  );
}

export function RulePreview({ criteria, compact }: RulePreviewProps) {
  if (!criteria || !criteria.conditions || criteria.conditions.length === 0) {
    return <span className="text-xs text-[var(--text-tertiary)] italic">Match all records (no criteria)</span>;
  }
  return <RuleNode node={criteria} />;
}

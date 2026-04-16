'use client';

import React, { useState, useEffect } from 'react';
import type { CriteriaGroup } from './types';
import { createEmptyGroup } from './types';
import { RuleGroup } from './RuleGroup';
import { Eye, Code, RefreshCw } from 'lucide-react';

interface FieldOption {
  key: string;
  label: string;
  dataType: string;
}

interface SegmentRuleBuilderProps {
  fieldRegistry?: FieldOption[];
  initialCriteria?: CriteriaGroup;
  onChange: (criteria: CriteriaGroup) => void;
  showPreview?: boolean;
}

export function SegmentRuleBuilder({
  fieldRegistry = [],
  initialCriteria,
  onChange,
  showPreview = true,
}: SegmentRuleBuilderProps) {
  const [criteria, setCriteria] = useState<CriteriaGroup>(
    initialCriteria || createEmptyGroup('AND')
  );
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    onChange(criteria);
  }, [criteria]);

  return (
    <div className="space-y-4">
      {/* Builder header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Segment Criteria</h3>
          <span className="text-[10px] px-2 py-0.5 bg-[var(--surface-secondary)] text-[var(--text-tertiary)] rounded-full font-medium">
            {countConditions(criteria)} condition{countConditions(criteria) !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {showPreview && (
            <button
              onClick={() => setShowJson(!showJson)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                showJson
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              JSON
            </button>
          )}
        </div>
      </div>

      {/* Rule builder tree */}
      <RuleGroup
        group={criteria}
        fields={fieldRegistry}
        onChange={setCriteria}
        depth={0}
      />

      {/* JSON Preview */}
      {showJson && (
        <div className="card p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
              Generated criteria_jsonb
            </span>
          </div>
          <pre className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--surface-secondary)] rounded-lg p-4 overflow-x-auto max-h-64 overflow-y-auto">
            {JSON.stringify(criteria, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function countConditions(group: CriteriaGroup): number {
  if (!group || !group.conditions) return 0;
  let count = 0;
  for (const cond of group.conditions) {
    if ('logic' in cond) {
      count += countConditions(cond as CriteriaGroup);
    } else {
      count++;
    }
  }
  return count;
}

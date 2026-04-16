'use client';
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { SegmentRuleBuilder } from '@/components/builder/SegmentRuleBuilder';
import { X, Loader2 } from 'lucide-react';

export function ConditionConfigPanel({ isOpen, onClose, initialCondition, onSave }: any) {
  const [dataPoints, setDataPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [criteria, setCriteria] = useState<any>(initialCondition);

  useEffect(() => {
    if (isOpen) {
      setCriteria(initialCondition);
      loadDataPoints();
    }
  }, [isOpen, initialCondition]);

  const loadDataPoints = async () => {
    setLoading(true);
    try {
      // Assuming tenantId is available or intercepted, or hardcode generic path
      const res = await api.get('/tenant/placeholder/data-points');
      const groups = res.data.data || [];
      
      // Flatten the grouped data points for the rule builder
      const flatFields: any[] = [];
      groups.forEach((group: any) => {
        group.fields.forEach((field: any) => {
          flatFields.push({
            key: field.key,
            label: `${group.group} - ${field.label}`,
            dataType: field.type === 'enum' ? 'string' : (field.type === 'datetime' ? 'date' : field.type),
            isCore: !field.isDynamic
          });
        });
      });
      
      setDataPoints(flatFields);
    } catch (err) {
      console.error('Failed to load data points', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-2xl border-l border-[var(--border)] z-50 flex flex-col animate-fade-in">
      <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Configure Condition</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Build branching logic based on borrower data</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
          </div>
        ) : (
          <SegmentRuleBuilder
            fieldRegistry={dataPoints}
            initialCriteria={criteria}
            onChange={setCriteria}
            showPreview={false}
          />
        )}
      </div>

      <div className="p-5 border-t border-[var(--border)] bg-gray-50 flex justify-end gap-3">
        <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] border border-[var(--border)] rounded-lg hover:bg-white transition-colors bg-white">
          Cancel
        </button>
        <button
          onClick={() => onSave(criteria)}
          className="px-6 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors shadow-sm"
        >
          Save Condition
        </button>
      </div>
    </div>
  );
}

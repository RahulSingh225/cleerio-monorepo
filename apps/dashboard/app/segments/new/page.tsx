'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { SegmentRuleBuilder } from '@/components/builder/SegmentRuleBuilder';
import type { CriteriaGroup } from '@/components/builder/types';
import { createEmptyGroup } from '@/components/builder/types';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewSegmentPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(100);
  const [criteria, setCriteria] = useState<CriteriaGroup>(createEmptyGroup('AND'));
  const [fields, setFields] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/tenant-field-registry')
      .then(res => setFields((res.data.data || []).map((f: any) => ({
        key: f.fieldKey,
        label: f.displayLabel || f.headerName,
        dataType: f.dataType || 'string',
      }))))
      .catch(() => {});
  }, []);

  // Auto-generate code from name
  useEffect(() => {
    if (name && !code) {
      setCode(name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''));
    }
  }, [name]);

  const handleSave = async () => {
    if (!name || !code) return;
    setSaving(true);
    try {
      await api.post('/segments', {
        name,
        code,
        description,
        priority,
        criteriaJsonb: criteria,
      });
      router.push('/segments');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create segment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/segments">
          <button className="p-2 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <PageHeader
          title="Create Segment"
          subtitle="Define targeting criteria for a group of borrowers."
        />
      </div>

      {/* Basic Info */}
      <div className="card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Segment Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., High Risk 30-60 DPD"
              className="w-full text-sm border border-[var(--border)] rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-30 focus:border-[var(--primary)]"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Code *</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="high_risk_30_60"
              className="w-full text-sm border border-[var(--border)] rounded-lg px-3 py-2.5 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-30 focus:border-[var(--primary)]"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this segment's purpose..."
            rows={2}
            className="w-full text-sm border border-[var(--border)] rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-30 focus:border-[var(--primary)] resize-none"
          />
        </div>
        <div className="w-32">
          <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1.5">Priority</label>
          <input
            type="number"
            value={priority}
            onChange={(e) => setPriority(parseInt(e.target.value) || 100)}
            min={1}
            className="w-full text-sm border border-[var(--border)] rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-30 focus:border-[var(--primary)]"
          />
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Lower = evaluated first</p>
        </div>
      </div>

      {/* Rule Builder */}
      <div className="card p-6">
        <SegmentRuleBuilder
          fieldRegistry={fields}
          initialCriteria={criteria}
          onChange={setCriteria}
          showPreview
        />
      </div>

      {/* Save */}
      <div className="flex justify-end gap-3">
        <Link href="/segments">
          <button className="px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
            Cancel
          </button>
        </Link>
        <button
          onClick={handleSave}
          disabled={saving || !name || !code}
          className="flex items-center gap-2 px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-sm disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Create Segment'}
        </button>
      </div>
    </div>
  );
}

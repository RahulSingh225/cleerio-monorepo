'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { SegmentRuleBuilder } from '@/components/builder/SegmentRuleBuilder';
import type { CriteriaGroup } from '@/components/builder/types';
import { createEmptyGroup, evaluateCriteria } from '@/components/builder/types';
import { Save, Loader2, ArrowLeft, Users, Target, AlertCircle, Pencil } from 'lucide-react';
import Link from 'next/link';

export default function NewSegmentPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>}>
      <NewSegmentPage />
    </Suspense>
  );
}

function NewSegmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit'); // ?edit=<segmentId> to enable edit mode

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(100);
  const [criteria, setCriteria] = useState<CriteriaGroup>(createEmptyGroup('AND'));
  const [fields, setFields] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Live preview state
  const [previewRecords, setPreviewRecords] = useState<any[]>([]);
  const [previewLoading, setPreviewLoading] = useState(true);

  const [otherSegments, setOtherSegments] = useState<any[]>([]);
  const [overlapError, setOverlapError] = useState<{count: number, names: string[]} | null>(null);

  // Load available fields from actual portfolio data (not field registry)
  useEffect(() => {
    // Get all available fields by introspecting actual portfolio record data
    api.get('/portfolio-records/fields')
      .then(res => {
        const allFields = res.data.data || [];
        setFields(allFields);
      })
      .catch((err) => {
        console.warn('Failed to load portfolio fields, using fallback core fields', err);
        // Fallback to core fields only
        setFields([
          { key: 'current_dpd', label: 'Current DPD', dataType: 'number', isCore: true },
          { key: 'outstanding', label: 'Outstanding Amount', dataType: 'number', isCore: true },
          { key: 'total_repaid', label: 'Total Repaid', dataType: 'number', isCore: true },
          { key: 'product', label: 'Product / Loan Type', dataType: 'string', isCore: true },
        ]);
      });

    // Load ALL active segments for overlap validation
    api.get('/segments')
      .then(res => {
        const segmentsList = res.data.data || [];
        // Exclude the one being edited, and exclude default catch-all "Others"
        const others = segmentsList.filter((s: any) => s.isActive && !s.isDefault && s.id !== editId);
        setOtherSegments(others);
      })
      .catch(() => console.warn('Failed to load other segments for overlap check'));

    // Load portfolio records for live coverage preview
    loadRecordsForPreview();
  }, [editId]);

  // If editing, load existing segment
  useEffect(() => {
    if (editId) {
      setIsEditMode(true);
      api.get(`/segments/${editId}`)
        .then(res => {
          const seg = res.data.data;
          setName(seg.name || '');
          setCode(seg.code || '');
          setDescription(seg.description || '');
          setPriority(seg.priority || 100);
          if (seg.criteriaJsonb) {
            setCriteria(seg.criteriaJsonb);
          }
        })
        .catch(() => {
          alert('Failed to load segment for editing.');
        })
        .finally(() => setInitialLoading(false));
    } else {
      setInitialLoading(false);
    }
  }, [editId]);

  const loadRecordsForPreview = async () => {
    setPreviewLoading(true);
    try {
      // Try to get records from the most recent portfolio
      const pRes = await api.get('/portfolios');
      const portfolios = pRes.data.data || [];
      if (portfolios.length > 0) {
        // Get the most recent completed portfolio
        const completed = portfolios.find((p: any) => p.status === 'completed') || portfolios[0];
        const rRes = await api.get(`/portfolio-records/portfolio/${completed.id}?limit=2000`);
        setPreviewRecords(rRes.data.data || []);
      } else {
        setPreviewRecords([]);
      }
    } catch {
      setPreviewRecords([]);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Auto-generate code from name (only in create mode)
  useEffect(() => {
    if (name && !code && !isEditMode) {
      setCode(name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''));
    }
  }, [name]);

  // Live match count & MECE Overlap Check
  const matchResult = useMemo(() => {
    setOverlapError(null);
    if (previewRecords.length === 0) return { matched: 0, total: 0 };
    const hasConditions = criteria.conditions.length > 0 && 
      criteria.conditions.some(c => 'field' in c ? (c as any).field !== '' : true);
    if (!hasConditions) return { matched: 0, total: previewRecords.length };

    let matched = 0;
    let overlaps = 0;
    const overlappingSegmentNames = new Set<string>();

    for (const record of previewRecords) {
      // Build a flat record: core columns (snake_case) + all dynamic_fields keys
      const flatRecord: Record<string, any> = {
        current_dpd: record.currentDpd,
        outstanding: record.outstanding,
        total_repaid: record.totalRepaid,
        product: record.product,
        employer_id: record.employerId,
        name: record.name,
        mobile: record.mobile,
        user_id: record.userId,
        // Spread ALL dynamic fields — these are the extra portfolio columns
        ...(record.dynamicFields || {}),
      };
      
      try {
        if (evaluateCriteria(criteria, flatRecord)) {
          matched++;
          // Check MECE overlap
          let recordOverlaps = false;
          for (const otherSeg of otherSegments) {
            if (otherSeg.criteriaJsonb && evaluateCriteria(otherSeg.criteriaJsonb, flatRecord)) {
              overlappingSegmentNames.add(otherSeg.name);
              recordOverlaps = true;
            }
          }
          if (recordOverlaps) overlaps++;
        }
      } catch { /* skip eval errors */ }
    }

    if (overlaps > 0) {
      setOverlapError({
        count: overlaps,
        names: Array.from(overlappingSegmentNames),
      });
    }

    return { matched, total: previewRecords.length };
  }, [criteria, previewRecords, otherSegments]);

  const handleSave = async () => {
    if (!name || !code) return;
    setSaving(true);
    try {
      if (isEditMode && editId) {
        await api.put(`/segments/${editId}`, {
          name,
          code,
          description,
          priority,
          criteriaJsonb: criteria,
        });
      } else {
        await api.post('/segments', {
          name,
          code,
          description,
          priority,
          criteriaJsonb: criteria,
        });
      }
      router.push('/segments');
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} segment`);
    } finally {
      setSaving(false);
    }
  };

  const matchPct = matchResult.total > 0 ? ((matchResult.matched / matchResult.total) * 100).toFixed(1) : '0';
  const unmatchedCount = matchResult.total - matchResult.matched;

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/segments">
          <button className="p-2 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <PageHeader
          title={isEditMode ? 'Edit Segment' : 'Create Segment'}
          subtitle={isEditMode ? `Editing: ${name}` : 'Define targeting criteria for a group of borrowers.'}
        />
        {isEditMode && (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-amber-200 ml-auto flex items-center gap-1">
            <Pencil className="w-3 h-3" />
            Edit Mode
          </span>
        )}
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
              disabled={isEditMode}
              className="w-full text-sm border border-[var(--border)] rounded-lg px-3 py-2.5 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-30 focus:border-[var(--primary)] disabled:opacity-60 disabled:bg-gray-50"
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

      {/* Available Fields Info */}
      {fields.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Available Fields ({fields.length})</h3>
            <span className="text-[10px] text-[var(--text-tertiary)]">
              {fields.filter(f => f.isCore).length} core + {fields.filter(f => !f.isCore).length} from portfolio
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {fields.map(f => (
              <span
                key={f.key}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border ${
                  f.isCore 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${f.isCore ? 'bg-blue-400' : 'bg-purple-400'}`} />
                {f.label}
                <span className="text-[8px] opacity-60">({f.dataType})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rule Builder */}
      <div className="card p-6">
        <SegmentRuleBuilder
          fieldRegistry={fields}
          initialCriteria={criteria}
          onChange={setCriteria}
          showPreview
        />
      </div>

      {/* Live Match Preview — Full Coverage */}
      <div className="card p-5 border-l-4 border-l-[var(--primary)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Live Coverage Preview</h3>
              <p className="text-xs text-[var(--text-tertiary)]">
                {previewLoading ? 'Loading records...' : `Filtering ${matchResult.total.toLocaleString()} portfolio records against segment rules`}
              </p>
            </div>
          </div>
          {!previewLoading && (
            <div className="flex items-center gap-4">
              {/* Matched */}
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                <Users className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-lg font-bold text-emerald-700">{matchResult.matched.toLocaleString()}</p>
                  <p className="text-[9px] font-medium text-emerald-500 uppercase tracking-wider">Matched ({matchPct}%)</p>
                </div>
              </div>
              {/* Unmatched */}
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <div>
                  <p className="text-lg font-bold text-amber-700">{unmatchedCount.toLocaleString()}</p>
                  <p className="text-[9px] font-medium text-amber-500 uppercase tracking-wider">Unmatched</p>
                </div>
              </div>
            </div>
          )}
          {previewLoading && (
            <Loader2 className="w-5 h-5 animate-spin text-[var(--text-tertiary)]" />
          )}
        </div>
        {/* Match bar */}
        {!previewLoading && matchResult.total > 0 && (
          <div className="mt-3 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${matchPct}%` }}
            />
          </div>
        )}
        {overlapError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800">MECE Overlap Detected</p>
              <p className="text-xs text-red-700 mt-1">
                Your segment is not mutually exclusive. <strong>{overlapError.count} records</strong> match both this rule and the following active segments:
              </p>
              <ul className="list-disc ml-4 mt-1 text-xs text-red-700 font-medium">
                {overlapError.names.map(n => <li key={n}>{n}</li>)}
              </ul>
              <p className="text-xs text-red-600 mt-1.5 italic">Adjust your criteria to ensure no borrower falls into multiple active segments.</p>
            </div>
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end gap-3 mt-8">
        <Link href="/segments">
          <button className="px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
            Cancel
          </button>
        </Link>
        <button
          onClick={handleSave}
          disabled={saving || !name || !code || !!overlapError}
          className="flex items-center gap-2 px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          title={overlapError ? "Cannot save while overlap exists" : ""}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : isEditMode ? 'Update Segment' : 'Create Segment'}
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { CircularProgress } from '@/components/ui/circular-progress';
import { RulePreview } from '@/components/ui/rule-preview';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { Target, Plus, Loader2, MoreVertical, Users, Zap, ToggleLeft, ToggleRight, Trash2, Copy } from 'lucide-react';

export default function SegmentsPage() {
  const [segments, setSegments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchSegments(); }, []);

  const fetchSegments = async () => {
    try {
      const res = await api.get('/segments');
      setSegments(res.data.data || []);
    } catch (err) { console.error('Failed to load segments'); }
    finally { setIsLoading(false); }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      await api.put(`/segments/${id}`, { isActive: !currentActive });
      fetchSegments();
    } catch (err) { alert('Failed to toggle segment.'); }
  };

  const totalRecords = segments.reduce((sum, s) => sum + (s.recordCount || 0), 0);
  const avgSuccess = segments.length > 0
    ? segments.reduce((sum, s) => sum + Number(s.successRate || 0), 0) / segments.length
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Segments"
        subtitle="Define targeting criteria to group borrowers for automated journeys."
        actions={
          <Link href="/segments/new">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Create Segment
            </button>
          </Link>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Total Segments</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{segments.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{segments.filter(s => s.isActive).length}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Total Records</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{totalRecords.toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Avg Success Rate</p>
          <p className="text-2xl font-bold text-[var(--primary)] mt-1">{avgSuccess.toFixed(1)}%</p>
        </div>
      </div>

      {/* Segment Cards */}
      {segments.length === 0 ? (
        <EmptyState
          icon={<Target className="w-7 h-7" />}
          title="No Segments Created"
          description="Create your first segment to start targeting borrowers with automated collection journeys."
          action={
            <Link href="/segments/new">
              <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors">
                Create First Segment
              </button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {segments.map((seg, i) => (
            <Link key={seg.id} href={`/segments/${seg.id}`}>
              <div
                className="card p-5 hover:shadow-md transition-all cursor-pointer group border-l-4 animate-fade-in"
                style={{ animationDelay: `${i * 60}ms`, borderLeftColor: seg.isDefault ? 'var(--text-tertiary)' : seg.isActive ? 'var(--primary)' : 'var(--border)' }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                        {seg.name}
                      </h3>
                      {seg.isDefault && (
                        <span className="text-[9px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-bold uppercase">Default</span>
                      )}
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        seg.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {seg.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{seg.code} • Priority: {seg.priority}</p>
                    {seg.description && (
                      <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-1">{seg.description}</p>
                    )}
                    {/* Criteria preview */}
                    <div className="mt-3 p-2.5 bg-[var(--surface-secondary)] rounded-lg">
                      <RulePreview criteria={seg.criteriaJsonb} compact />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 ml-4">
                    <CircularProgress
                      value={Number(seg.successRate || 0)}
                      size={56}
                      strokeWidth={4}
                      color={Number(seg.successRate || 0) > 50 ? '#10B981' : Number(seg.successRate || 0) > 25 ? '#F59E0B' : '#EF4444'}
                      label="Success"
                    />
                    <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                      <Users className="w-3 h-3" />
                      <span className="font-medium">{(seg.recordCount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

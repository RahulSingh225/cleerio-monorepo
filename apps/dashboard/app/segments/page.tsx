'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { CircularProgress } from '@/components/ui/circular-progress';
import { RulePreview } from '@/components/ui/rule-preview';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { Target, Plus, Loader2, Users, AlertTriangle, CheckCircle2, BarChart3, RefreshCw } from 'lucide-react';

export default function SegmentsPage() {
  const [segments, setSegments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPortfolioRecords, setTotalPortfolioRecords] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => { fetchSegments(); }, []);

  const fetchSegments = async () => {
    try {
      const segRes = await api.get('/segments');
      setSegments(segRes.data.data || []);

      try {
        const countRes = await api.get('/portfolio-records/count');
        // Handle both wrapped and unwrapped counts safely
        const count = countRes.data?.data?.count ?? countRes.data?.count ?? 0;
        setTotalPortfolioRecords(count);
      } catch (err) {
        console.warn('Failed to load record stats, continuing with segments...');
        setTotalPortfolioRecords(0);
      }
    } catch (err: any) { 
      console.error('CRITICAL: Failed to load segments list:', err.response?.data || err.message); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const triggerSegmentation = async () => {
    setIsRunning(true);
    try {
      await api.post('/segments/run');
      // Refetch after a short delay to see updated counts
      setTimeout(() => { fetchSegments(); setIsRunning(false); }, 3000);
    } catch (err) {
      alert('Failed to trigger segmentation run.');
      setIsRunning(false);
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      await api.put(`/segments/${id}`, { isActive: !currentActive });
      fetchSegments();
    } catch (err) { alert('Failed to toggle segment.'); }
  };

  const assignedRecords = segments.reduce((sum, s) => sum + (s.recordCount || 0), 0);
  const unassignedRecords = Math.max(0, totalPortfolioRecords - assignedRecords);
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
          <div className="flex items-center gap-2">
            <button
              onClick={triggerSegmentation}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2.5 border border-[var(--border)] text-[var(--text-primary)] rounded-lg text-sm font-medium hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Running...' : 'Run Segmentation'}
            </button>
            <Link href="/segments/new">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> Create Segment
              </button>
            </Link>
          </div>
        }
      />

      {/* Metrics with coverage indicator */}
      <div className="grid grid-cols-5 gap-4">
        <div className="card p-4">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Total Segments</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{segments.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{segments.filter(s => s.isActive).length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Assigned</p>
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{assignedRecords.toLocaleString()}</p>
        </div>
        <div className="card p-4 relative overflow-hidden">
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Unassigned</p>
            {unassignedRecords > 0 && <AlertTriangle className="w-3 h-3 text-amber-500" />}
          </div>
          <p className={`text-2xl font-bold mt-1 ${unassignedRecords > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {unassignedRecords.toLocaleString()}
          </p>
          {/* Pulse indicator for unassigned */}
          {unassignedRecords > 0 && (
            <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
          )}
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Avg Success</p>
          <p className="text-2xl font-bold text-[var(--primary)] mt-1">{avgSuccess.toFixed(1)}%</p>
        </div>
      </div>

      {/* Coverage Bar — visual indicator of segment coverage */}
      {totalPortfolioRecords > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--text-tertiary)]" />
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                Segment Coverage
              </span>
            </div>
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              {assignedRecords.toLocaleString()} / {totalPortfolioRecords.toLocaleString()} records assigned
              ({totalPortfolioRecords > 0 ? ((assignedRecords / totalPortfolioRecords) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
            {segments.filter(s => (s.recordCount || 0) > 0).map((seg, i) => {
              const pct = (seg.recordCount / totalPortfolioRecords) * 100;
              const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500'];
              return (
                <div
                  key={seg.id}
                  className={`h-full ${colors[i % colors.length]} transition-all duration-500 relative group`}
                  style={{ width: `${pct}%`, minWidth: pct > 0 ? '3px' : '0' }}
                  title={`${seg.name}: ${seg.recordCount} records (${pct.toFixed(1)}%)`}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-[9px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {seg.name}: {seg.recordCount}
                  </div>
                </div>
              );
            })}
            {unassignedRecords > 0 && (
              <div
                className="h-full bg-amber-300 transition-all duration-500 relative group"
                style={{ width: `${(unassignedRecords / totalPortfolioRecords) * 100}%` }}
                title={`Unassigned: ${unassignedRecords} records`}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-[9px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Unassigned: {unassignedRecords}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3 mt-2.5">
            {segments.filter(s => (s.recordCount || 0) > 0).map((seg, i) => {
              const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500'];
              return (
                <div key={seg.id} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-sm ${colors[i % colors.length]}`} />
                  <span className="text-[10px] text-[var(--text-secondary)] font-medium">{seg.name} ({seg.recordCount})</span>
                </div>
              );
            })}
            {unassignedRecords > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-amber-300" />
                <span className="text-[10px] text-amber-600 font-medium">Unassigned ({unassignedRecords})</span>
              </div>
            )}
          </div>
        </div>
      )}

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
                      <span className="font-bold">{(seg.recordCount || 0).toLocaleString()}</span>
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

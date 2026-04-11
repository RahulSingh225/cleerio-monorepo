'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { CircularProgress } from '@/components/ui/circular-progress';
import { RulePreview } from '@/components/ui/rule-preview';
import { 
  Loader2, 
  Users, 
  Target, 
  Calendar, 
  ArrowLeft, 
  Settings, 
  CheckCircle2, 
  RefreshCw,
  MoreVertical,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function SegmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [segment, setSegment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSegmentDetails();
  }, [id]);

  const fetchSegmentDetails = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/segments/${id}`);
      setSegment(res.data.data);
    } catch (err) {
      setError('Failed to load segment details.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerSegmentation = async () => {
    setIsRunning(true);
    try {
      await api.post('/segments/run');
      // Briefly show running state then refresh
      setTimeout(() => {
        fetchSegmentDetails();
        setIsRunning(false);
      }, 3000);
    } catch (err) {
      alert('Failed to trigger segmentation.');
      setIsRunning(false);
    }
  };

  const toggleActive = async () => {
    try {
      const newStatus = !segment.isActive;
      await api.put(`/segments/${id}`, { isActive: newStatus });
      setSegment({ ...segment, isActive: newStatus });
    } catch (err) {
      alert('Failed to update segment status.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        <p className="text-sm text-[var(--text-tertiary)] font-medium">Loading segment intelligence...</p>
      </div>
    );
  }

  if (error || !segment) {
    return (
      <div className="card p-12 text-center flex flex-col items-center max-w-2xl mx-auto mt-12">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
          <Target className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Segment Not Found</h2>
        <p className="text-[var(--text-secondary)] mt-2 mb-6">{error || "The segment you're looking for doesn't exist or has been removed."}</p>
        <button 
          onClick={() => router.push('/segments')}
          className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary-hover)] transition-colors"
        >
          Back to Segments
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors cursor-pointer w-fit" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4" />
        <span>Back to segments</span>
      </div>

      <PageHeader
        title={segment.name}
        subtitle={`${segment.code} • Priority ${segment.priority}`}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={triggerSegmentation}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] text-[var(--text-primary)] rounded-lg text-sm font-medium hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Running...' : 'Re-run Logic'}
            </button>
            <button
              onClick={toggleActive}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                segment.isActive 
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {segment.isActive ? 'Deactivate' : 'Activate Segment'}
            </button>
            <Link href={`/segments/new?edit=${id}`}>
              <button className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] text-[var(--text-primary)] rounded-lg text-sm font-medium hover:bg-[var(--surface-hover)] transition-colors">
                <Settings className="w-4 h-4" />
                Edit Rules
              </button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Card */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[var(--primary)]" />
                  Targeting Criteria
                </h3>
                <p className="text-xs text-[var(--text-tertiary)]">Rules that decide which borrowers fall into this segment.</p>
              </div>
              {segment.isDefault && (
                  <span className="text-[10px] px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full font-bold uppercase tracking-wider">Default Segment</span>
              )}
            </div>
            
            <div className="p-4 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)] shadow-inner min-h-[120px]">
              <RulePreview criteria={segment.criteriaJsonb} />
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--border)] grid grid-cols-3 gap-4 text-center">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Matched Records</p>
                  <p className="text-2xl font-black text-emerald-600">{(segment.recordCount || 0).toLocaleString()}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Active Status</p>
                  <div className="flex justify-center mt-1">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      segment.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${segment.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-400'}`} />
                      {segment.isActive ? 'Live' : 'Paused'}
                    </span>
                  </div>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Success rate</p>
                  <p className="text-2xl font-black text-[var(--primary)]">{Number(segment.successRate || 0).toFixed(1)}%</p>
               </div>
            </div>
          </div>

          {/* Activity/History (Placeholder) */}
          <div className="card p-6">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              Segment Performance over time
            </h3>
            <div className="h-48 bg-gray-50 flex items-center justify-center border-2 border-dashed border-[var(--border)] rounded-xl opacity-50">
              <p className="text-sm text-gray-400">Charts & Trends pending data aggregation</p>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="card p-6 flex flex-col items-center text-center">
            <CircularProgress 
              value={Number(segment.successRate || 0)} 
              size={120} 
              strokeWidth={10}
              color={Number(segment.successRate || 0) > 50 ? '#10B981' : Number(segment.successRate || 0) > 25 ? '#F59E0B' : '#EF4444'} 
            />
            <h4 className="text-sm font-bold text-[var(--text-primary)] mt-4">Recovery Score</h4>
            <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-[200px]">
              Percentage of total matched borrowers who have made a successful repayment.
            </p>
          </div>

          <div className="card p-5 space-y-4">
            <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Segment Attributes</h4>
            
            <div className="space-y-3">
              <StatRow icon={<Calendar className="w-3.5 h-3.5" />} label="Created" value={new Date(segment.createdAt).toLocaleDateString()} />
              <StatRow icon={<Users className="w-3.5 h-3.5" />} label="Type" value={segment.isDefault ? 'Fallback Pool' : 'Targeted Rule'} />
              <StatRow icon={<Activity className="w-3.5 h-3.5" />} label="Priority Level" value={segment.priority} />
            </div>

            <div className="pt-4 border-t border-[var(--border)]">
              <button 
                onClick={() => router.push(`/cases?segmentId=${id}`)}
                className="w-full flex items-center justify-between p-3 bg-[var(--surface-hover)] rounded-lg group transition-all hover:bg-[var(--primary)] hover:bg-opacity-5"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                  <Users className="w-4 h-4 text-[var(--primary)]" />
                  <span>View All Borrowers</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--primary)]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: any }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-[var(--text-secondary)] font-medium">
        <span className="text-[var(--text-tertiary)]">{icon}</span>
        <span>{label}</span>
      </div>
      <span className="font-bold text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

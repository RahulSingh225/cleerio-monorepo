'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Clock, Plus, X, Save, Loader2, Play, Pause } from 'lucide-react';

export default function ScheduledJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try { const res = await api.get('/scheduled-jobs'); setJobs(res.data.data || []); }
    catch (err) { console.error('Failed to fetch scheduled jobs'); }
    finally { setIsLoading(false); }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await api.put(`/scheduled-jobs/${id}/toggle`, { isActive: !isActive });
      fetchJobs();
    } catch (err) { alert('Failed to toggle job.'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Scheduled Jobs" subtitle="Manage recurring automation schedules." />

      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-secondary)]">
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Job Type</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Cron</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Active</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Last Run</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Next Run</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {isLoading ? Array.from({ length: 3 }).map((_, i) => (
              <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-4 bg-[var(--surface-secondary)] rounded animate-pulse" /></td></tr>
            )) : jobs.map((job) => (
              <tr key={job.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-[var(--text-primary)]">{job.jobType}</td>
                <td className="px-5 py-3"><code className="text-xs font-mono bg-[var(--surface-secondary)] px-2 py-1 rounded">{job.cronExpression}</code></td>
                <td className="px-5 py-3">
                  <button onClick={() => handleToggle(job.id, job.isActive)} className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${job.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${job.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </td>
                <td className="px-5 py-3 text-xs text-[var(--text-tertiary)]">{job.lastRunAt ? new Date(job.lastRunAt).toLocaleString() : 'Never'}</td>
                <td className="px-5 py-3 text-xs text-[var(--text-secondary)]">{job.nextRunAt ? new Date(job.nextRunAt).toLocaleString() : '—'}</td>
                <td className="px-5 py-3">
                  <StatusBadge label={job.lastRunStatus || 'pending'} variant={job.lastRunStatus === 'completed' ? 'success' : job.lastRunStatus === 'failed' ? 'critical' : 'neutral'} />
                </td>
                <td className="px-5 py-3">
                  {job.isActive ? <Pause className="w-4 h-4 text-[var(--text-tertiary)] cursor-pointer hover:text-orange-500" onClick={() => handleToggle(job.id, true)} /> : <Play className="w-4 h-4 text-[var(--text-tertiary)] cursor-pointer hover:text-emerald-500" onClick={() => handleToggle(job.id, false)} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && jobs.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
            <Clock className="w-10 h-10 text-[var(--text-tertiary)]" />
            <h4 className="text-base font-semibold text-[var(--text-primary)]">No Scheduled Jobs</h4>
            <p className="text-sm text-[var(--text-secondary)]">Configure recurring automations for dispatch and reporting.</p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { MetricCard } from '@/components/ui/metric-card';
import { StatusBadge } from '@/components/ui/status-badge';
import Link from 'next/link';
import {
  Users, DollarSign, Layers, Radio, FileText, TrendingUp, BarChart3,
  Loader2, ArrowUpRight, Briefcase, Workflow
} from 'lucide-react';

export default function InsightsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [dpdDist, setDpdDist] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [commStats, setCommStats] = useState({ total: 0, scheduled: 0, sent: 0, failed: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, dpdRes, portfolioRes, commRes] = await Promise.all([
        api.get('/reports/portfolio-summary').catch(() => ({ data: { data: null } })),
        api.get('/reports/dpd-distribution').catch(() => ({ data: { data: [] } })),
        api.get('/portfolios').catch(() => ({ data: { data: [] } })),
        api.get('/comm-events').catch(() => ({ data: { data: [] } })),
      ]);

      setSummary(summaryRes.data.data);
      setDpdDist(dpdRes.data.data || []);
      setPortfolios((portfolioRes.data.data || []).slice(0, 5));

      const events = commRes.data.data || [];
      setCommStats({
        total: events.length,
        scheduled: events.filter((e: any) => e.status === 'scheduled').length,
        sent: events.filter((e: any) => e.status === 'sent' || e.status === 'delivered').length,
        failed: events.filter((e: any) => e.status === 'failed').length,
      });
    } catch (err) { console.error('Failed to load insights'); }
    finally { setIsLoading(false); }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  // Max overdue for DPD chart bars
  const maxOverdue = Math.max(...dpdDist.map((d: any) => Number(d.totalOverdue || 0)), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Dashboard" subtitle="Overview of your collection operations." />

      {/* Top Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Total Records"
          value={(summary?.totalRecords || 0).toLocaleString()}
          icon={<Users className="w-5 h-5" />}
          trend=""
        />
        <MetricCard
          title="Total Outstanding"
          value={`₹${((Number(summary?.totalOutstanding || 0)) / 100000).toFixed(1)}L`}
          icon={<DollarSign className="w-5 h-5" />}
          trend=""
        />
        <MetricCard
          title="Total Overdue"
          value={`₹${((Number(summary?.totalOverdue || 0)) / 100000).toFixed(1)}L`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend=""
        />
        <MetricCard
          title="Communications"
          value={commStats.total.toLocaleString()}
          icon={<Radio className="w-5 h-5" />}
          trend=""
        />
      </div>

      {/* Row: DPD Distribution + Comms Summary */}
      <div className="grid grid-cols-2 gap-4">
        {/* DPD Distribution */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">DPD Bucket Distribution</h3>
            <Layers className="w-4 h-4 text-[var(--text-tertiary)]" />
          </div>
          {dpdDist.length > 0 ? (
            <div className="space-y-3">
              {dpdDist.map((bucket: any, i: number) => {
                const pct = Math.round((Number(bucket.totalOverdue || 0) / maxOverdue) * 100);
                const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-orange-500', 'bg-red-500'];
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[var(--text-primary)]">{bucket.bucket || 'Unknown'}</span>
                      <span className="text-xs text-[var(--text-tertiary)]">{bucket.count} records • ₹{Number(bucket.totalOverdue || 0).toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${colors[i % colors.length]}`} style={{ width: `${Math.max(pct, 3)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-8">No DPD data yet. Upload a portfolio to see distribution.</p>
          )}
        </div>

        {/* Communication summary */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Communication Status</h3>
            <Link href="/communications" className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-2xl font-bold text-blue-600">{commStats.scheduled}</p>
              <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider mt-1">Scheduled</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-2xl font-bold text-emerald-600">{commStats.sent}</p>
              <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider mt-1">Sent</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
              <p className="text-2xl font-bold text-red-500">{commStats.failed}</p>
              <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mt-1">Failed</p>
            </div>
          </div>
          {commStats.total > 0 && (
            <div className="mt-4">
              <div className="flex h-3 rounded-full overflow-hidden bg-[var(--surface-secondary)]">
                {commStats.scheduled > 0 && <div className="bg-blue-500 transition-all" style={{ width: `${(commStats.scheduled / commStats.total) * 100}%` }} />}
                {commStats.sent > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${(commStats.sent / commStats.total) * 100}%` }} />}
                {commStats.failed > 0 && <div className="bg-red-500 transition-all" style={{ width: `${(commStats.failed / commStats.total) * 100}%` }} />}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Portfolios */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent Portfolios</h3>
          <Link href="/portfolios" className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1">
            View All <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        {portfolios.length > 0 ? (
          <div className="space-y-2">
            {portfolios.map((p: any) => (
              <Link key={p.id} href={`/portfolios/${p.id}`}>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)]">{p.name || `Portfolio ${p.id?.substring(0, 8)}`}</p>
                      <p className="text-[10px] text-[var(--text-tertiary)]">{p.allocationMonth || '—'} • {p.recordCount || 0} records</p>
                    </div>
                  </div>
                  <StatusBadge label={p.status} variant={p.status === 'completed' ? 'success' : p.status === 'processing' ? 'warning' : 'neutral'} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-tertiary)] text-center py-6">No portfolios uploaded yet.</p>
        )}
      </div>
    </div>
  );
}

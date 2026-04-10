'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { MetricCard } from '@/components/ui/metric-card';
import { FileText, Users, DollarSign, Layers, Loader2, ChevronLeft, Search } from 'lucide-react';
import Link from 'next/link';

export default function PortfolioDetailPage() {
  const params = useParams();
  const portfolioId = params.id as string;

  const [portfolio, setPortfolio] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => { fetchData(); }, [portfolioId]);

  const fetchData = async () => {
    try {
      const [pRes, rRes] = await Promise.all([
        api.get(`/portfolios/${portfolioId}`),
        api.get(`/portfolio-records?portfolioId=${portfolioId}`).catch(() => ({ data: { data: [] } })),
      ]);
      setPortfolio(pRes.data.data);
      setRecords(rRes.data.data || []);
    } catch (err) { console.error('Failed to load portfolio'); }
    finally { setIsLoading(false); }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>;

  // Compute summary stats
  const totalRecords = records.length;
  const totalOutstanding = records.reduce((sum, r) => sum + Number(r.outstanding || 0), 0);
  const totalOverdue = records.reduce((sum, r) => sum + Number(r.overdue || 0), 0);
  const bucketDist = records.reduce((acc: Record<string, number>, r) => {
    const b = r.dpdBucket || 'Unknown';
    acc[b] = (acc[b] || 0) + 1;
    return acc;
  }, {});

  // Filter
  const filtered = records.filter(r =>
    !searchTerm ||
    r.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.mobile?.includes(searchTerm)
  );
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/portfolios" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors mb-1">
        <ChevronLeft className="w-4 h-4" /> Back to Portfolios
      </Link>

      <PageHeader
        title={portfolio?.name || `Portfolio ${portfolioId.substring(0, 8)}`}
        subtitle={`Uploaded: ${portfolio?.createdAt ? new Date(portfolio.createdAt).toLocaleString() : '—'} • Month: ${portfolio?.allocationMonth || '—'}`}
        actions={<StatusBadge label={portfolio?.status || 'unknown'} variant={portfolio?.status === 'completed' ? 'success' : portfolio?.status === 'processing' ? 'warning' : 'neutral'} />}
      />

      {/* Summary metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Total Records" value={totalRecords.toLocaleString()} icon={<Users className="w-5 h-5" />} />
        <MetricCard label="Total Outstanding" value={`₹${(totalOutstanding / 100000).toFixed(1)}L`} icon={<DollarSign className="w-5 h-5" />} />
        <MetricCard label="Total Overdue" value={`₹${(totalOverdue / 100000).toFixed(1)}L`} icon={<DollarSign className="w-5 h-5" />} />
        <MetricCard label="DPD Buckets" value={Object.keys(bucketDist).length.toString()} icon={<Layers className="w-5 h-5" />} />
      </div>

      {/* Bucket distribution */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">DPD Bucket Distribution</h3>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(bucketDist).sort().map(([bucket, count]) => (
            <div key={bucket} className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-secondary)] border border-[var(--border-light)] rounded-lg">
              <span className="text-xs font-bold text-[var(--text-primary)]">{bucket}</span>
              <span className="text-xs text-[var(--text-tertiary)]">({count as number} records)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Records table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input type="text" placeholder="Search by name, user ID, or mobile..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20" />
          </div>
          <span className="text-xs text-[var(--text-tertiary)]">{filtered.length} of {totalRecords} records</span>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-secondary)]">
              <th className="px-4 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">User ID</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Mobile</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">DPD</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Bucket</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Outstanding</th>
              <th className="px-4 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Overdue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {paginated.map((rec) => (
              <tr key={rec.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                <td className="px-4 py-2.5 text-xs font-mono text-[var(--primary)]">{rec.userId || '—'}</td>
                <td className="px-4 py-2.5 text-sm text-[var(--text-primary)]">{rec.name || '—'}</td>
                <td className="px-4 py-2.5 text-sm text-[var(--text-secondary)] font-mono">{rec.mobile || '—'}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-sm font-bold ${(rec.currentDpd || 0) > 90 ? 'text-red-500' : (rec.currentDpd || 0) > 30 ? 'text-orange-500' : 'text-emerald-600'}`}>
                    {rec.currentDpd ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-2.5"><StatusBadge label={rec.dpdBucket || '—'} variant="info" /></td>
                <td className="px-4 py-2.5 text-sm text-[var(--text-primary)] font-mono">₹{Number(rec.outstanding || 0).toLocaleString()}</td>
                <td className="px-4 py-2.5 text-sm text-red-500 font-mono">₹{Number(rec.overdue || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
            <span className="text-xs text-[var(--text-tertiary)]">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg disabled:opacity-30 hover:bg-[var(--surface-hover)]">Previous</button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg disabled:opacity-30 hover:bg-[var(--surface-hover)]">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

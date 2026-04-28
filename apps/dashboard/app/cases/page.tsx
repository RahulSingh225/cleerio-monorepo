'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { MetricCard } from '@/components/ui/metric-card';
import { DpdBadge, StatusBadge } from '@/components/ui/status-badge';
import {
  Users, AlertTriangle, MessageSquare, Download, Loader2,
  Search, X, ChevronDown, ChevronLeft, ChevronRight, ArrowUpDown,
  ArrowUp, ArrowDown, Phone, Mail, IndianRupee, CalendarClock,
  Shield, Eye, MapPin, Briefcase,
} from 'lucide-react';

const PAGE_SIZE = 20;

// ── Hover Insight Popover ──
function InsightPopover({ record, position }: { record: any; position: { x: number; y: number } }) {
  const dpd = Number(record.currentDpd || 0);
  const outstanding = Number(record.outstanding || 0);
  const repaid = Number(record.totalRepaid || 0);
  const repayRate = outstanding > 0 ? ((repaid / (outstanding + repaid)) * 100).toFixed(1) : '0';
  const commAttempts = Number(record.totalCommAttempts || 0);
  const commDelivered = Number(record.totalCommDelivered || 0);
  const deliveryRate = commAttempts > 0 ? ((commDelivered / commAttempts) * 100).toFixed(0) : '—';

  return (
    <div
      className="fixed z-50 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 space-y-3 animate-fade-in pointer-events-none"
      style={{ top: position.y - 10, left: position.x + 20, transform: 'translateY(-100%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-900 truncate">{record.name || 'Unknown'}</h4>
        <DpdBadge days={dpd} />
      </div>

      {/* Quick metrics */}
      <div className="grid grid-cols-2 gap-2">
        <MiniStat icon={<IndianRupee className="w-3 h-3" />} label="Outstanding" value={`₹${outstanding.toLocaleString('en-IN')}`} />
        <MiniStat icon={<CalendarClock className="w-3 h-3" />} label="Repay Rate" value={`${repayRate}%`} color={Number(repayRate) > 30 ? 'text-emerald-600' : 'text-red-600'} />
        <MiniStat icon={<MessageSquare className="w-3 h-3" />} label="Comm Sent" value={`${commAttempts}`} />
        <MiniStat icon={<Shield className="w-3 h-3" />} label="Delivery" value={`${deliveryRate}%`} />
      </div>

      {/* Contact info */}
      <div className="flex items-center gap-3 text-[10px] text-gray-400 border-t border-gray-100 pt-2">
        {record.mobile && <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" />{record.mobile}</span>}
        {record.state && <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{record.state}</span>}
        {record.product && <span className="flex items-center gap-1"><Briefcase className="w-2.5 h-2.5" />{record.product}</span>}
      </div>

      {/* PTP / Risk */}
      <div className="flex items-center gap-2">
        {record.ptpStatus && (
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
            record.ptpStatus === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}>PTP: {record.ptpStatus}</span>
        )}
        {record.riskBucket && (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700">{record.riskBucket}</span>
        )}
        {record.contactabilityScore != null && (
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
            Number(record.contactabilityScore) > 60 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-600'
          }`}>Score: {record.contactabilityScore}</span>
        )}
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2 py-1.5">
      <span className="text-gray-400">{icon}</span>
      <div>
        <p className="text-[9px] text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-xs font-bold ${color || 'text-gray-900'}`}>{value}</p>
      </div>
    </div>
  );
}

// ── Main Content ──
function CasesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentFilter = searchParams.get('assignment');
  const segmentIdFilter = searchParams.get('segmentId');

  const [page, setPage] = useState(1);
  const [records, setRecords] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dpdMin, setDpdMin] = useState('');
  const [dpdMax, setDpdMax] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [ptpFilter, setPtpFilter] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Hover insight
  const [hoveredRecord, setHoveredRecord] = useState<any>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!assignmentFilter && !segmentIdFilter) loadPortfolios();
  }, [assignmentFilter, segmentIdFilter]);

  useEffect(() => {
    loadRecords();
  }, [selectedPortfolio, page, assignmentFilter, segmentIdFilter, searchTerm, dpdMin, dpdMax, productFilter, statusFilter, riskFilter, ptpFilter, sortBy, sortDir]);

  const loadPortfolios = async () => {
    try {
      const res = await api.get('/portfolios');
      const data = res.data.data || [];
      setPortfolios(data);
      const completed = data.find((p: any) => p.status === 'completed');
      if (completed) setSelectedPortfolio(completed.id);
      else if (data.length > 0) setSelectedPortfolio(data[0].id);
    } catch { /* silent */ }
  };

  const loadRecords = async () => {
    setLoading(true);
    try {
      const params: any = {
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      };

      if (assignmentFilter) params.isAssigned = assignmentFilter === 'assigned' ? 'true' : 'false';
      if (segmentIdFilter) params.segmentId = segmentIdFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (dpdMin) params.dpdMin = dpdMin;
      if (dpdMax) params.dpdMax = dpdMax;
      if (productFilter) params.product = productFilter;
      if (statusFilter) params.lastDeliveryStatus = statusFilter;
      if (riskFilter) params.riskBucket = riskFilter;
      if (ptpFilter) params.ptpStatus = ptpFilter;
      if (sortBy) { params.sortBy = sortBy; params.sortDir = sortDir; }

      if (!assignmentFilter && !segmentIdFilter && selectedPortfolio) {
        params.portfolioId = selectedPortfolio;
      }
      
      const res = await api.get('/portfolio-records', { params });

      const data = res.data.data || [];
      setRecords(data);
      setTotalRecords(res.data.meta?.totalCount || data.length);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('desc'); }
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm(''); setDpdMin(''); setDpdMax('');
    setProductFilter(''); setStatusFilter(''); setRiskFilter(''); setPtpFilter('');
    setSortBy(''); setSortDir('desc'); setPage(1);
    if (assignmentFilter || segmentIdFilter) router.push('/cases');
  };

  const activeFilterCount = [searchTerm, dpdMin, dpdMax, productFilter, statusFilter, riskFilter, ptpFilter, assignmentFilter, segmentIdFilter].filter(Boolean).length;
  const totalPages = Math.ceil(totalRecords / PAGE_SIZE);
  const highRiskCount = records.filter(r => (r.currentDpd || 0) > 60).length;

  const handleRowHover = (record: any, e: React.MouseEvent) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      setHoveredRecord(record);
      setHoverPos({ x: e.clientX, y: e.clientY });
    }, 400);
  };

  const handleRowLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoveredRecord(null);
  };

  // Sort icon helper
  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40" />;
    return sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-[var(--primary)]" /> : <ArrowDown className="w-3 h-3 text-[var(--primary)]" />;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Case Management"
        subtitle="Monitor borrower records, filter by risk, and take action."
        actions={
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export
          </button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard icon={<Users className="w-5 h-5" />} label="Total Records" value={loading ? '...' : totalRecords.toLocaleString()} iconBgColor="bg-blue-50 text-blue-600" />
        <MetricCard icon={<AlertTriangle className="w-5 h-5" />} label="High Risk (60+ DPD)" value={loading ? '...' : highRiskCount.toString()} iconBgColor="bg-red-50 text-red-600" />
        <MetricCard icon={<MessageSquare className="w-5 h-5" />} label="Portfolios" value={portfolios.length.toString()} iconBgColor="bg-violet-50 text-violet-600" />
      </div>

      {/* Search + Filter Bar */}
      <div className="card p-3 space-y-3">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              placeholder="Search name, mobile, loan #..."
              className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
            />
            {searchTerm && (
              <button onClick={() => { setSearchTerm(''); setPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Portfolio selector */}
          {!assignmentFilter && !segmentIdFilter && (
            <select value={selectedPortfolio} onChange={(e) => { setSelectedPortfolio(e.target.value); setPage(1); }}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20">
              <option value="">Select Portfolio</option>
              {portfolios.map(p => (
                <option key={p.id} value={p.id}>{p.allocationMonth} ({(p.totalRecords || 0).toLocaleString()})</option>
              ))}
            </select>
          )}

          {/* Toggle filters */}
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}>
            <Eye className="w-3.5 h-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="text-xs text-red-500 font-medium hover:underline">Clear All</button>
          )}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-2 border-t border-gray-100 animate-fade-in">
            <FilterSelect label="Delivery Status" value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }}
              options={['delivered', 'failed', 'read', 'replied', 'pending', 'dnd']} />
            <FilterSelect label="Risk Bucket" value={riskFilter} onChange={(v) => { setRiskFilter(v); setPage(1); }}
              options={['low', 'medium', 'high', 'critical']} />
            <FilterSelect label="PTP Status" value={ptpFilter} onChange={(v) => { setPtpFilter(v); setPage(1); }}
              options={['confirmed', 'pending_review', 'broken']} />
            <div className="flex gap-1">
              <input type="number" value={dpdMin} onChange={(e) => { setDpdMin(e.target.value); setPage(1); }}
                placeholder="DPD min" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20" />
              <input type="number" value={dpdMax} onChange={(e) => { setDpdMax(e.target.value); setPage(1); }}
                placeholder="DPD max" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20" />
            </div>
            <input type="text" value={productFilter} onChange={(e) => { setProductFilter(e.target.value); setPage(1); }}
              placeholder="Product..." className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20" />
          </div>
        )}

        {/* Context badges */}
        {(assignmentFilter || segmentIdFilter) && (
          <div className="flex items-center gap-2 pt-1">
            {assignmentFilter && (
              <span className="text-[10px] font-semibold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                Assignment: {assignmentFilter}
              </span>
            )}
            {segmentIdFilter && (
              <span className="text-[10px] font-semibold px-2.5 py-1 bg-violet-50 text-violet-600 rounded-full border border-violet-100">
                Segment filtered
              </span>
            )}
          </div>
        )}
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="card p-12 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading records...</span>
          </div>
        </div>
      ) : records.length === 0 ? (
        <div className="card py-16 flex flex-col items-center justify-center text-center space-y-3">
          <Users className="w-8 h-8 text-gray-300" />
          <h4 className="text-base font-bold text-gray-700">No Records Found</h4>
          <p className="text-sm text-gray-400">{portfolios.length === 0 ? 'Upload a portfolio to get started.' : 'Try adjusting your filters.'}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <Th label="Borrower" />
                  <Th label="Product" />
                  <ThSortable label="Outstanding" field="outstanding" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                  <Th label="EMI" />
                  <ThSortable label="DPD" field="currentDpd" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                  <Th label="Due Date" />
                  <Th label="Last Status" />
                  <Th label="Mobile" />
                  <Th label="" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((row) => (
                  <tr key={row.id}
                    onClick={() => router.push(`/cases/${row.id}`)}
                    onMouseMove={(e) => handleRowHover(row, e)}
                    onMouseLeave={handleRowLeave}
                    className="hover:bg-blue-50/30 cursor-pointer transition-colors group">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{row.name || 'Unknown'}</p>
                      <p className="text-[11px] text-gray-400">{row.loanNumber ? `Loan: ${row.loanNumber}` : `ID: ${row.userId}`}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.product || '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 tabular-nums">₹{Number(row.outstanding || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 tabular-nums">{row.emiAmount ? `₹${Number(row.emiAmount).toLocaleString('en-IN')}` : '—'}</td>
                    <td className="px-4 py-3"><DpdBadge days={row.currentDpd || 0} /></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{row.dueDate ? new Date(row.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}</td>
                    <td className="px-4 py-3">
                      {row.lastDeliveryStatus ? (
                        <StatusBadge label={row.lastDeliveryStatus} variant={
                          row.lastDeliveryStatus === 'delivered' ? 'success' :
                          row.lastDeliveryStatus === 'failed' ? 'critical' :
                          row.lastDeliveryStatus === 'read' ? 'success' :
                          row.lastDeliveryStatus === 'replied' ? 'info' : 'warning'
                        } />
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{row.mobile}</td>
                    <td className="px-4 py-3">
                      <Eye className="w-4 h-4 text-gray-300 group-hover:text-[var(--primary)] transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-700">{((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, totalRecords)}</span> of{' '}
                <span className="font-semibold text-gray-700">{totalRecords.toLocaleString()}</span>
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
                </button>
                <span className="text-xs font-semibold text-gray-600 px-2">Page {page} of {totalPages}</span>
                <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hover Insight Popover */}
      {hoveredRecord && <InsightPopover record={hoveredRecord} position={hoverPos} />}
    </div>
  );
}

// ── Table Header Helpers ──
function Th({ label }: { label: string }) {
  return (
    <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{label}</th>
  );
}

function ThSortable({ label, field, sortBy, sortDir, onSort }: { label: string; field: string; sortBy: string; sortDir: string; onSort: (f: string) => void }) {
  return (
    <th onClick={() => onSort(field)}
      className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-gray-600 transition-colors group select-none">
      <div className="flex items-center gap-1">
        {label}
        {sortBy === field
          ? (sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-[var(--primary)]" /> : <ArrowDown className="w-3 h-3 text-[var(--primary)]" />)
          : <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
        }
      </div>
    </th>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 text-gray-600">
      <option value="">{label}</option>
      {options.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1).replace(/_/g, ' ')}</option>)}
    </select>
  );
}

export default function CaseManagementPage() {
  return (
    <Suspense fallback={<div className="p-12 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>}>
      <CasesContent />
    </Suspense>
  );
}

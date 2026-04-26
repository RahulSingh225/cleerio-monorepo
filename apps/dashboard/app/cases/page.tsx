'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { MetricCard } from '@/components/ui/metric-card';
import { DataTable } from '@/components/ui/data-table';
import { DpdBadge, RiskBadge, StatusBadge } from '@/components/ui/status-badge';
import { FilterBar, FilterDropdown } from '@/components/ui/filter-bar';
import { Users, AlertTriangle, MessageSquare, Download, MoreVertical, Loader2 } from 'lucide-react';

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

  useEffect(() => {
    if (!assignmentFilter && !segmentIdFilter) {
      loadPortfolios();
    }
  }, [assignmentFilter, segmentIdFilter]);

  useEffect(() => {
    if (selectedPortfolio || assignmentFilter || segmentIdFilter) {
      loadRecords(selectedPortfolio);
    }
  }, [selectedPortfolio, page, assignmentFilter, segmentIdFilter]);

  const loadPortfolios = async () => {
    try {
      const res = await api.get('/portfolios');
      const data = res.data.data || [];
      setPortfolios(data);
      // Auto-select first completed portfolio
      const completed = data.find((p: any) => p.status === 'completed');
      if (completed) {
        setSelectedPortfolio(completed.id);
      } else if (data.length > 0) {
        setSelectedPortfolio(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load portfolios', err);
    }
  };

  const loadRecords = async (portfolioId: string) => {
    setLoading(true);
    try {
      let res;
      if (assignmentFilter || segmentIdFilter) {
        res = await api.get('/portfolio-records', {
          params: { 
            limit: 10, 
            offset: (page - 1) * 10,
            isAssigned: assignmentFilter === 'assigned' ? 'true' : assignmentFilter === 'unassigned' ? 'false' : undefined,
            segmentId: segmentIdFilter || undefined
          },
        });
      } else {
        res = await api.get(`/portfolio-records/portfolio/${portfolioId}`, {
          params: { limit: 10, offset: (page - 1) * 10 },
        });
      }
      const data = res.data.data || [];
      setRecords(data);
      
      // Estimate total from portfolio or just use 100 for global filtered lists
      if (assignmentFilter || segmentIdFilter) {
        setTotalRecords(data.length === 10 ? page * 10 + 10 : (page - 1) * 10 + data.length);
      } else {
        const portfolio = portfolios.find(p => p.id === portfolioId);
        setTotalRecords(portfolio?.totalRecords || data.length);
      }
    } catch (err) {
      console.error('Failed to load records', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const highRiskCount = records.filter(r => (r.currentDpd || 0) > 60).length;

  const columns = [
    {
      key: 'name',
      header: 'Borrower Details',
      render: (row: any) => (
        <div>
          <p className="font-medium text-[var(--text-primary)]">{row.name || 'Unknown'}</p>
          <p className="text-xs text-[var(--text-tertiary)]">{row.loanNumber ? `Loan: ${row.loanNumber}` : `ID: ${row.userId}`}</p>
        </div>
      ),
    },
    {
      key: 'product',
      header: 'Product',
      render: (row: any) => (
        <span className="text-sm text-[var(--text-primary)]">{row.product || '-'}</span>
      ),
    },
    {
      key: 'outstanding',
      header: 'Outstanding',
      render: (row: any) => (
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          ₹{Number(row.outstanding || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'emiAmount',
      header: 'EMI',
      render: (row: any) => (
        <span className="text-sm text-[var(--text-primary)]">
          {row.emiAmount ? `₹${Number(row.emiAmount).toLocaleString()}` : '-'}
        </span>
      ),
    },
    {
      key: 'currentDpd',
      header: 'DPD',
      render: (row: any) => <DpdBadge days={row.currentDpd || 0} />,
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (row: any) => (
        <span className="text-sm text-[var(--text-secondary)]">
          {row.dueDate ? new Date(row.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '-'}
        </span>
      ),
    },
    {
      key: 'lastDeliveryStatus',
      header: 'Last Status',
      render: (row: any) => {
        if (!row.lastDeliveryStatus) return <span className="text-xs text-[var(--text-tertiary)]">—</span>;
        const variant = row.lastDeliveryStatus === 'delivered' ? 'success' :
                        row.lastDeliveryStatus === 'failed' ? 'critical' :
                        row.lastDeliveryStatus === 'read' ? 'success' :
                        row.lastDeliveryStatus === 'replied' ? 'info' : 'warning';
        return <StatusBadge label={row.lastDeliveryStatus} variant={variant as any} />;
      },
    },
    {
      key: 'mobile',
      header: 'Mobile',
      render: (row: any) => (
        <span className="text-sm text-[var(--text-secondary)]">{row.mobile}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-10',
      render: () => (
        <button className="p-1 rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)]">
          <MoreVertical className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Case Overview"
        subtitle="Real-time monitoring of borrower records and collection workflows."
      />

      {/* Metrics — derived from real data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={<Users className="w-5 h-5" />}
          label="Total Records"
          value={loading ? '...' : totalRecords.toLocaleString()}
          iconBgColor="bg-blue-50 text-blue-600"
        />
        <MetricCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="High Risk (60+ DPD)"
          value={loading ? '...' : highRiskCount.toString()}
          iconBgColor="bg-red-50 text-red-600"
        />
        <MetricCard
          icon={<MessageSquare className="w-5 h-5" />}
          label="Portfolios Loaded"
          value={portfolios.length.toString()}
          iconBgColor="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Filters + Table */}
      <div>
        <FilterBar
          actions={
            <div className="flex gap-3">
              {(assignmentFilter || segmentIdFilter) && (
                <button 
                  onClick={() => router.push('/cases')}
                  className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-white border border-[var(--border)] rounded-lg hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              )}
              <button className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors shadow-sm">
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>
          }
        >
          {!(assignmentFilter || segmentIdFilter) && (
            <FilterDropdown
              label="Select Portfolio"
              value={selectedPortfolio}
              onChange={(val) => { setSelectedPortfolio(val); setPage(1); }}
              options={portfolios.map(p => ({
                label: `${p.allocationMonth} (${(p.totalRecords || 0).toLocaleString()} records)`,
                value: p.id,
              }))}
            />
          )}
          {(assignmentFilter || segmentIdFilter) && (
            <div className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-100">
              Filtering by: {assignmentFilter ? `Assignment (${assignmentFilter})` : `Segment ID`}
            </div>
          )}
        </FilterBar>

        {loading ? (
          <div className="card p-12 flex items-center justify-center">
            <div className="flex items-center gap-3 text-[var(--text-tertiary)]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading records...</span>
            </div>
          </div>
        ) : records.length === 0 ? (
          <div className="card py-16 flex flex-col items-center justify-center text-center space-y-3">
            <Users className="w-8 h-8 text-[var(--text-tertiary)]" />
            <h4 className="text-base font-semibold text-[var(--text-primary)]">No Records Found</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              {portfolios.length === 0
                ? 'Upload a portfolio first to see borrower records.'
                : 'Select a portfolio with ingested records.'}
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={records}
            onRowClick={(row) => router.push(`/cases/${row.id}`)}
            pagination={{
              page,
              totalPages: Math.ceil(totalRecords / 10),
              totalItems: totalRecords,
              onPageChange: setPage,
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function CaseManagementPage() {
  return (
    <Suspense fallback={
      <div className="p-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    }>
      <CasesContent />
    </Suspense>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { MetricCard } from '@/components/ui/metric-card';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Database,
  Trash2,
  Download,
  FileSpreadsheet,
  ArrowUpCircle,
  BarChart3,
  FolderOpen,
} from 'lucide-react';

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const response = await api.get('/portfolios');
      setPortfolios(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch portfolios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Please upload a valid CSV file.');
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post('/portfolios/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchPortfolios();
    } catch (err) {
      alert('Failed to upload portfolio. Ensure backend is running.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/portfolios/${id}`);
      setPortfolios(portfolios.filter(p => p.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      alert('Failed to delete portfolio.');
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const totalRecords = portfolios.reduce((sum, p) => sum + (p.totalRecords || 0), 0);
  const completedCount = portfolios.filter(p => p.status === 'completed').length;
  const processingCount = portfolios.filter(p => p.status === 'processing').length;

  const columns = [
    {
      key: 'allocationMonth',
      header: 'Portfolio',
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{row.allocationMonth} Allocation</p>
            <p className="text-[11px] text-[var(--text-tertiary)]">ID: {row.id?.substring(0, 8)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'sourceType',
      header: 'Source',
      render: (row: any) => (
        <span className="text-xs font-medium text-[var(--text-secondary)] uppercase bg-[var(--surface-secondary)] px-2 py-1 rounded border border-[var(--border)]">
          {row.sourceType}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: any) => {
        const variant = row.status === 'completed' ? 'success' : row.status === 'processing' ? 'info' : row.status === 'failed' ? 'critical' : 'neutral';
        const label = row.status === 'completed' ? 'Ingested' : row.status === 'processing' ? 'Processing' : row.status === 'failed' ? 'Failed' : row.status;
        return <StatusBadge label={label} variant={variant} dot />;
      },
    },
    {
      key: 'totalRecords',
      header: 'Records',
      render: (row: any) => (
        <div className="text-sm">
          <span className="font-semibold text-[var(--text-primary)]">{(row.totalRecords || 0).toLocaleString()}</span>
          {row.failedRecords > 0 && (
            <span className="text-xs text-red-500 ml-2">({row.failedRecords} failed)</span>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Uploaded',
      render: (row: any) => (
        <span className="text-sm text-[var(--text-secondary)]">
          {new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-10',
      render: (row: any) => (
        <div className="relative">
          {deleteConfirm === row.id ? (
            <div className="flex items-center gap-1">
              <button onClick={() => handleDelete(row.id)} className="text-xs font-medium text-red-600 hover:underline">Delete</button>
              <button onClick={() => setDeleteConfirm(null)} className="text-xs font-medium text-[var(--text-tertiary)] hover:underline ml-2">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setDeleteConfirm(row.id)} className="p-1.5 rounded-md hover:bg-red-50 text-[var(--text-tertiary)] hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Portfolio Repository"
        subtitle="Ingest and analyze debt allocation cohorts for strategy triggering."
        actions={
          <button className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors">
            <Download className="w-4 h-4" />
            Sample Schema
          </button>
        }
      />

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={<FolderOpen className="w-5 h-5" />}
          label="Total Portfolios"
          value={portfolios.length}
          iconBgColor="bg-blue-50 text-blue-600"
        />
        <MetricCard
          icon={<Database className="w-5 h-5" />}
          label="Total Records"
          value={totalRecords.toLocaleString()}
          iconBgColor="bg-violet-50 text-violet-600"
        />
        <MetricCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Completed / Processing"
          value={`${completedCount} / ${processingCount}`}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Upload Zone */}
      <div
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        className={`card rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
          dragActive
            ? 'border-[var(--primary)] bg-blue-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-[var(--surface-hover)]'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv"
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />
        <div className="py-12 px-6 flex flex-col items-center text-center space-y-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
            isUploading
              ? 'bg-[var(--primary)] animate-bounce'
              : 'bg-blue-50 text-blue-600'
          }`}>
            {isUploading
              ? <ArrowUpCircle className="w-7 h-7 text-white" />
              : <Upload className="w-7 h-7" />
            }
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              {isUploading ? 'Uploading Portfolio...' : 'Upload Portfolio Data'}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-sm">
              Drag and drop your debt allocation CSV or click to browse. System will automatically parse and map fields.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--surface-secondary)] border border-[var(--border)] text-xs font-medium text-[var(--text-tertiary)]">
              <FileSpreadsheet className="w-3.5 h-3.5" /> CSV Format
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--surface-secondary)] border border-[var(--border)] text-xs font-medium text-[var(--text-tertiary)]">
              <Database className="w-3.5 h-3.5" /> Max 50k Records
            </span>
          </div>
        </div>
      </div>

      {/* Portfolio Table */}
      {isLoading ? (
        <div className="card p-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-[var(--text-tertiary)]">
            <Clock className="w-6 h-6 animate-pulse" />
            <span className="text-sm">Loading portfolios...</span>
          </div>
        </div>
      ) : portfolios.length > 0 ? (
        <DataTable columns={columns} data={portfolios} />
      ) : (
        <div className="card py-16 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-14 h-14 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--text-tertiary)]">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h4 className="text-base font-semibold text-[var(--text-primary)]">No Active Portfolios</h4>
          <p className="text-sm text-[var(--text-secondary)]">Upload your first portfolio batch to begin orchestrating collections.</p>
        </div>
      )}
    </div>
  );
}

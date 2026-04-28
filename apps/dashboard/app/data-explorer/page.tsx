'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { FilterPanel } from './components/FilterPanel';
import { Toolbar, ViewMode } from './components/Toolbar';
import { KpiStrip } from './components/KpiStrip';
import { ChartPanel } from './components/ChartPanel';
import { ResultsTable } from './components/ResultsTable';

// ── Types ──
type FilterRule = { field: string; operator: string; value: any; source: string };
type Aggregation = { field: string; fn: string; alias: string };
type QuerySpec = {
  filters: FilterRule[]; columns: string[]; groupBy?: string;
  aggregations?: Aggregation[]; sortBy?: string; sortDir?: string;
  limit?: number; offset?: number;
};

const PAGE_SIZE = 50;

export default function DataExplorerPage() {
  // ── Core query state ──
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    ['name', 'mobile', 'product', 'outstanding', 'currentDpd', 'state', 'lastDeliveryStatus']
  );
  const [groupBy, setGroupBy] = useState('');
  const [aggregations, setAggregations] = useState<Aggregation[]>([]);
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // ── Results state ──
  const [results, setResults] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [page, setPage] = useState(1);

  // ── UI state ──
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dynamicFields, setDynamicFields] = useState<{ key: string; label: string; type: string }[]>([]);
  const [savedQueries, setSavedQueries] = useState<any[]>([]);

  // ── Load metadata on mount ──
  useEffect(() => {
    loadDynamicFields();
    loadSavedQueries();
  }, []);

  const loadDynamicFields = async () => {
    try {
      const res = await api.get('/portfolio-records/fields');
      const fields = (res.data.data || []).filter((f: any) => !f.isCore);
      setDynamicFields(fields.map((f: any) => ({ key: f.key, label: f.label, type: f.dataType || 'string' })));
    } catch { /* silent */ }
  };

  const loadSavedQueries = async () => {
    try {
      const res = await api.get('/data-explorer/saved');
      setSavedQueries(res.data.data || []);
    } catch { /* silent */ }
  };

  // ── Build query spec ──
  const buildQuery = useCallback((pageNum = 1): QuerySpec => {
    const q: QuerySpec = {
      filters,
      columns: selectedColumns,
      limit: PAGE_SIZE,
      offset: (pageNum - 1) * PAGE_SIZE,
    };
    if (sortBy) { q.sortBy = sortBy; q.sortDir = sortDir; }
    if (groupBy) {
      q.groupBy = groupBy;
      if (aggregations.length > 0) {
        q.aggregations = aggregations;
      }
    }
    return q;
  }, [filters, selectedColumns, groupBy, aggregations, sortBy, sortDir]);

  // ── Run query ──
  const runQuery = async (pageNum = 1) => {
    setIsLoading(true);
    setPage(pageNum);
    try {
      const res = await api.post('/data-explorer/query', buildQuery(pageNum));
      setResults(res.data.data || []);
      setTotalCount(res.data.meta?.totalCount || 0);
    } catch (err: any) {
      alert('Query failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Export CSV ──
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await api.post('/data-explorer/export', buildQuery(1), { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `cleerio_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert('Export failed.'); }
    finally { setIsExporting(false); }
  };

  // ── Save query ──
  const handleSave = async (name: string) => {
    try {
      await api.post('/data-explorer/saved', { name, querySpec: buildQuery(1) });
      loadSavedQueries();
    } catch { alert('Failed to save.'); }
  };

  // ── Load saved query ──
  const handleLoadSaved = (q: any) => {
    const spec = q.querySpec as QuerySpec;
    setFilters(spec.filters || []);
    setSelectedColumns(spec.columns || ['name', 'mobile', 'outstanding']);
    setGroupBy(spec.groupBy || '');
    setAggregations(spec.aggregations || []);
    if (spec.sortBy) { setSortBy(spec.sortBy); setSortDir((spec.sortDir as 'asc' | 'desc') || 'desc'); }
  };

  // ── Delete saved query ──
  const handleDeleteSaved = async (id: string) => {
    try { await api.delete(`/data-explorer/saved/${id}`); loadSavedQueries(); }
    catch { /* silent */ }
  };

  // ── Sort handler ──
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  // ── Page change ──
  const handlePageChange = (newPage: number) => {
    runQuery(newPage);
  };

  // ── Result columns ──
  const resultColumns = groupBy
    ? ['groupKey', 'recordCount', ...aggregations.map(a => a.alias)]
    : (results.length > 0 ? Object.keys(results[0]) : selectedColumns);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[var(--background)]">
      {/* Toolbar */}
      <Toolbar
        totalCount={totalCount}
        isExporting={isExporting}
        hasResults={results.length > 0}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onExport={handleExport}
        onSave={handleSave}
        groupBy={groupBy}
        onClearGroupBy={() => setGroupBy('')}
        filterCount={filters.length}
        onClearFilters={() => setFilters([])}
      />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          selectedColumns={selectedColumns}
          setSelectedColumns={setSelectedColumns}
          groupBy={groupBy}
          setGroupBy={setGroupBy}
          aggregations={aggregations}
          setAggregations={setAggregations}
          dynamicFields={dynamicFields}
          savedQueries={savedQueries}
          onLoadSaved={handleLoadSaved}
          onDeleteSaved={handleDeleteSaved}
          onRun={() => runQuery(1)}
          isLoading={isLoading}
          isCollapsed={!sidebarOpen}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* KPI Strip — always visible when results exist */}
          <KpiStrip results={results} totalCount={totalCount} isGrouped={!!groupBy} />

          {/* View-dependent content */}
          {viewMode === 'chart' || viewMode === 'summary' ? (
            <ChartPanel results={results} groupBy={groupBy} />
          ) : null}

          {viewMode === 'table' || viewMode === 'summary' ? (
            <ResultsTable
              results={results}
              columns={resultColumns}
              totalCount={totalCount}
              page={page}
              pageSize={PAGE_SIZE}
              isLoading={isLoading}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={handleSort}
              onPageChange={handlePageChange}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

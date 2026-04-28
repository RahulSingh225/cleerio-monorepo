'use client';

import React, { useState } from 'react';
import {
  Filter, Plus, X, ChevronDown, ChevronUp, Columns, BarChart3,
  Zap, Save, Search, Layers,
} from 'lucide-react';
import {
  CORE_FIELDS, COMM_FIELDS, REPAYMENT_FIELDS, OPERATORS,
  QUICK_FILTERS, AGG_FUNCTIONS,
} from '../constants';

// ── Types ──
type FilterRule = { field: string; operator: string; value: any; source: string };
type Aggregation = { field: string; fn: string; alias: string };

interface FilterPanelProps {
  filters: FilterRule[];
  setFilters: (f: FilterRule[]) => void;
  selectedColumns: string[];
  setSelectedColumns: (c: string[]) => void;
  groupBy: string;
  setGroupBy: (g: string) => void;
  aggregations: Aggregation[];
  setAggregations: (a: Aggregation[]) => void;
  dynamicFields: { key: string; label: string; type: string }[];
  savedQueries: any[];
  onLoadSaved: (q: any) => void;
  onDeleteSaved: (id: string) => void;
  onRun: () => void;
  isLoading: boolean;
  isCollapsed: boolean;
}

export function FilterPanel({
  filters, setFilters,
  selectedColumns, setSelectedColumns,
  groupBy, setGroupBy,
  aggregations, setAggregations,
  dynamicFields,
  savedQueries, onLoadSaved, onDeleteSaved,
  onRun, isLoading, isCollapsed,
}: FilterPanelProps) {
  // Filter builder local state
  const [filterSource, setFilterSource] = useState('core');
  const [filterField, setFilterField] = useState('');
  const [filterOp, setFilterOp] = useState('eq');
  const [filterValue, setFilterValue] = useState('');

  // Section toggles
  const [showColumns, setShowColumns] = useState(false);
  const [showGroupBy, setShowGroupBy] = useState(!!groupBy);
  const [showQuick, setShowQuick] = useState(true);
  const [showSaved, setShowSaved] = useState(false);
  const [colSearch, setColSearch] = useState('');

  // Aggregation builder local state
  const [aggFn, setAggFn] = useState('count');
  const [aggField, setAggField] = useState('outstanding');

  if (isCollapsed) return null;

  const getSourceFields = () => {
    switch (filterSource) {
      case 'comm': return COMM_FIELDS;
      case 'repayment': return REPAYMENT_FIELDS;
      case 'dynamic': return dynamicFields;
      default: return CORE_FIELDS;
    }
  };

  const allGroupFields = [
    ...CORE_FIELDS.filter(f => f.type === 'string'),
    ...dynamicFields.map(f => ({ ...f, key: `dynamic.${f.key}` })),
    ...COMM_FIELDS.map(f => ({ ...f, key: `comm.${f.key}` })),
  ];

  const allColumns = [
    ...CORE_FIELDS,
    ...dynamicFields.map(f => ({ ...f, key: `dynamic.${f.key}`, label: `📋 ${f.label}` })),
    ...COMM_FIELDS.map(f => ({ ...f, key: `comm.${f.key}`, label: `📨 ${f.label}` })),
    ...REPAYMENT_FIELDS.map(f => ({ ...f, key: `repayment.${f.key}`, label: `💰 ${f.label}` })),
  ];

  const filteredColumns = colSearch
    ? allColumns.filter(f => f.label.toLowerCase().includes(colSearch.toLowerCase()))
    : allColumns;

  const addFilter = () => {
    if (!filterField) return;
    const noValueOps = ['is_null', 'is_not_null'];
    const val = noValueOps.includes(filterOp)
      ? ''
      : filterOp === 'in'
        ? filterValue.split(',').map(s => s.trim())
        : filterValue;
    setFilters([...filters, { field: filterField, operator: filterOp, value: val, source: filterSource }]);
    setFilterField('');
    setFilterValue('');
    setFilterOp('eq');
  };

  const applyQuickFilter = (qf: typeof QUICK_FILTERS[0]) => {
    setFilters(qf.filters as FilterRule[]);
    if (qf.groupBy) {
      setGroupBy(qf.groupBy);
      setShowGroupBy(true);
    }
  };

  const sourceColors: Record<string, string> = {
    core: 'text-blue-600 bg-blue-50 border-blue-200',
    dynamic: 'text-violet-600 bg-violet-50 border-violet-200',
    comm: 'text-amber-600 bg-amber-50 border-amber-200',
    repayment: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  };

  return (
    <div className="w-[300px] min-w-[300px] h-full flex flex-col border-r border-[var(--border)] bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)] bg-gradient-to-r from-[var(--primary-light)] to-white">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--primary)] flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-white" />
          </div>
          Query Builder
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {/* ── Quick Filters ── */}
        <Section title="Quick Filters" icon={<Zap className="w-3.5 h-3.5 text-amber-500" />} open={showQuick} toggle={() => setShowQuick(!showQuick)}>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_FILTERS.map((qf, i) => (
              <button key={i} onClick={() => applyQuickFilter(qf)}
                className="px-2.5 py-1 text-[11px] font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full border border-blue-100 hover:from-blue-100 hover:to-indigo-100 transition-all hover:shadow-sm">
                {qf.label}
              </button>
            ))}
          </div>
        </Section>

        {/* ── Saved Queries ── */}
        {savedQueries.length > 0 && (
          <Section title={`Saved (${savedQueries.length})`} icon={<Save className="w-3.5 h-3.5 text-violet-500" />} open={showSaved} toggle={() => setShowSaved(!showSaved)}>
            <div className="space-y-1">
              {savedQueries.map((sq) => (
                <div key={sq.id} className="flex items-center justify-between px-2.5 py-1.5 bg-violet-50/60 rounded-lg border border-violet-100 group">
                  <button onClick={() => onLoadSaved(sq)} className="text-[11px] font-medium text-violet-700 hover:underline truncate">{sq.name}</button>
                  <button onClick={() => onDeleteSaved(sq.id)} className="p-0.5 text-violet-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Filters ── */}
        <Section title={`Filters${filters.length > 0 ? ` (${filters.length})` : ''}`} icon={<Filter className="w-3.5 h-3.5 text-blue-500" />} open={true} toggle={() => {}}>
          {/* Source tabs */}
          <div className="grid grid-cols-4 gap-0.5 bg-gray-100 p-0.5 rounded-lg">
            {(['core', 'dynamic', 'comm', 'repayment'] as const).map((src) => (
              <button key={src} onClick={() => { setFilterSource(src); setFilterField(''); }}
                className={`px-1.5 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all ${
                  filterSource === src
                    ? 'bg-white text-[var(--primary)] shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}>
                {src === 'repayment' ? 'repay' : src}
              </button>
            ))}
          </div>

          {/* Field + Operator + Value */}
          <select value={filterField} onChange={(e) => setFilterField(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]">
            <option value="">Select field...</option>
            {getSourceFields().map((f) => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-1.5">
            <select value={filterOp} onChange={(e) => setFilterOp(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-2 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20">
              {OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
            {!['is_null', 'is_not_null'].includes(filterOp) && (
              <input type="text" value={filterValue} onChange={(e) => setFilterValue(e.target.value)}
                placeholder="Value..." onKeyDown={(e) => e.key === 'Enter' && addFilter()}
                className="bg-white border border-gray-200 rounded-lg px-2 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20" />
            )}
          </div>

          <button onClick={addFilter} disabled={!filterField}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-[11px] font-semibold hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-30 shadow-sm">
            <Plus className="w-3 h-3" /> Add Filter
          </button>

          {/* Active filter chips */}
          {filters.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-gray-100">
              {filters.map((f, i) => (
                <div key={i} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border group ${sourceColors[f.source] || 'bg-gray-50 border-gray-200'}`}>
                  <div className="text-[10px] font-medium truncate flex-1 mr-1">
                    <span className="font-bold">{f.field}</span>
                    <span className="opacity-60 mx-1">{f.operator}</span>
                    {!['is_null', 'is_not_null'].includes(f.operator) && (
                      <span className="font-semibold">{Array.isArray(f.value) ? f.value.join(', ') : String(f.value)}</span>
                    )}
                  </div>
                  <button onClick={() => setFilters(filters.filter((_, j) => j !== i))}
                    className="p-0.5 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity flex-shrink-0">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button onClick={() => setFilters([])} className="text-[10px] text-red-500 font-medium hover:underline mt-1">Clear All</button>
            </div>
          )}
        </Section>

        {/* ── Columns ── */}
        <Section title={`Columns (${selectedColumns.length})`} icon={<Columns className="w-3.5 h-3.5 text-indigo-500" />} open={showColumns} toggle={() => setShowColumns(!showColumns)}>
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-gray-400" />
            <input type="text" value={colSearch} onChange={(e) => setColSearch(e.target.value)}
              placeholder="Search columns..."
              className="w-full pl-7 pr-2 py-2 text-[11px] bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20" />
          </div>
          <div className="space-y-0.5 max-h-44 overflow-y-auto">
            {filteredColumns.map((f) => (
              <label key={f.key} className="flex items-center gap-2 text-[11px] text-gray-700 cursor-pointer py-1 px-1.5 rounded-md hover:bg-gray-50 transition-colors">
                <input type="checkbox" checked={selectedColumns.includes(f.key)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedColumns([...selectedColumns, f.key]);
                    else setSelectedColumns(selectedColumns.filter(c => c !== f.key));
                  }}
                  className="w-3 h-3 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]" />
                {f.label}
              </label>
            ))}
          </div>
        </Section>

        {/* ── Group By ── */}
        <Section title="Group By" icon={<BarChart3 className="w-3.5 h-3.5 text-amber-500" />} open={showGroupBy} toggle={() => setShowGroupBy(!showGroupBy)}>
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20">
            <option value="">No grouping</option>
            {allGroupFields.map((f) => (
              <option key={f.key} value={f.key}>{f.label}</option>
            ))}
          </select>
          {groupBy && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Aggregations</p>
              {aggregations.map((agg, i) => (
                <div key={i} className="flex items-center justify-between px-2 py-1 bg-amber-50 rounded-md border border-amber-100 text-[10px] font-medium text-amber-800">
                  <span>{agg.fn}({agg.field})</span>
                  <button onClick={() => setAggregations(aggregations.filter((_, j) => j !== i))} className="text-amber-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                </div>
              ))}
              <div className="flex gap-1">
                <select value={aggFn} onChange={(e) => setAggFn(e.target.value)}
                  className="flex-1 text-[10px] bg-white border border-gray-200 rounded px-1.5 py-1.5">
                  {AGG_FUNCTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
                <select value={aggField} onChange={(e) => setAggField(e.target.value)}
                  className="flex-[2] text-[10px] bg-white border border-gray-200 rounded px-1.5 py-1.5">
                  {CORE_FIELDS.filter(f => f.type === 'number').map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
              </div>
              <button onClick={() => {
                if (aggFn && aggField) setAggregations([...aggregations, { fn: aggFn, field: aggField, alias: `${aggFn}_${aggField}` }]);
              }} className="text-[10px] text-[var(--primary)] font-semibold hover:underline">+ Add Aggregation</button>
            </div>
          )}
        </Section>
      </div>

      {/* Run Query Button — sticky at bottom */}
      <div className="px-3 py-3 border-t border-[var(--border)] bg-gradient-to-t from-gray-50 to-white">
        <button onClick={onRun} disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[var(--primary)] to-indigo-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100">
          <Search className="w-4 h-4" />
          {isLoading ? 'Querying...' : 'Run Query'}
        </button>
      </div>
    </div>
  );
}

// ── Collapsible Section Helper ──
function Section({ title, icon, open, toggle, children }: {
  title: string; icon: React.ReactNode; open: boolean; toggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <button onClick={toggle}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors">
        <span className="flex items-center gap-2 text-xs font-bold text-gray-700">{icon}{title}</span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
      </button>
      {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  );
}

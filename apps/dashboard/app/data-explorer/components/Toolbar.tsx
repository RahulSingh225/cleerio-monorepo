'use client';

import React, { useState } from 'react';
import {
  Download, Save, X, Loader2, PanelLeftClose, PanelLeft,
  Table2, BarChart3, LayoutGrid, BookmarkPlus,
} from 'lucide-react';

export type ViewMode = 'table' | 'chart' | 'summary';

interface ToolbarProps {
  totalCount: number;
  isExporting: boolean;
  hasResults: boolean;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  onExport: () => void;
  onSave: (name: string) => void;
  groupBy: string;
  onClearGroupBy: () => void;
  filterCount: number;
  onClearFilters: () => void;
}

export function Toolbar({
  totalCount, isExporting, hasResults,
  viewMode, setViewMode,
  sidebarOpen, toggleSidebar,
  onExport, onSave,
  groupBy, onClearGroupBy,
  filterCount, onClearFilters,
}: ToolbarProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');

  const handleSave = () => {
    if (!saveName.trim()) return;
    onSave(saveName);
    setSaveName('');
    setShowSaveModal(false);
  };

  const tabs: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: 'table', label: 'Table', icon: <Table2 className="w-3.5 h-3.5" /> },
    { key: 'chart', label: 'Chart', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { key: 'summary', label: 'Summary', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-white">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}>
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>

          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Data Explorer</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {filterCount > 0 && (
                <button onClick={onClearFilters} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors flex items-center gap-1">
                  {filterCount} filter{filterCount > 1 ? 's' : ''}
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
              {groupBy && (
                <button onClick={onClearGroupBy} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100 transition-colors flex items-center gap-1">
                  Grouped: {groupBy.replace('dynamic.', '')}
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
              {hasResults && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                  {totalCount.toLocaleString()} records
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center — View Mode Tabs */}
        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setViewMode(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                viewMode === tab.key
                  ? 'bg-white text-[var(--primary)] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right side — Actions */}
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors">
            <BookmarkPlus className="w-3.5 h-3.5" />
            Save
          </button>
          <button onClick={onExport} disabled={isExporting || !hasResults}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-40">
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Export CSV
          </button>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Save Query</h2>
              <button onClick={() => setShowSaveModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <input type="text" value={saveName} onChange={(e) => setSaveName(e.target.value)}
                placeholder="Give your query a name..."
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]" />
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                {filterCount > 0 && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{filterCount} filters</span>}
                {groupBy && <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full">grouped by {groupBy}</span>}
              </div>
              <button onClick={handleSave} disabled={!saveName.trim()}
                className="w-full bg-gradient-to-r from-[var(--primary)] to-indigo-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Query
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

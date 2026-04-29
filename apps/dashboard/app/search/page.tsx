'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { DpdBadge, StatusBadge } from '@/components/ui/status-badge';
import {
  Search, Loader2, Phone, User, MapPin, Briefcase,
  IndianRupee, MessageSquare, ArrowRight, XCircle,
  Hash, Mail, FileText,
} from 'lucide-react';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      setTotalCount(0);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get('/portfolio-records/search', { params: { q: q.trim(), limit: 50 } });
      setResults(res.data.data || []);
      setTotalCount(res.data.meta?.totalCount || 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 400);
  };

  // Group results by mobile number
  const groupedByMobile: Record<string, any[]> = {};
  for (const r of results) {
    const key = r.mobile || 'unknown';
    if (!groupedByMobile[key]) groupedByMobile[key] = [];
    groupedByMobile[key].push(r);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Borrower Search</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Search across all portfolios by mobile number, user ID, name, loan number, or email.
        </p>
      </div>

      {/* Search Box */}
      <div className="card p-1">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search by mobile, name, user ID, loan number, or email..."
            autoFocus
            className="w-full pl-12 pr-12 py-4 text-base bg-transparent rounded-xl focus:outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults([]); setSearched(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
        </div>
      )}

      {/* Results */}
      {!loading && searched && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-secondary)]">
              Found <span className="font-bold text-[var(--text-primary)]">{totalCount}</span> records
              across <span className="font-bold text-[var(--text-primary)]">{Object.keys(groupedByMobile).length}</span> unique borrowers
            </p>
          </div>

          {results.length === 0 ? (
            <div className="card py-16 flex flex-col items-center justify-center text-center space-y-3">
              <Search className="w-10 h-10 text-gray-300" />
              <h4 className="text-base font-bold text-gray-700">No Results Found</h4>
              <p className="text-sm text-gray-400 max-w-sm">
                Try searching with a different term. You can search by mobile number, borrower name, user ID, loan number, or email address.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedByMobile).map(([mobile, records]) => (
                <div key={mobile} className="card overflow-hidden">
                  {/* Mobile group header */}
                  <div className="px-5 py-3 bg-gradient-to-r from-[var(--surface-secondary)] to-transparent border-b border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">{mobile}</p>
                        <p className="text-[10px] text-[var(--text-tertiary)]">
                          {records.length} {records.length === 1 ? 'record' : 'records'} across portfolios
                        </p>
                      </div>
                    </div>
                    {records.length > 1 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Multi-account
                      </span>
                    )}
                  </div>

                  {/* Records for this mobile */}
                  <div className="divide-y divide-[var(--border-light)]">
                    {records.map((record) => (
                      <div
                        key={record.id}
                        onClick={() => router.push(`/cases/${record.id}`)}
                        className="flex items-center justify-between px-5 py-4 hover:bg-blue-50/30 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {(record.name || 'U').charAt(0).toUpperCase()}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{record.name || 'Unknown'}</p>
                              <DpdBadge days={record.currentDpd || 0} />
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-[11px] text-[var(--text-tertiary)]">
                              <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{record.userId}</span>
                              {record.loanNumber && <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{record.loanNumber}</span>}
                              {record.product && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{record.product}</span>}
                              {record.state && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{record.state}</span>}
                            </div>
                          </div>

                          {/* Quick metrics */}
                          <div className="hidden md:flex items-center gap-4 shrink-0">
                            <div className="text-right">
                              <p className="text-xs text-[var(--text-tertiary)]">Outstanding</p>
                              <p className="text-sm font-bold text-[var(--text-primary)]">₹{Number(record.outstanding || 0).toLocaleString('en-IN')}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-[var(--text-tertiary)]">Comms</p>
                              <p className="text-sm font-bold text-[var(--text-primary)]">{record.totalCommAttempts || 0}</p>
                            </div>
                            {record.lastDeliveryStatus && (
                              <StatusBadge
                                label={record.lastDeliveryStatus}
                                variant={record.lastDeliveryStatus === 'delivered' ? 'success' : record.lastDeliveryStatus === 'failed' ? 'critical' : 'info'}
                              />
                            )}
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[var(--primary)] transition-colors ml-3 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state (before search) */}
      {!searched && !loading && (
        <div className="card py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Search className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Find any borrower</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-md">
              Search across all portfolios and allocation months. Results are grouped by mobile number to show the complete borrower picture.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
            <span className="px-2 py-1 bg-[var(--surface-secondary)] rounded-md">Mobile</span>
            <span className="px-2 py-1 bg-[var(--surface-secondary)] rounded-md">Name</span>
            <span className="px-2 py-1 bg-[var(--surface-secondary)] rounded-md">User ID</span>
            <span className="px-2 py-1 bg-[var(--surface-secondary)] rounded-md">Loan #</span>
            <span className="px-2 py-1 bg-[var(--surface-secondary)] rounded-md">Email</span>
          </div>
        </div>
      )}
    </div>
  );
}

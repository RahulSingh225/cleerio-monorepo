'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { ClipboardList, User, Loader2, Filter } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ action: '', entityType: '' });

  useEffect(() => { fetchLogs(); }, [filters]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.entityType) params.append('entityType', filters.entityType);
      const res = await api.get(`/audit-logs?${params.toString()}`);
      setLogs(res.data.data || []);
    } catch (err) { console.error('Failed to fetch audit logs'); }
    finally { setIsLoading(false); }
  };

  const actionColors: Record<string, string> = {
    create: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    update: 'bg-blue-50 text-blue-600 border-blue-100',
    delete: 'bg-red-50 text-red-600 border-red-100',
    login: 'bg-violet-50 text-violet-600 border-violet-100',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Audit Logs" subtitle="Track all system actions for compliance and debugging." />

      <div className="card p-4 flex items-center gap-4">
        <Filter className="w-4 h-4 text-[var(--text-tertiary)]" />
        <select value={filters.action} onChange={(e) => setFilters({...filters, action: e.target.value})} className="bg-white border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20">
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="login">Login</option>
        </select>
        <select value={filters.entityType} onChange={(e) => setFilters({...filters, entityType: e.target.value})} className="bg-white border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20">
          <option value="">All Entities</option>
          <option value="tenant">Tenant</option>
          <option value="portfolio">Portfolio</option>
          <option value="workflow_rule">Workflow Rule</option>
          <option value="template">Template</option>
          <option value="user">User</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-secondary)]">
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Timestamp</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Actor</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Action</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Entity</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Entity ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {isLoading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="h-4 bg-[var(--surface-secondary)] rounded animate-pulse" /></td></tr>
            )) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                <td className="px-5 py-3 text-xs text-[var(--text-secondary)] font-mono">{log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                    <span className="text-sm text-[var(--text-primary)]">{log.actorId?.substring(0, 8) || 'system'}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${actionColors[log.action] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-[var(--text-secondary)]">{log.entityType || '—'}</td>
                <td className="px-5 py-3"><code className="text-xs font-mono text-[var(--text-tertiary)]">{log.entityId?.substring(0, 8) || '—'}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && logs.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
            <ClipboardList className="w-10 h-10 text-[var(--text-tertiary)]" />
            <h4 className="text-base font-semibold text-[var(--text-primary)]">No Audit Logs</h4>
            <p className="text-sm text-[var(--text-secondary)]">System activity will be recorded once audit logging is active.</p>
          </div>
        )}
      </div>
    </div>
  );
}

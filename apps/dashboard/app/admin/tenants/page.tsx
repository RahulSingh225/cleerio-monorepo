'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import Link from 'next/link';
import {
  Plus, Search, Building2, X, Loader2, ChevronRight, ExternalLink
} from 'lucide-react';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: '', code: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchTenants(); }, []);

  const fetchTenants = async () => {
    try {
      const response = await api.get('/tenants');
      setTenants(response.data.data || []);
    } catch (err) { console.error('Failed to fetch tenants'); }
    finally { setIsLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/tenants', newTenant);
      setShowModal(false);
      setNewTenant({ name: '', code: '' });
      fetchTenants();
    } catch (err) { alert('Failed to create tenant. Ensure the code is unique.'); }
    finally { setIsSubmitting(false); }
  };

  const filtered = tenants.filter(t =>
    !searchTerm ||
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Tenant Management"
        subtitle="Provision and manage isolated client environments."
        actions={
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> New Tenant
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Total Tenants</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{tenants.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{tenants.filter(t => t.status === 'active').length}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Onboarding</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{tenants.filter(t => t.status === 'onboarding').length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input type="text" placeholder="Filter by name or code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20" />
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-secondary)]">
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Tenant</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Code</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Created</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {isLoading ? Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="h-5 bg-[var(--surface-secondary)] rounded animate-pulse" /></td></tr>
            )) : filtered.map((tenant) => (
              <Link key={tenant.id} href={`/admin/tenants/${tenant.id}`} className="contents">
                <tr className="group hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {tenant.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">{tenant.name}</p>
                        <p className="text-[10px] text-[var(--text-tertiary)]">ID: {tenant.id?.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <code className="text-xs font-bold px-2 py-1 rounded bg-[var(--surface-secondary)] border border-[var(--border-light)] text-[var(--text-secondary)]">{tenant.code}</code>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge label={tenant.status || 'unknown'} variant={tenant.status === 'active' ? 'success' : tenant.status === 'onboarding' ? 'info' : 'neutral'} />
                  </td>
                  <td className="px-5 py-3 text-sm text-[var(--text-tertiary)]">
                    {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--primary)] transition-colors opacity-0 group-hover:opacity-100" />
                  </td>
                </tr>
              </Link>
            ))}
          </tbody>
        </table>

        {!isLoading && filtered.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
            <Building2 className="w-10 h-10 text-[var(--text-tertiary)]" />
            <h4 className="text-base font-semibold text-[var(--text-primary)]">No Tenants Found</h4>
            <p className="text-sm text-[var(--text-secondary)]">Create your first tenant to get started.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-[var(--border)] rounded-xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><Building2 className="w-5 h-5" /></div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">New Tenant</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Organization Name</label>
                <input type="text" required value={newTenant.name} onChange={(e) => setNewTenant({...newTenant, name: e.target.value})} placeholder="e.g. Refine Portfolio Services"
                  className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Unique Code</label>
                <input type="text" required value={newTenant.code} onChange={(e) => setNewTenant({...newTenant, code: e.target.value.toUpperCase().replace(/\s+/g, '_')})} placeholder="e.g. REFINE"
                  className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)] uppercase" />
                <p className="text-xs text-[var(--text-tertiary)]">Used in API calls. Must be unique.</p>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-[var(--primary)] text-white font-semibold py-2.5 rounded-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isSubmitting ? 'Creating...' : 'Create Tenant'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

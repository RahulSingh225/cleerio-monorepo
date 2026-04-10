'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Building2, Users, Plus, X, Save, Loader2, Shield, Eye, Edit, UserMinus,
  CheckCircle, Database, Layers, MessageSquare, FileText, Route as WorkflowIcon
} from 'lucide-react';

export default function TenantDetailPage() {
  const params = useParams();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
  const [showUserModal, setShowUserModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', name: '', password: '', role: 'ops' });

  // Config check state
  const [configStatus, setConfigStatus] = useState({ fields: 0, buckets: 0, channels: 0, templates: 0, workflows: 0 });

  useEffect(() => { fetchTenant(); fetchUsers(); fetchConfigStatus(); }, [tenantId]);

  const fetchTenant = async () => {
    try {
      const res = await api.get(`/tenants/by-id/${tenantId}`);
      setTenant(res.data.data);
    } catch (err) { console.error('Failed to fetch tenant'); }
    finally { setIsLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/tenant-users', { headers: { 'x-tenant-id': tenantId } });
      setUsers(res.data.data || []);
    } catch (err) { console.error('Failed to fetch users'); }
  };

  const fetchConfigStatus = async () => {
    try {
      const headers = { 'x-tenant-id': tenantId };
      const [fields, buckets, channels, templates, workflows] = await Promise.all([
        api.get('/tenant-field-registry', { headers }).catch(() => ({ data: { data: [] } })),
        api.get('/dpd-bucket-configs', { headers }).catch(() => ({ data: { data: [] } })),
        api.get('/channel-configs', { headers }).catch(() => ({ data: { data: [] } })),
        api.get('/comm-templates', { headers }).catch(() => ({ data: { data: [] } })),
        api.get('/journeys', { headers }).catch(() => ({ data: { data: [] } })),
      ]);
      setConfigStatus({
        fields: (fields.data.data || []).length,
        buckets: (buckets.data.data || []).length,
        channels: (channels.data.data || []).length,
        templates: (templates.data.data || []).length,
        workflows: (workflows.data.data || []).length,
      });
    } catch (err) {}
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/tenant-users', { ...newUser, tenantId }, { headers: { 'x-tenant-id': tenantId } });
      setShowUserModal(false);
      setNewUser({ email: '', name: '', password: '', role: 'ops' });
      fetchUsers();
    } catch (err) { alert('Failed to create user.'); }
    finally { setIsSubmitting(false); }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" /></div>;

  const configItems = [
    { label: 'Field Registry', count: configStatus.fields, icon: Database, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'DPD Buckets', count: configStatus.buckets, icon: Layers, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Channels', count: configStatus.channels, icon: MessageSquare, color: 'text-blue-600 bg-blue-50' },
    { label: 'Templates', count: configStatus.templates, icon: FileText, color: 'text-violet-600 bg-violet-50' },
    { label: 'Journeys', count: configStatus.workflows, icon: WorkflowIcon, color: 'text-orange-600 bg-orange-50' },
  ];

  const roleColors: Record<string, string> = {
    tenant_admin: 'success',
    ops: 'info',
    analyst: 'warning',
    viewer: 'neutral',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={tenant?.name || 'Tenant'}
        subtitle={`Code: ${tenant?.code} • ID: ${tenantId.substring(0, 8)}...`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge label={tenant?.status || 'unknown'} variant={tenant?.status === 'active' ? 'success' : 'warning'} />
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--border)]">
        {(['overview', 'users'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab === 'users' && <Users className="w-4 h-4 inline mr-1.5" />}
            {tab === 'overview' && <Building2 className="w-4 h-4 inline mr-1.5" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Tenant details */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Tenant Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Name</p><p className="text-sm font-medium text-[var(--text-primary)] mt-1">{tenant?.name}</p></div>
              <div><p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Code</p><p className="text-sm font-medium text-[var(--text-primary)] mt-1 font-mono">{tenant?.code}</p></div>
              <div><p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Status</p><div className="mt-1"><StatusBadge label={tenant?.status} variant={tenant?.status === 'active' ? 'success' : 'warning'} /></div></div>
              <div><p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Created</p><p className="text-sm font-medium text-[var(--text-primary)] mt-1">{tenant?.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : '—'}</p></div>
            </div>
          </div>

          {/* Config status */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Configuration Status</h3>
            <div className="grid grid-cols-5 gap-3">
              {configItems.map(item => (
                <div key={item.label} className="card p-4 flex flex-col items-center text-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color} mb-2`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{item.count}</p>
                  <p className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{item.label}</p>
                  {item.count > 0 ? <CheckCircle className="w-4 h-4 text-emerald-500 mt-1.5" /> : <div className="w-4 h-4 rounded-full border-2 border-[var(--border)] mt-1.5" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-secondary)]">{users.length} user{users.length !== 1 ? 's' : ''}</p>
            <button onClick={() => setShowUserModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors">
              <Plus className="w-4 h-4" /> Invite User
            </button>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-secondary)]">
                  <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">User</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                          {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">{user.name || '—'}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge label={user.role?.replace('_', ' ')} variant={(roleColors[user.role] || 'neutral') as any} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge label={user.status} variant={user.status === 'active' ? 'success' : 'neutral'} />
                    </td>
                    <td className="px-5 py-3 text-sm text-[var(--text-secondary)]">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                <Users className="w-10 h-10 text-[var(--text-tertiary)]" />
                <h4 className="text-base font-semibold text-[var(--text-primary)]">No Users</h4>
                <p className="text-sm text-[var(--text-secondary)] max-w-xs">Invite the first user to start using this tenant.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-[var(--border)] rounded-xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><Users className="w-5 h-5" /></div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">Invite User</h2>
              </div>
              <button onClick={() => setShowUserModal(false)} className="p-1.5 rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Full Name</label>
                  <input type="text" required value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} placeholder="John Doe" className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Email</label>
                  <input type="email" required value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} placeholder="john@company.com" className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Password</label>
                  <input type="password" required value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} placeholder="••••••••" className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Role</label>
                  <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]">
                    <option value="tenant_admin">Tenant Admin</option>
                    <option value="ops">Operations</option>
                    <option value="analyst">Analyst</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-[var(--primary)] text-white font-semibold py-2.5 rounded-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSubmitting ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

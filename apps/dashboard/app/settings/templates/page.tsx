'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/data-table';
import { Plus, FileText, Trash2, X, Save, Loader2 } from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', channel: 'sms', body: '', language: 'en', dpdBucket: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchTemplates(); }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/comm-templates');
      setTemplates(response.data.data || []);
    } catch (err) { console.error('Failed to fetch templates'); }
    finally { setIsLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/comm-templates', newTemplate);
      setShowModal(false);
      setNewTemplate({ name: '', channel: 'sms', body: '', language: 'en', dpdBucket: '' });
      fetchTemplates();
    } catch (err) { alert('Failed to create template.'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/comm-templates/${id}`);
      setTemplates(templates.filter(t => t.id !== id));
    } catch (err) { alert('Failed to delete template.'); }
  };

  const columns = [
    {
      key: 'name',
      header: 'Template Name',
      render: (row: any) => (
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{row.name}</p>
          <p className="text-xs text-[var(--text-tertiary)]">v{row.version} · {row.language?.toUpperCase()}</p>
        </div>
      ),
    },
    {
      key: 'channel',
      header: 'Channel',
      render: (row: any) => <StatusBadge label={row.channel} variant="info" />,
    },
    {
      key: 'dpdBucket',
      header: 'DPD Bucket',
      render: (row: any) => <span className="text-sm text-[var(--text-secondary)]">{row.dpdBucket || 'All'}</span>,
    },
    {
      key: 'body',
      header: 'Message Preview',
      render: (row: any) => (
        <p className="text-sm text-[var(--text-secondary)] max-w-xs truncate">{row.body}</p>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (row: any) => <StatusBadge label={row.isActive ? 'Active' : 'Draft'} variant={row.isActive ? 'success' : 'neutral'} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-10',
      render: (row: any) => (
        <button onClick={() => handleDelete(row.id)} className="p-1.5 rounded-md hover:bg-red-50 text-[var(--text-tertiary)] hover:text-red-500 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Communication Templates"
        subtitle="Manage message templates for SMS, WhatsApp, and voice workflows."
        actions={
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> New Template
          </button>
        }
      />

      {isLoading ? (
        <div className="card p-12 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--text-tertiary)]" />
        </div>
      ) : templates.length > 0 ? (
        <DataTable columns={columns} data={templates} />
      ) : (
        <div className="card py-16 flex flex-col items-center text-center space-y-3">
          <FileText className="w-10 h-10 text-[var(--text-tertiary)]" />
          <h4 className="text-base font-semibold text-[var(--text-primary)]">No Templates Yet</h4>
          <p className="text-sm text-[var(--text-secondary)]">Create your first template to use in collection workflows.</p>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">Create Template</button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-[var(--border)] rounded-xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">New Template</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Template Name</label>
                <input type="text" required value={newTemplate.name} onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})} placeholder="Payment Reminder v1" className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Channel</label>
                  <select value={newTemplate.channel} onChange={(e) => setNewTemplate({...newTemplate, channel: e.target.value})} className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]">
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="ivr">IVR</option>
                    <option value="voice_bot">Voice Bot</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">DPD Bucket (optional)</label>
                  <input type="text" value={newTemplate.dpdBucket} onChange={(e) => setNewTemplate({...newTemplate, dpdBucket: e.target.value})} placeholder="EARLY_BUCKET" className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Message Body</label>
                <textarea required value={newTemplate.body} onChange={(e) => setNewTemplate({...newTemplate, body: e.target.value})} rows={4} placeholder="Hi {{name}}, your payment of ₹{{overdue}} is overdue..." className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)] resize-none" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-[var(--primary)] text-white font-semibold py-2.5 rounded-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSubmitting ? 'Creating...' : 'Create Template'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

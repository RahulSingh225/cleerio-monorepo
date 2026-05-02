'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/data-table';
import { Plus, FileText, Trash2, X, Save, Loader2, PlusCircle } from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [systemFields, setSystemFields] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState<{
    name: string;
    channel: string;
    body: string;
    language: string;
    providerTemplateId: string;
    providerVariables: { vendorVar: string; systemVar: string }[];
  }>({ name: '', channel: 'sms', body: '', language: 'en', providerTemplateId: '', providerVariables: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTemplates();
    fetchSystemFields();
  }, []);

  const fetchSystemFields = async () => {
    try {
      const response = await api.get('/tenant-field-registry/mapping');
      let fields = response.data.data || [];
      // Sort so that isCore === true comes first
      fields.sort((a: any, b: any) => {
        if (a.isCore && !b.isCore) return -1;
        if (!a.isCore && b.isCore) return 1;
        return 0;
      });
      setSystemFields(fields);
    } catch (err) {
      console.error('Failed to fetch system fields');
    }
  };

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
      setNewTemplate({ name: '', channel: 'sms', body: '', language: 'en', providerTemplateId: '', providerVariables: [] });
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

  const handleAddVariable = () => {
    setNewTemplate({ ...newTemplate, providerVariables: [...newTemplate.providerVariables, { vendorVar: '', systemVar: '' }] });
  };

  const handleUpdateVariable = (index: number, field: 'vendorVar' | 'systemVar', value: string) => {
    const vars = [...newTemplate.providerVariables];
    vars[index][field] = value;
    setNewTemplate({ ...newTemplate, providerVariables: vars });
  };

  const handleRemoveVariable = (index: number) => {
    const vars = [...newTemplate.providerVariables];
    vars.splice(index, 1);
    setNewTemplate({ ...newTemplate, providerVariables: vars });
  };

  const columns = [
    {
      key: 'name',
      header: 'Template Name',
      render: (row: any) => (
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{row.name}</p>
          <p className="text-xs text-[var(--text-tertiary)]">v{row.version || '1.0'} · {row.language?.toUpperCase()}</p>
        </div>
      ),
    },
    {
      key: 'channel',
      header: 'Channel',
      render: (row: any) => <StatusBadge label={row.channel} variant="info" />,
    },
    {
      key: 'providerTemplateId',
      header: 'Provider Template ID',
      render: (row: any) => <span className="text-sm text-[var(--text-secondary)]">{row.providerTemplateId || 'Internal Mode'}</span>,
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
        <div className="fixed inset-0 z-[9999] grid place-items-center h-[100dvh] w-full p-6 bg-black/40 backdrop-blur-sm overflow-hidden">
          <div className="w-full max-w-lg bg-white border border-[var(--border)] rounded-xl shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">New Template</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Template Name</label>
                <input type="text" required value={newTemplate.name} onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })} placeholder="Payment Reminder v1" className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Channel</label>
                  <select value={newTemplate.channel} onChange={(e) => setNewTemplate({ ...newTemplate, channel: e.target.value })} className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]">
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="ivr">IVR</option>
                    <option value="voice_bot">Voice Bot</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">External Provider Template ID</label>
                  <input type="text" value={newTemplate.providerTemplateId} onChange={(e) => setNewTemplate({ ...newTemplate, providerTemplateId: e.target.value })} placeholder="MSG91_TEMP_123" className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Provider Variables Mapping</label>
                  <button type="button" onClick={handleAddVariable} className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium flex items-center gap-1">
                    <PlusCircle className="w-3.5 h-3.5" /> Add Variable
                  </button>
                </div>
                {newTemplate.providerVariables.length === 0 ? (
                  <p className="text-xs text-[var(--text-tertiary)] italic">No variables mapped.</p>
                ) : (
                  <div className="space-y-2">
                    {newTemplate.providerVariables.map((v, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input type="text" value={v.vendorVar} onChange={(e) => handleUpdateVariable(i, 'vendorVar', e.target.value)} placeholder="Vendor Var (e.g. VAR1)" className="flex-1 bg-white border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
                        <span className="text-gray-400">→</span>
                        <input type="text" list="core-system-fields" value={v.systemVar} onChange={(e) => handleUpdateVariable(i, 'systemVar', e.target.value)} placeholder="System Field or Static URL" className="flex-1 bg-white border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
                        <button type="button" onClick={() => handleRemoveVariable(i)} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <datalist id="core-system-fields">
                      {systemFields.map((field) => {
                        const varKey = field.isCore ? field.displayLabel : field.headerName;
                        return (
                          <option key={field.id} value={`{{${varKey}}}`}>
                            {field.displayLabel || field.headerName} {field.isCore ? '(core)' : '(dynamic)'}
                          </option>
                        );
                      })}
                      {/* Fallback to display even if DB is entirely empty */}
                      {systemFields.length === 0 && (
                        <>
                          <option value="{{name}}">Customer Name</option>
                          <option value="{{mobile}}">Mobile Number</option>
                          <option value="{{outstanding}}">Outstanding Balance</option>
                        </>
                      )}
                    </datalist>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Message Body Preview / Content</label>
                <textarea required value={newTemplate.body} onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })} rows={3} placeholder="Hi {{name}}, your payment of ₹{{overdue}} is overdue..." className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)] resize-none" />
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

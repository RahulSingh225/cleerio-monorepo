'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Plus, Database, X, Save, Loader2, Tag, Eye, EyeOff, Hash } from 'lucide-react';

export default function FieldRegistryPage() {
  const [fields, setFields] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newField, setNewField] = useState({
    headerName: '', displayLabel: '', dataType: 'string', isCore: false, isPii: false,
  });

  useEffect(() => { fetchFields(); }, []);

  const fetchFields = async () => {
    try {
      const res = await api.get('/tenant-field-registry');
      setFields(res.data.data || []);
    } catch (err) { console.error('Failed to fetch fields'); }
    finally { setIsLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const nextIndex = fields.length;
      await api.post('/tenant-field-registry', {
        ...newField,
        fieldKey: `field${nextIndex + 1}`,
        fieldIndex: nextIndex,
      });
      setShowModal(false);
      setNewField({ headerName: '', displayLabel: '', dataType: 'string', isCore: false, isPii: false });
      fetchFields();
    } catch (err) { alert('Failed to create field mapping.'); }
    finally { setIsSubmitting(false); }
  };

  const dataTypeColors: Record<string, string> = {
    string: 'bg-blue-50 text-blue-600 border-blue-100',
    number: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    date: 'bg-violet-50 text-violet-600 border-violet-100',
    boolean: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Field Registry"
        subtitle="Map CSV column headers to stable field keys for consistent data processing."
        actions={
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Mapping
          </button>
        }
      />

      {/* Field count summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Total Fields</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{fields.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Core Fields</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{fields.filter(f => f.isCore).length}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">PII Fields</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{fields.filter(f => f.isPii).length}</p>
        </div>
        <div className="card p-4">
          <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Dynamic Fields</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{fields.filter(f => !f.isCore).length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-secondary)]">
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Field Key</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">CSV Header</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Display Label</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Type</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Flags</th>
              <th className="px-5 py-3 text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Sample</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-4 bg-[var(--surface-secondary)] rounded animate-pulse" /></td></tr>
              ))
            ) : fields.map((field) => (
              <tr key={field.id} className="hover:bg-[var(--surface-secondary)] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-[var(--primary)]" />
                    <code className="text-xs font-bold text-[var(--primary)] bg-[var(--primary-light)] px-2 py-0.5 rounded">{field.fieldKey}</code>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-[var(--text-primary)] font-medium">{field.headerName}</td>
                <td className="px-5 py-3 text-sm text-[var(--text-secondary)]">{field.displayLabel}</td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${dataTypeColors[field.dataType] || 'bg-gray-50 text-gray-600'}`}>
                    {field.dataType}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    {field.isCore && <StatusBadge label="Core" variant="success" />}
                    {field.isPii && <StatusBadge label="PII" variant="critical" />}
                    {!field.isCore && !field.isPii && <span className="text-xs text-[var(--text-tertiary)]">—</span>}
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-[var(--text-tertiary)] font-mono">{field.sampleValue || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isLoading && fields.length === 0 && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
            <Database className="w-10 h-10 text-[var(--text-tertiary)]" />
            <h4 className="text-base font-semibold text-[var(--text-primary)]">No Field Mappings</h4>
            <p className="text-sm text-[var(--text-secondary)] max-w-xs">Map your CSV column headers to stable field keys before uploading portfolios.</p>
            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">Add First Mapping</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-[var(--border)] rounded-xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><Database className="w-5 h-5" /></div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">New Field Mapping</h2>
                  <p className="text-xs text-[var(--text-tertiary)]">Will be assigned to field{fields.length + 1}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-md hover:bg-[var(--surface-hover)] text-[var(--text-tertiary)]"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">CSV Header Name</label>
                  <input type="text" required value={newField.headerName} onChange={(e) => setNewField({...newField, headerName: e.target.value})} placeholder="e.g. current_dpd" className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">Display Label</label>
                  <input type="text" required value={newField.displayLabel} onChange={(e) => setNewField({...newField, displayLabel: e.target.value})} placeholder="e.g. currentDpd" className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">Data Type</label>
                <select value={newField.dataType} onChange={(e) => setNewField({...newField, dataType: e.target.value})} className="w-full bg-white border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 focus:border-[var(--primary)]">
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="boolean">Boolean</option>
                </select>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newField.isCore} onChange={(e) => setNewField({...newField, isCore: e.target.checked})} className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]" />
                  <span className="text-sm text-[var(--text-primary)]">Core Field</span>
                  <Tag className="w-3.5 h-3.5 text-emerald-500" />
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newField.isPii} onChange={(e) => setNewField({...newField, isPii: e.target.checked})} className="w-4 h-4 rounded border-[var(--border)] text-red-500 focus:ring-red-500" />
                  <span className="text-sm text-[var(--text-primary)]">PII Sensitive</span>
                  <EyeOff className="w-3.5 h-3.5 text-red-500" />
                </label>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-[var(--primary)] text-white font-semibold py-2.5 rounded-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSubmitting ? 'Creating...' : 'Create Field Mapping'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

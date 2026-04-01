'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { StatusBadge, DpdBadge } from '@/components/ui/status-badge';
import {
  ArrowLeft,
  Edit3,
  Plus,
  Phone,
  Calendar,
  FileText,
  MessageSquare,
  PhoneCall,
  MapPin,
  Mail,
  User,
  Loader2,
} from 'lucide-react';

export default function CaseDetailsPage() {
  const params = useParams();
  const recordId = params.id as string;
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (recordId) loadRecord();
  }, [recordId]);

  const loadRecord = async () => {
    try {
      const res = await api.get(`/portfolio-records/${recordId}`);
      setRecord(res.data.data);
    } catch (err) {
      console.error('Failed to load record', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--text-tertiary)]" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <p className="text-[var(--text-secondary)]">Record not found</p>
        <Link href="/cases" className="text-sm text-[var(--primary)] hover:underline">← Back to Cases</Link>
      </div>
    );
  }

  const dynamicFields = record.dynamicFields || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/cases" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Cases
        </Link>
        <span className="text-[var(--text-tertiary)]">›</span>
        <span className="text-[var(--text-primary)] font-medium">{record.name || record.userId}</span>
      </div>

      {/* Main Header */}
      <div className="card p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[var(--text-primary)]">{record.name || 'Borrower'}</h1>
              <DpdBadge days={record.currentDpd || 0} />
              {record.dpdBucket && <StatusBadge label={record.dpdBucket} variant="info" />}
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              User ID: <span className="font-medium">{record.userId}</span> · Mobile: {record.mobile}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors">
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors">
              <Plus className="w-4 h-4" />
              New Action
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border)]">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors">
            <Phone className="w-3 h-3" /> Trigger AI Call
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors">
            <Calendar className="w-3 h-3" /> Schedule
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors">
            <MessageSquare className="w-3 h-3" /> Send SMS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Financial Summary */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Financial Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Outstanding</span>
                <span className="text-lg font-bold text-[var(--text-primary)]">₹{Number(record.outstanding || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Overdue Amount</span>
                <span className="text-sm font-semibold text-red-600">₹{Number(record.overdue || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Current DPD</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{record.currentDpd || 0} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Product</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{record.product || '-'}</span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[var(--text-tertiary)]" />
                <span className="text-[var(--text-primary)]">{record.mobile}</span>
              </div>
              {record.employerId && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <span className="text-[var(--text-primary)]">Employer: {record.employerId}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--surface-hover)]">
                <PhoneCall className="w-4 h-4" /> Call
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--surface-hover)]">
                <MessageSquare className="w-4 h-4" /> SMS
              </button>
            </div>
          </div>

          {/* Opt-Out Status */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Communication</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Opted Out (DNC)</span>
              <StatusBadge label={record.isOptedOut ? 'Yes' : 'No'} variant={record.isOptedOut ? 'critical' : 'success'} />
            </div>
          </div>
        </div>

        {/* Center + Right: Dynamic Fields */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-5 border-b border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Record Data Fields</h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">All fields from portfolio ingestion</p>
            </div>

            <div className="divide-y divide-[var(--border-light)]">
              {/* Core fields */}
              {[
                { key: 'userId', label: 'User ID', value: record.userId },
                { key: 'mobile', label: 'Mobile', value: record.mobile },
                { key: 'name', label: 'Name', value: record.name },
                { key: 'product', label: 'Product', value: record.product },
                { key: 'outstanding', label: 'Outstanding', value: `₹${Number(record.outstanding || 0).toLocaleString()}` },
                { key: 'overdue', label: 'Overdue', value: `₹${Number(record.overdue || 0).toLocaleString()}` },
                { key: 'currentDpd', label: 'Current DPD', value: `${record.currentDpd || 0} days` },
                { key: 'dpdBucket', label: 'DPD Bucket', value: record.dpdBucket },
                { key: 'employerId', label: 'Employer ID', value: record.employerId },
              ].filter(f => f.value).map((field) => (
                <div key={field.key} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-[var(--text-secondary)]">{field.label}</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{field.value}</span>
                </div>
              ))}

              {/* Dynamic fields */}
              {Object.entries(dynamicFields).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-[var(--text-secondary)]">{key}</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{String(value)}</span>
                </div>
              ))}
            </div>

            {Object.keys(dynamicFields).length === 0 && (
              <div className="px-5 py-3 text-sm text-[var(--text-tertiary)] italic">No additional dynamic fields</div>
            )}
          </div>

          {/* Metadata */}
          <div className="card mt-4 p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Metadata</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[var(--text-tertiary)]">Record ID</span>
                <p className="font-mono text-xs text-[var(--text-primary)] mt-0.5">{record.id}</p>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)]">Portfolio ID</span>
                <p className="font-mono text-xs text-[var(--text-primary)] mt-0.5">{record.portfolioId}</p>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)]">Created</span>
                <p className="text-[var(--text-primary)] mt-0.5">{new Date(record.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-[var(--text-tertiary)]">Last Synced</span>
                <p className="text-[var(--text-primary)] mt-0.5">{record.lastSyncedAt ? new Date(record.lastSyncedAt).toLocaleString() : 'Never'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

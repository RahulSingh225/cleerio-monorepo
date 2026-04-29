'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { StatusBadge, DpdBadge } from '@/components/ui/status-badge';
import { StorySummaryBar } from './components/StorySummaryBar';
import { ChannelHeatmap } from './components/ChannelHeatmap';
import { EnrichedTimeline } from './components/EnrichedTimeline';
import { CrossRecordPanel } from './components/CrossRecordPanel';
import {
  ArrowLeft, Edit3, Plus, Phone, Calendar, MessageSquare, PhoneCall,
  MapPin, Mail, User, Loader2, Activity, AlertCircle, Clock,
  Send, Globe, IndianRupee, Ban,
} from 'lucide-react';

export default function CaseDetailsPage() {
  const params = useParams();
  const recordId = params.id as string;
  const [record, setRecord] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [storySummary, setStorySummary] = useState<any>(null);
  const [crossRecords, setCrossRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (recordId) loadAll(); }, [recordId]);

  const loadAll = async () => {
    try {
      const res = await api.get(`/portfolio-records/${recordId}`);
      const rec = res.data.data;
      setRecord(rec);

      // Load timeline, story summary, and cross-records in parallel
      const [tlRes, ssRes, crRes] = await Promise.allSettled([
        api.get(`/portfolio-records/${recordId}/timeline`),
        api.get(`/portfolio-records/${recordId}/story-summary`),
        rec?.mobile ? api.get(`/portfolio-records/by-mobile/${rec.mobile}`, { params: { excludeId: recordId } }) : Promise.resolve({ data: { data: [] } }),
      ]);
      if (tlRes.status === 'fulfilled') setTimeline(tlRes.value.data.data || []);
      if (ssRes.status === 'fulfilled') setStorySummary(ssRes.value.data.data);
      if (crRes.status === 'fulfilled') setCrossRecords(crRes.value.data.data || []);
    } catch (err) { console.error('Failed to load record', err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-[var(--text-tertiary)]" /></div>;
  if (!record) return (
    <div className="flex flex-col items-center justify-center py-24 space-y-3">
      <p className="text-[var(--text-secondary)]">Record not found</p>
      <Link href="/cases" className="text-sm text-[var(--primary)] hover:underline">← Back to Cases</Link>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/cases" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors flex items-center gap-1"><ArrowLeft className="w-4 h-4" />Cases</Link>
        <span className="text-[var(--text-tertiary)]">›</span>
        <span className="text-[var(--text-primary)] font-medium">{record.name || record.userId}</span>
      </div>

      {/* Header */}
      <div className="card p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[var(--text-primary)]">{record.name || 'Borrower'}</h1>
              <DpdBadge days={record.currentDpd || 0} />
              {record.riskBucket && <StatusBadge label={record.riskBucket} variant="warning" />}
              {crossRecords.length > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{crossRecords.length + 1} accounts</span>}
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              User ID: <span className="font-medium">{record.userId}</span> · Mobile: {record.mobile}
              {record.loanNumber && <> · Loan: <span className="font-medium">{record.loanNumber}</span></>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"><Edit3 className="w-4 h-4" />Edit</button>
            <button className="flex items-center gap-2 px-3 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"><Plus className="w-4 h-4" />New Action</button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border)]">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors"><Phone className="w-3 h-3" /> Trigger AI Call</button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors"><Calendar className="w-3 h-3" /> Schedule</button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors"><MessageSquare className="w-3 h-3" /> Send SMS</button>
        </div>
      </div>

      {/* Story Summary Bar */}
      {storySummary && <StorySummaryBar summary={storySummary} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile + Stats */}
        <div className="space-y-4">
          {/* Financial Summary */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Financial Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-[var(--text-secondary)]">Outstanding</span><span className="text-lg font-bold text-[var(--text-primary)]">₹{Number(record.outstanding || 0).toLocaleString()}</span></div>
              {record.emiAmount && <div className="flex justify-between"><span className="text-sm text-[var(--text-secondary)]">EMI</span><span className="text-sm font-semibold">₹{Number(record.emiAmount).toLocaleString()}</span></div>}
              {record.loanAmount && <div className="flex justify-between"><span className="text-sm text-[var(--text-secondary)]">Loan Amount</span><span className="text-sm font-medium">₹{Number(record.loanAmount).toLocaleString()}</span></div>}
              <div className="flex justify-between"><span className="text-sm text-[var(--text-secondary)]">DPD</span><span className="text-sm font-semibold">{record.currentDpd || 0} days</span></div>
              {record.dueDate && <div className="flex justify-between"><span className="text-sm text-[var(--text-secondary)]">Due Date</span><span className="text-sm font-medium">{new Date(record.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>}
              <div className="flex justify-between"><span className="text-sm text-[var(--text-secondary)]">Product</span><span className="text-sm font-medium">{record.product || '-'}</span></div>
            </div>
          </div>

          {/* Repayment Summary */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2"><IndianRupee className="w-4 h-4 text-emerald-600" />Repayment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-[var(--text-secondary)]">Total Repaid</span><span className="text-lg font-bold text-emerald-600">₹{Number(record.totalRepaid || 0).toLocaleString()}</span></div>
              {record.loanAmount && Number(record.loanAmount) > 0 && (
                <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-[var(--text-secondary)]">Recovery Progress</span><span className="font-bold">{Math.min(100, Math.round((Number(record.totalRepaid || 0) / Number(record.loanAmount)) * 100))}%</span></div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.min(100, (Number(record.totalRepaid || 0) / Number(record.loanAmount)) * 100)}%` }} /></div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-[var(--text-tertiary)]" /><span>{record.mobile}</span></div>
              {record.email && <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-[var(--text-tertiary)]" /><span>{record.email}</span></div>}
              {record.employerName && <div className="flex items-center gap-3"><User className="w-4 h-4 text-[var(--text-tertiary)]" /><span>Employer: {record.employerName}</span></div>}
              {(record.state || record.city) && <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-[var(--text-tertiary)]" /><span>{[record.city, record.state].filter(Boolean).join(', ')}</span></div>}
              {record.language && <div className="flex items-center gap-3"><Globe className="w-4 h-4 text-[var(--text-tertiary)]" /><span>Language: {record.language}</span></div>}
            </div>
            {record.alternateNumbers && Array.isArray(record.alternateNumbers) && record.alternateNumbers.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[var(--border)]">
                <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Alternate Numbers</p>
                <div className="space-y-1.5">
                  {record.alternateNumbers.map((num: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-sm"><Phone className="w-3 h-3 text-[var(--text-tertiary)]" /><span>{num}</span></div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Communication Stats */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2"><Send className="w-4 h-4 text-[var(--primary)]" />Communication Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-sm text-[var(--text-secondary)]">DNC</span><StatusBadge label={record.isOptedOut ? 'Yes' : 'No'} variant={record.isOptedOut ? 'critical' : 'success'} /></div>
              {record.lastDeliveryStatus && <div className="flex items-center justify-between"><span className="text-sm text-[var(--text-secondary)]">Last Delivery</span><StatusBadge label={record.lastDeliveryStatus} variant={record.lastDeliveryStatus === 'delivered' ? 'success' : record.lastDeliveryStatus === 'failed' ? 'critical' : 'info'} /></div>}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[var(--border)]">
                {[{ v: record.totalCommAttempts || 0, l: 'Sent', c: '' }, { v: record.totalCommDelivered || 0, l: 'Delivered', c: 'text-emerald-600' }, { v: record.totalCommRead || 0, l: 'Read', c: 'text-blue-600' }, { v: record.totalCommReplied || 0, l: 'Replied', c: 'text-violet-600' }].map(s => (
                  <div key={s.l} className="text-center"><p className={`text-lg font-bold ${s.c || 'text-[var(--text-primary)]'}`}>{s.v}</p><p className="text-[9px] text-[var(--text-tertiary)] uppercase">{s.l}</p></div>
                ))}
              </div>
            </div>
          </div>

          {/* PTP */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-500" />Promise to Pay</h3>
            {record.ptpDate ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-800 uppercase">Active PTP</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${record.ptpStatus === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : record.ptpStatus === 'broken' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{record.ptpStatus?.replace('_', ' ') || 'Unknown'}</span>
                </div>
                <p className="text-sm text-amber-900 font-medium">₹{Number(record.ptpAmount || 0).toLocaleString()} by {new Date(record.ptpDate).toLocaleDateString()}</p>
              </div>
            ) : <p className="text-sm text-[var(--text-tertiary)] border border-dashed border-[var(--border)] rounded-lg p-3 text-center">No active PTP</p>}
          </div>

          {/* Cross-record panel */}
          <CrossRecordPanel records={[record, ...crossRecords]} currentId={recordId} />
        </div>

        {/* Right: Channel Heatmap + Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {storySummary?.channelBreakdown && <ChannelHeatmap channelBreakdown={storySummary.channelBreakdown} bestChannel={storySummary.bestChannel || 'sms'} />}
          <EnrichedTimeline timeline={timeline} />
        </div>
      </div>
    </div>
  );
}

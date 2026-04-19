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
  Activity,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle2,
  Send,
  Globe,
} from 'lucide-react';

export default function CaseDetailsPage() {
  const params = useParams();
  const recordId = params.id as string;
  const [record, setRecord] = useState<any>(null);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (recordId) loadRecord();
  }, [recordId]);

  const loadRecord = async () => {
    try {
      const res = await api.get(`/portfolio-records/${recordId}`);
      setRecord(res.data.data);

      try {
        const eventsRes = await api.get(`/interactions/record/${recordId}`);
        setInteractions(eventsRes.data.data || []);
      } catch (e) {
        console.warn('Could not load interactions', e);
      }
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
              {record.emiAmount && (
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">EMI Amount</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">₹{Number(record.emiAmount).toLocaleString()}</span>
                </div>
              )}
              {record.loanAmount && (
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Loan Amount</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">₹{Number(record.loanAmount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Current DPD</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{record.currentDpd || 0} days</span>
              </div>
              {record.dueDate && (
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Due Date</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">{new Date(record.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              )}
              {record.loanNumber && (
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Loan Number</span>
                  <span className="text-sm font-mono text-[var(--text-primary)]">{record.loanNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Product</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{record.product || '-'}</span>
              </div>
              {record.enachEnabled != null && (
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">E-NACH</span>
                  <StatusBadge label={record.enachEnabled ? 'Active' : 'Inactive'} variant={record.enachEnabled ? 'success' : 'warning'} />
                </div>
              )}
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
              {record.employerName && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <span className="text-[var(--text-primary)]">Employer: {record.employerName}</span>
                </div>
              )}
              {record.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <span className="text-[var(--text-primary)]">{record.email}</span>
                </div>
              )}
              {(record.state || record.city) && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <span className="text-[var(--text-primary)]">{[record.city, record.state].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {record.language && (
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <span className="text-[var(--text-primary)]">Language: {record.language}</span>
                </div>
              )}
            </div>

            {/* Alternate Numbers (skip tracing) */}
            {record.alternateNumbers && Array.isArray(record.alternateNumbers) && record.alternateNumbers.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[var(--border)]">
                <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Alternate / Reference Numbers</p>
                <div className="space-y-1.5">
                  {record.alternateNumbers.map((num: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Phone className="w-3 h-3 text-[var(--text-tertiary)]" />
                      <span className="text-[var(--text-primary)]">{num}</span>
                      <span className="text-[10px] text-[var(--text-tertiary)] uppercase">{idx < 2 ? 'Alt' : 'Ref'} {(idx % 2) + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--surface-hover)]">
                <PhoneCall className="w-4 h-4" /> Call
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] hover:bg-[var(--surface-hover)]">
                <MessageSquare className="w-4 h-4" /> SMS
              </button>
            </div>
          </div>

          {/* Communication Stats */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <Send className="w-4 h-4 text-[var(--primary)]" />
              Communication Stats
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Opted Out (DNC)</span>
                <StatusBadge label={record.isOptedOut ? 'Yes' : 'No'} variant={record.isOptedOut ? 'critical' : 'success'} />
              </div>
              {record.lastDeliveryStatus && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Last Delivery</span>
                  <StatusBadge
                    label={record.lastDeliveryStatus}
                    variant={record.lastDeliveryStatus === 'delivered' ? 'success' : record.lastDeliveryStatus === 'failed' ? 'critical' : 'info'}
                  />
                </div>
              )}
              {record.lastContactedChannel && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Last Channel</span>
                  <span className="text-sm font-medium text-[var(--text-primary)] capitalize">{record.lastContactedChannel}</span>
                </div>
              )}
              {record.lastContactedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Last Contacted</span>
                  <span className="text-xs text-[var(--text-secondary)]">{new Date(record.lastContactedAt).toLocaleString()}</span>
                </div>
              )}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[var(--border)]">
                <div className="text-center">
                  <p className="text-lg font-bold text-[var(--text-primary)]">{record.totalCommAttempts || 0}</p>
                  <p className="text-[9px] text-[var(--text-tertiary)] uppercase">Sent</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-emerald-600">{record.totalCommDelivered || 0}</p>
                  <p className="text-[9px] text-[var(--text-tertiary)] uppercase">Delivered</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-600">{record.totalCommRead || 0}</p>
                  <p className="text-[9px] text-[var(--text-tertiary)] uppercase">Read</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-violet-600">{record.totalCommReplied || 0}</p>
                  <p className="text-[9px] text-[var(--text-tertiary)] uppercase">Replied</p>
                </div>
              </div>
            </div>
          </div>

          {/* Insights / Engagement */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--primary)]" />
              Engagement Insights
            </h3>
            
            <div className="space-y-5">
              {/* Score Gauge */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--text-secondary)]">Contactability Score</span>
                  <span className="font-bold text-[var(--text-primary)]">{record.contactabilityScore || 0}/100</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${record.contactabilityScore || 0}%`,
                      backgroundColor: (record.contactabilityScore || 0) > 60 ? '#10B981' : (record.contactabilityScore || 0) > 30 ? '#F59E0B' : '#EF4444'
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[var(--text-tertiary)] mt-1">
                  <span>Based on {record.totalCommAttempts || 0} attempts</span>
                  {record.preferredChannel && <span className="capitalize">Prefers {record.preferredChannel}</span>}
                </div>
              </div>

              {/* PTP Section */}
              {record.ptpDate ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Promise to Pay
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      record.ptpStatus === 'pending_review' ? 'bg-amber-100 text-amber-700' :
                      record.ptpStatus === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                      record.ptpStatus === 'broken' ? 'bg-red-100 text-red-700' :
                      record.ptpStatus === 'honored' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {record.ptpStatus ? record.ptpStatus.replace('_', ' ') : 'Unknown'}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p className="text-amber-900 font-medium">₹{Number(record.ptpAmount || 0).toLocaleString()} <span className="text-amber-700 font-normal">by</span> {new Date(record.ptpDate).toLocaleDateString()}</p>
                  </div>
                  {record.ptpStatus === 'pending_review' && (
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 transition">Confirm</button>
                      <button className="flex-1 py-1.5 bg-white text-red-600 border border-red-200 text-xs font-medium rounded-md hover:bg-red-50 transition">Reject</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-[var(--text-tertiary)] border border-dashed border-[var(--border)] rounded-lg p-3 text-center">
                  No active Promise to Pay
                </div>
              )}
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
                { key: 'loanNumber', label: 'Loan Number', value: record.loanNumber },
                { key: 'mobile', label: 'Mobile', value: record.mobile },
                { key: 'email', label: 'Email', value: record.email },
                { key: 'name', label: 'Name', value: record.name },
                { key: 'product', label: 'Product', value: record.product },
                { key: 'outstanding', label: 'Outstanding', value: record.outstanding ? `₹${Number(record.outstanding).toLocaleString()}` : null },
                { key: 'emiAmount', label: 'EMI Amount', value: record.emiAmount ? `₹${Number(record.emiAmount).toLocaleString()}` : null },
                { key: 'loanAmount', label: 'Loan Amount', value: record.loanAmount ? `₹${Number(record.loanAmount).toLocaleString()}` : null },
                { key: 'dueDate', label: 'Due Date', value: record.dueDate },
                { key: 'currentDpd', label: 'Current DPD', value: `${record.currentDpd || 0} days` },
                { key: 'dpdBucket', label: 'DPD Bucket', value: record.dpdBucket },
                { key: 'cibilScore', label: 'CIBIL Score', value: record.cibilScore },
                { key: 'language', label: 'Language', value: record.language },
                { key: 'state', label: 'State', value: record.state },
                { key: 'city', label: 'City', value: record.city },
                { key: 'salaryDate', label: 'Salary Date', value: record.salaryDate ? `Day ${record.salaryDate}` : null },
                { key: 'enachEnabled', label: 'E-NACH Enabled', value: record.enachEnabled != null ? (record.enachEnabled ? 'Yes' : 'No') : null },
                { key: 'employerName', label: 'Employer', value: record.employerName },
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

          {/* Communication Timeline */}
          <div className="card mt-4 p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--primary)]" />
              Interaction Timeline
            </h3>
            
            {interactions.length > 0 ? (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                {interactions.map((interaction, ix) => (
                  <div key={interaction.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Icon indicator */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      {interaction.type === 'ptp' ? <ThumbsUp className="w-4 h-4 text-emerald-500" /> : 
                       interaction.type === 'reply' ? <MessageSquare className="w-4 h-4 text-blue-500" /> :
                       interaction.type === 'delivery_status' ? <CheckCircle2 className="w-4 h-4 text-gray-400" /> :
                       interaction.type === 'invalid_contact' ? <ThumbsDown className="w-4 h-4 text-red-500" /> :
                       <Activity className="w-4 h-4 text-indigo-500" />}
                    </div>
                    {/* Event Content */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] card p-4 hover:shadow-md transition">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">{interaction.type.replace('_', ' ')}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-lg uppercase">{interaction.channel}</span>
                        </div>
                        <time className="text-[10px] text-[var(--text-tertiary)]">{new Date(interaction.createdAt).toLocaleString()}</time>
                      </div>
                      
                      {interaction.details?.deliveryStatus && (
                        <p className="text-sm text-[var(--text-primary)] mt-1">
                          Status: <span className="font-semibold">{interaction.details.deliveryStatus}</span>
                        </p>
                      )}
                      
                      {interaction.details?.failureReason && (
                        <p className="text-xs text-red-600 bg-red-50 p-2 rounded mt-2">
                          {interaction.details.failureReason}
                        </p>
                      )}
                      
                      {interaction.details?.replyContent && (
                        <div className="text-sm text-[var(--text-secondary)] bg-gray-50 p-2.5 rounded-lg mt-2 border border-[var(--border)] relative">
                          "{interaction.details.replyContent}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">No interaction events tracked yet.</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Wait for Webhook deliveries to populate timeline.</p>
              </div>
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

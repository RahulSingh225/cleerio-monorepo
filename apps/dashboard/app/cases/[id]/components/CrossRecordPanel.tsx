'use client';
import React from 'react';
import Link from 'next/link';
import { DpdBadge } from '@/components/ui/status-badge';
import { ArrowRight, IndianRupee, Briefcase } from 'lucide-react';

interface CrossRecordPanelProps { records: any[]; currentId: string; }

export function CrossRecordPanel({ records, currentId }: CrossRecordPanelProps) {
  const others = records.filter(r => r.id !== currentId);
  if (others.length === 0) return null;

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-amber-500" />
        Other Loan Accounts
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{others.length}</span>
      </h3>
      <div className="space-y-2">
        {others.map(r => (
          <Link key={r.id} href={`/cases/${r.id}`}
            className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-light)] hover:border-[var(--primary)] hover:shadow-sm transition-all group">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--text-primary)] truncate">{r.product || 'Unknown Product'}</span>
                <DpdBadge days={r.currentDpd || 0} />
              </div>
              <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                {r.loanNumber ? `Loan: ${r.loanNumber}` : `ID: ${r.userId}`}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-sm font-bold text-[var(--text-primary)]">₹{Number(r.outstanding || 0).toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">Outstanding</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[var(--primary)] transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

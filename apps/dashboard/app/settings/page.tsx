'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { Layers, MessageSquare, FileText, Database, ShieldOff, ChevronRight, Users } from 'lucide-react';

const settingsItems = [
  {
    title: 'Field Registry',
    description: 'Map CSV column headers to stable field keys for data ingestion and template rendering.',
    href: '/settings/field-registry',
    icon: Database,
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    title: 'DPD Bucket Configuration',
    description: 'Define risk tiers based on days past due for segmentation criteria.',
    href: '/settings/buckets',
    icon: Layers,
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'Channel Configuration',
    description: 'Manage SMS, WhatsApp, IVR, and voice bot channels with provider API keys.',
    href: '/settings/channels',
    icon: MessageSquare,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Communication Templates',
    description: 'Create and manage message templates for automated journey steps.',
    href: '/settings/templates',
    icon: FileText,
    color: 'bg-violet-50 text-violet-600',
  },
  {
    title: 'Opt-Out / DNC List',
    description: 'Manage Do Not Contact list for regulatory compliance.',
    href: '/settings/opt-out',
    icon: ShieldOff,
    color: 'bg-red-50 text-red-600',
  },
  {
    title: 'Tenant Users',
    description: 'Manage team members, invite users, and assign roles.',
    href: '/settings/users',
    icon: Users,
    color: 'bg-amber-50 text-amber-600',
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Settings"
        subtitle="Configure your tenant's collection infrastructure."
      />

      <div className="space-y-3">
        {settingsItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="card p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</h3>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{item.description}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--primary)] transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

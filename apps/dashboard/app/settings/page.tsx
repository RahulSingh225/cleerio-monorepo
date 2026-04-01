'use client';

import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { Layers, MessageSquare, FileText, ChevronRight } from 'lucide-react';

const settingsItems = [
  {
    title: 'DPD Bucket Configuration',
    description: 'Define risk tiers based on days past due for targeted collection strategies.',
    href: '/settings/buckets',
    icon: Layers,
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'Channel Configuration',
    description: 'Manage SMS, WhatsApp, IVR, and voice bot channels for outreach.',
    href: '/settings/channels',
    icon: MessageSquare,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Communication Templates',
    description: 'Create and manage message templates for automated collection workflows.',
    href: '/settings/templates',
    icon: FileText,
    color: 'bg-violet-50 text-violet-600',
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

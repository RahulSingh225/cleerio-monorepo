'use client';

import React from 'react';

interface TimelineEvent {
  id: string;
  icon: React.ReactNode;
  iconColor?: string;
  iconBg?: string;
  title: string;
  description?: string;
  timestamp: string;
  details?: React.ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[18px] top-2 bottom-2 w-px bg-[var(--border)]" />

      <div className="space-y-4">
        {events.map((event, i) => (
          <div key={event.id} className="relative flex gap-4 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            {/* Icon dot */}
            <div
              className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${event.iconBg || 'bg-[var(--primary-light)]'}`}
            >
              <div className={event.iconColor || 'text-[var(--primary)]'}>{event.icon}</div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-4">
              <div className="flex items-baseline justify-between gap-3">
                <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">{event.title}</h4>
                <time className="text-[10px] text-[var(--text-tertiary)] whitespace-nowrap font-medium">
                  {event.timestamp}
                </time>
              </div>
              {event.description && (
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">{event.description}</p>
              )}
              {event.details && <div className="mt-2">{event.details}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

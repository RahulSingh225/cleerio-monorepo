'use client';

import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Sparkles, Brain, TrendingUp, Target, Route, Lightbulb } from 'lucide-react';

const insightCards = [
  {
    title: 'Segment Optimization',
    description: 'AI will analyze segment performance and suggest criteria adjustments to improve success rates.',
    icon: Target,
    gradient: 'from-blue-500 to-indigo-500',
    status: 'Coming Soon',
  },
  {
    title: 'Journey Recommendations',
    description: 'Automated suggestions for new journey steps based on borrower response patterns.',
    icon: Route,
    gradient: 'from-purple-500 to-pink-500',
    status: 'Coming Soon',
  },
  {
    title: 'Predictive Analytics',
    description: 'ML-powered predictions for repayment likelihood based on communication history and DPD trends.',
    icon: TrendingUp,
    gradient: 'from-emerald-500 to-teal-500',
    status: 'Coming Soon',
  },
  {
    title: 'Template Optimization',
    description: 'A/B testing insights and AI-generated message variations for higher engagement rates.',
    icon: Lightbulb,
    gradient: 'from-amber-500 to-orange-500',
    status: 'Coming Soon',
  },
];

export default function AIInsightsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="AI Insights"
        subtitle="Intelligent recommendations powered by machine learning."
      />

      {/* Hero card */}
      <div className="card p-8 bg-gradient-to-br from-[var(--primary)] to-indigo-600 text-white border-0">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI-Powered Collection Intelligence</h2>
            <p className="text-blue-100 mt-2 leading-relaxed max-w-2xl">
              Our AI engine analyzes segment performance, borrower feedback patterns, and repayment trends
              to generate actionable recommendations. Once activated, AI agents will propose new segment criteria
              and journey optimizations — pending your approval.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                Phase 6 — 4-6 weeks after MVP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-2 gap-4">
        {insightCards.map((card, i) => (
          <div
            key={card.title}
            className="card p-5 group hover:shadow-md transition-all animate-fade-in opacity-80 hover:opacity-100"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">{card.title}</h3>
                  <span className="text-[9px] px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full font-bold uppercase">
                    {card.status}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder insights area */}
      <div className="card p-8 text-center">
        <Sparkles className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-4" />
        <h3 className="text-base font-semibold text-[var(--text-primary)]">Insights Will Appear Here</h3>
        <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
          Once the AI engine is activated, real-time recommendations from segment analysis,
          journey performance, and borrower behavior will be displayed here.
        </p>
      </div>
    </div>
  );
}

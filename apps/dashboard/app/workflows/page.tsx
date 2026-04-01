'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Panel,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save, Database, Shuffle, Sparkles, Mail, MessageSquare, Phone, Loader2, Search, Plus, CheckCircle2, Zap } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { StatusBadge } from '@/components/ui/status-badge';

// State & Logic
import { useWorkflowStore } from '@/store/use-workflow-store';
import { WorkflowParser } from '@/lib/workflow-parser';

// Custom Node Components
import { SourceNode } from '@/components/builder/nodes/SourceNode';
import { MapperNode } from '@/components/builder/nodes/MapperNode';
import { ActionNode } from '@/components/builder/nodes/ActionNode';
import { AgentNode } from '@/components/builder/nodes/AgentNode';

const activeStrategies = [
  { name: 'Early Payment Reminder', status: 'RUNNING', variant: 'success' as const },
  { name: 'High Risk Escalation v3', status: 'TESTING', variant: 'warning' as const },
  { name: 'Legal Notice Flow', status: 'PAUSED', variant: 'neutral' as const },
];

export default function WorkflowBuilder() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useWorkflowStore();
  const [isDeploying, setIsDeploying] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');

  const nodeTypes = useMemo(() => ({
    source: SourceNode,
    mapper: MapperNode,
    action: ActionNode,
    agent: AgentNode,
  }), []);

  const handleDeploy = async () => {
    setIsDeploying(true);
    const parser = new WorkflowParser();
    try {
      await parser.deploy(nodes, edges);
      alert('Strategy successfully deployed! 🚀');
    } catch (err) {
      alert('Deployment failed. Verify your node connections.');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleAddNode = (type: string, label: string) => {
    const id = `${Date.now()}`;
    const newNode = {
      id,
      type,
      position: { x: 400 + Math.random() * 100, y: 150 + Math.random() * 100 },
      data: { label, mappings: [], templateId: 'TPL_DEFAULT' },
    };
    useWorkflowStore.getState().addNode(newNode as any);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] -m-6">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-white border-b border-[var(--border)]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Strategy Orchestration</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Design and deploy multi-channel AI collection workflows.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors">
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors shadow-sm disabled:opacity-50"
            >
              {isDeploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Deploy Strategy
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-4">
          {[
            { id: 'strategies', label: 'Active Strategies' },
            { id: 'builder', label: 'Flow Builder' },
            { id: 'channels', label: 'Channel Config' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[var(--primary)] text-[var(--primary)] bg-blue-50'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 relative">
          {activeTab === 'builder' && (
            <>
              {/* Flow Label */}
              <div className="absolute top-4 left-4 z-10 card px-4 py-2 flex items-center gap-3">
                <Search className="w-4 h-4 text-[var(--text-tertiary)]" />
                <span className="text-sm font-medium text-[var(--text-primary)]">Flow: Late Payment Retrieval v2.4</span>
              </div>

              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                defaultEdgeOptions={{
                  animated: true,
                  style: { strokeWidth: 2, stroke: '#2D5BFF' }
                }}
              >
                <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#E5E7EB" />
                <Controls className="!bg-white !border-[var(--border)] !shadow-md !rounded-lg overflow-hidden [&_button]:!border-[var(--border)] [&_button]:!bg-white [&_button]:!text-gray-600" position="bottom-left" />
              </ReactFlow>

              {/* Bottom node palette */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                <div className="card px-6 py-3 flex items-center gap-6 shadow-lg">
                  {[
                    { icon: Database, label: 'Source', type: 'source', color: 'text-emerald-600 bg-emerald-50' },
                    { icon: Shuffle, label: 'Mapper', type: 'mapper', color: 'text-violet-600 bg-violet-50' },
                    { icon: Sparkles, label: 'Agent', type: 'agent', color: 'text-indigo-600 bg-indigo-50' },
                    { icon: Mail, label: 'Channel', type: 'action', color: 'text-blue-600 bg-blue-50' },
                  ].map((item) => (
                    <button
                      key={item.type}
                      onClick={() => handleAddNode(item.type, item.label)}
                      className="flex flex-col items-center gap-1.5 group cursor-pointer"
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 ${item.color}`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-medium text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'strategies' && (
            <div className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Active Collection Strategies</h3>
              {activeStrategies.map((s, i) => (
                <div key={i} className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <Workflow className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{s.name}</span>
                  </div>
                  <StatusBadge label={s.status} variant={s.variant} />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'channels' && (
            <div className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Multi-Channel Config</h3>
              {[
                { name: 'Email (SendGrid)', desc: 'Active • 98% Delivery', icon: Mail, enabled: true },
                { name: 'SMS (Twilio)', desc: 'Active • Tier 1 Cost', icon: MessageSquare, enabled: true },
                { name: 'Voice (AI Voice)', desc: 'Disabled • Requires API', icon: Phone, enabled: false },
              ].map((ch, i) => (
                <div key={i} className="card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ch.enabled ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                      <ch.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{ch.name}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{ch.desc}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={ch.enabled} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                  </label>
                </div>
              ))}
              <button className="w-full card p-3 text-sm font-medium text-[var(--primary)] text-center hover:bg-blue-50 transition-colors">
                + Add Channel
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-72 border-l border-[var(--border)] bg-white overflow-y-auto p-5 space-y-5">
          {/* Strategy Insights */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Strategy Insights</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--text-secondary)]">Estimated Recovery</span>
                  <span className="font-semibold text-emerald-600">$12,450.00</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '72%' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="text-center p-3 bg-[var(--surface-secondary)] rounded-lg">
                  <p className="text-lg font-bold text-[var(--text-primary)]">14.2%</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Conversion</p>
                </div>
                <div className="text-center p-3 bg-[var(--surface-secondary)] rounded-lg">
                  <p className="text-lg font-bold text-[var(--text-primary)]">1.2d</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Avg. Response</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-700 mb-1">AI Recommendation</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Add an SMS follow-up 24h after email for +5% response rate.
            </p>
          </div>

          {/* Usage Meter */}
          <div className="pt-3 border-t border-[var(--border)]">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-[var(--text-tertiary)]" />
              <span className="text-sm font-medium text-[var(--text-primary)]">Usage Meter</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
              <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: '72%' }} />
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">7,240 / 10,000 AI credits used</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Workflow({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>
    </svg>
  );
}

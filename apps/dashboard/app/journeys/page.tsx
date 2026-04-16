'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { SegmentTriggerNode } from '@/components/builder/nodes/SegmentTriggerNode';
import { WaitDelayNode } from '@/components/builder/nodes/WaitDelayNode';
import { SendMessageNode } from '@/components/builder/nodes/SendMessageNode';
import { ConditionCheckNode } from '@/components/builder/nodes/ConditionCheckNode';
import { EndSuccessNode, EndFailureNode, ManualReviewNode } from '@/components/builder/nodes/EndNode';
import Link from 'next/link';
import {
  Plus, Route, Loader2, Target, Timer, Send, GitBranch,
  CheckCircle, XCircle, UserCheck, Save, Rocket, RotateCcw, ArrowLeft,
} from 'lucide-react';

const nodeTypes = {
  segmentTrigger: SegmentTriggerNode,
  waitDelay: WaitDelayNode,
  sendMessage: SendMessageNode,
  conditionCheck: ConditionCheckNode,
  endSuccess: EndSuccessNode,
  endFailure: EndFailureNode,
  manualReview: ManualReviewNode,
};

const palette = [
  { type: 'segmentTrigger', label: 'Segment Trigger', icon: Target, gradient: 'from-emerald-500 to-emerald-400' },
  { type: 'waitDelay', label: 'Wait / Delay', icon: Timer, gradient: 'from-amber-500 to-amber-400' },
  { type: 'sendMessage', label: 'Send Message', icon: Send, gradient: 'from-blue-500 to-blue-400' },
  { type: 'conditionCheck', label: 'Condition', icon: GitBranch, gradient: 'from-purple-500 to-purple-400' },
  { type: 'manualReview', label: 'Manual Review', icon: UserCheck, gradient: 'from-orange-500 to-orange-400' },
  { type: 'endSuccess', label: 'Success End', icon: CheckCircle, gradient: 'from-green-500 to-emerald-400' },
  { type: 'endFailure', label: 'Escalate End', icon: XCircle, gradient: 'from-red-500 to-rose-400' },
];

export default function JourneyBuilderPage() {
  const [journeys, setJourneys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [buildMode, setBuildMode] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const [journeyName, setJourneyName] = useState('New Journey');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchJourneys(); }, []);

  const fetchJourneys = async () => {
    try {
      const res = await api.get('/journeys');
      setJourneys(res.data.data || []);
    } catch (err) { console.error('Failed to load journeys'); }
    finally { setIsLoading(false); }
  };

  const editJourney = async (j: any) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/journeys/${j.id}`);
      const journey = res.data.data;
      setJourneyName(journey.name);

      const loadedNodes: Node[] = [];
      const loadedEdges: Edge[] = [];
      let currentY = 80;

      // Seed start node
      loadedNodes.push({
        id: 'start',
        type: 'segmentTrigger',
        position: { x: 250, y: currentY },
        data: { segmentId: journey.segmentId },
      });
      currentY += 160;

      // Map steps if available
      if (journey.steps && journey.steps.length > 0) {
        journey.steps.sort((a: any, b: any) => a.stepOrder - b.stepOrder).forEach((step: any, index: number) => {
          const nodeId = `step_${step.id}`;
          
          let nodeType = 'sendMessage';
          if (step.actionType === 'wait') nodeType = 'waitDelay';
          else if (step.actionType === 'condition_check') nodeType = 'conditionCheck';
          else if (step.actionType === 'manual_review') nodeType = 'manualReview';

          loadedNodes.push({
            id: nodeId,
            type: nodeType,
            position: { x: 250, y: currentY },
            data: step,
          });

          const prevId = index === 0 ? 'start' : `step_${journey.steps[index-1].id}`;
          loadedEdges.push({
            id: `edge_${prevId}_${nodeId}`,
            source: prevId,
            target: nodeId,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#2D5BFF' },
            style: { stroke: '#2D5BFF', strokeWidth: 2 }
          });

          currentY += 160;
        });

        // Add success end node automatically
        const lastId = `step_${journey.steps[journey.steps.length-1].id}`;
        loadedNodes.push({
          id: 'end_success',
          type: 'endSuccess',
          position: { x: 250, y: currentY },
          data: {},
        });
        loadedEdges.push({
          id: `edge_${lastId}_end`,
          source: lastId,
          target: 'end_success',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#2D5BFF' },
          style: { stroke: '#2D5BFF', strokeWidth: 2 }
        });
      }

      setNodes(loadedNodes);
      setEdges(loadedEdges);
      setBuildMode(true);
    } catch (err) {
      console.error('Failed to load journey details', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds: Edge[]) =>
      addEdge({
        ...connection,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#2D5BFF' },
        style: { stroke: '#2D5BFF', strokeWidth: 2 },
        label: connection.sourceHandle === 'yes' ? '✓ Yes' : connection.sourceHandle === 'no' ? '✗ No' : undefined,
      }, eds) as Edge[]
    );
  }, [setEdges]);

  const addNode = (type: string) => {
    const id = `${type}_${Date.now()}`;
    const existingOfType = nodes.filter(n => n.type === type).length;
    setNodes((nds) => [
      ...nds,
      {
        id,
        type,
        position: { x: 250, y: 80 + (nds.length * 160) },
        data: {},
      },
    ]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  // Journey list view
  if (!buildMode) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Journeys"
          subtitle="Visual journey builder for automated multi-step collection strategies."
          actions={
            <button
              onClick={() => setBuildMode(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> New Journey
            </button>
          }
        />

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4">
            <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Total Journeys</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{journeys.length}</p>
          </div>
          <div className="card p-4">
            <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Active</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{journeys.filter(j => j.isActive).length}</p>
          </div>
          <div className="card p-4">
            <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Total Steps</p>
            <p className="text-2xl font-bold text-[var(--primary)] mt-1">
              {journeys.reduce((sum: number, j: any) => sum + (j.stepCount || 0), 0)}
            </p>
          </div>
        </div>

        {journeys.length === 0 ? (
          <EmptyState
            icon={<Route className="w-7 h-7" />}
            title="No Journeys Created"
            description="Create your first journey to automate multi-step collection outreach."
            action={
              <button
                onClick={() => setBuildMode(true)}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
              >
                Build First Journey
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {journeys.map((j: any, i: number) => (
              <div
                key={j.id}
                onClick={() => editJourney(j)}
                className="card p-5 hover:shadow-md transition-all cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                        {j.name}
                      </h3>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        j.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {j.isActive ? 'Active' : 'Draft'}
                      </span>
                    </div>
                    {j.description && (
                      <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{j.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      {j.segment && (
                        <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                          <Target className="w-3 h-3" /> {j.segment.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[10px] font-medium text-[var(--text-tertiary)]">
                        <Route className="w-3 h-3" /> {j.stepCount || 0} steps
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Builder canvas view
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setBuildMode(false)} className="p-2 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <input
              value={journeyName}
              onChange={(e) => setJourneyName(e.target.value)}
              className="text-xl font-bold text-[var(--text-primary)] bg-transparent border-none outline-none focus:ring-0 p-0"
            />
            <p className="text-sm text-[var(--text-tertiary)]">Design your journey flow from top to bottom.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setNodes([]); setEdges([]); }} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-sm disabled:opacity-50" disabled={nodes.length === 0}>
            <Rocket className="w-4 h-4" /> Deploy
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 card overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode={['Delete', 'Backspace']}
          className="bg-[#FAFBFC]"
        >
          <Background color="#E5E7EB" gap={20} size={1} />
          <Controls className="!bg-white !border !border-[var(--border)] !rounded-lg !shadow-md" />
          <MiniMap
            nodeColor={(node) => {
              const colors: Record<string, string> = {
                segmentTrigger: '#10B981',
                waitDelay: '#F59E0B',
                sendMessage: '#3B82F6',
                conditionCheck: '#8B5CF6',
                manualReview: '#F97316',
                endSuccess: '#22C55E',
                endFailure: '#EF4444',
              };
              return colors[node.type || ''] || '#9CA3AF';
            }}
            className="!bg-white !border !border-[var(--border)] !rounded-lg !shadow-md"
            maskColor="rgba(0,0,0,0.05)"
          />

          {/* Draggable Palette */}
          <Panel position="top-left" className="!m-3">
            <div className="bg-white border border-[var(--border)] rounded-xl shadow-lg p-3 space-y-1.5 w-[180px]">
              <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-1 pb-1">Add Nodes</p>
              {palette.map(p => (
                <button
                  key={p.type}
                  onClick={() => addNode(p.type)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:shadow-sm hover:scale-[1.02] active:scale-95 bg-white border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text-primary)]"
                >
                  <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${p.gradient} flex items-center justify-center`}>
                    <p.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  {p.label}
                </button>
              ))}
            </div>
          </Panel>

          {/* Empty state */}
          {nodes.length === 0 && (
            <Panel position="top-center" className="!mt-24">
              <div className="bg-white border border-[var(--border)] rounded-xl shadow-lg p-8 text-center max-w-md">
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-[var(--primary)] to-indigo-500 flex items-center justify-center mb-4">
                  <Route className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Build Your Journey</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                  Add nodes from the palette, then connect them top-to-bottom:<br/>
                  <strong>Trigger</strong> → <strong>Wait</strong> → <strong>Send</strong> → <strong>Condition</strong> → <strong>End</strong>
                </p>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>
    </div>
  );
}

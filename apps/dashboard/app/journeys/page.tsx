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
import { ReassignSegmentNode } from '@/components/builder/nodes/ReassignSegmentNode';
import Link from 'next/link';
import {
  Plus, Route, Loader2, Target, Timer, Send, GitBranch,
  CheckCircle, XCircle, UserCheck, Save, Rocket, RotateCcw, ArrowLeft,
  MessageSquare, MessageCircle, ArrowRightLeft
} from 'lucide-react';

const nodeTypes = {
  segmentTrigger: SegmentTriggerNode,
  waitDelay: WaitDelayNode,
  sendMessage: SendMessageNode,
  conditionCheck: ConditionCheckNode,
  endSuccess: EndSuccessNode,
  endFailure: EndFailureNode,
  manualReview: ManualReviewNode,
  reassignSegment: ReassignSegmentNode,
};

const palette = [
  { type: 'segmentTrigger', label: 'Segment Trigger', icon: Target, gradient: 'from-emerald-500 to-emerald-400' },
  { type: 'waitDelay', label: 'Wait / Delay', icon: Timer, gradient: 'from-amber-500 to-amber-400' },
  { type: 'waitDelay', data: { delayHours: 0, label: 'Wait for Feedback' }, label: 'Wait for Feedback', icon: Timer, gradient: 'from-amber-400 to-yellow-400' },
  { type: 'reassignSegment', label: 'Reassign Segment', icon: ArrowRightLeft, gradient: 'from-indigo-500 to-indigo-400' },
  { type: 'sendMessage', data: { channel: 'sms' }, label: 'Send SMS', icon: MessageSquare, gradient: 'from-blue-500 to-blue-400' },
  { type: 'sendMessage', data: { channel: 'whatsapp' }, label: 'Send WhatsApp', icon: MessageCircle, gradient: 'from-green-500 to-green-400' },
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
  const [currentJourneyId, setCurrentJourneyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deploying, setDeploying] = useState(false);

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
      setCurrentJourneyId(journey.id);

      const loadedNodes: Node[] = [];
      const loadedEdges: Edge[] = [];

      // Seed start node
      loadedNodes.push({
        id: 'start',
        type: 'segmentTrigger',
        position: { x: 250, y: 80 },
        data: { 
          segmentId: journey.segmentId,
          segmentName: journey.segment?.name,
          recordCount: journey.segment?.recordCount
        },
      });

      // Map steps 
      const stepMap = new Map<string, string>(); // Original Step ID -> Node ID
      
      if (journey.steps && journey.steps.length > 0) {
        journey.steps.forEach((step: any) => {
          const nodeId = `step_${step.id}`;
          stepMap.set(step.id, nodeId);
          
          let nodeType = 'sendMessage';
          if (step.actionType === 'wait' || step.actionType === 'wait_delay') nodeType = 'waitDelay';
          else if (step.actionType === 'condition_check') nodeType = 'conditionCheck';
          else if (step.actionType === 'manual_review') nodeType = 'manualReview';
          else if (step.actionType === 'reassign_segment') nodeType = 'reassignSegment';

          // Use saved position if available
          const savedPos = (step.conditionsJsonb as any)?.position;
          const position = savedPos ? { x: savedPos.x, y: savedPos.y } : { x: 250, y: 80 + (step.stepOrder * 160) };

          loadedNodes.push({
            id: nodeId,
            type: nodeType,
            position,
            data: { 
              ...step,
              // Hydrate rules and operator for Condition nodes
              ...(step.actionType === 'condition_check' ? { 
                rules: step.conditionsJsonb?.rules || [],
                operator: step.conditionsJsonb?.operator || 'AND'
              } : {}),
              // Hydrate target segment for Reassign nodes
              ...(step.actionType === 'reassign_segment' ? {
                targetSegmentId: step.conditionsJsonb?.targetSegmentId
              } : {})
            },
          });
        });

        // Add edges based on stepOrder or nextStepId pointers
        journey.steps.forEach((step: any, index: number) => {
          const nodeId = `step_${step.id}`;
          
          // If first step, connect from start
          if (step.stepOrder === 1) {
            loadedEdges.push({
              id: `edge_start_${nodeId}`,
              source: 'start',
              target: nodeId,
              animated: true,
              markerEnd: { type: MarkerType.ArrowClosed, color: '#2D5BFF' },
              style: { stroke: '#2D5BFF', strokeWidth: 2 }
            });
          }

          // Check branches
          const { nextStepIdYes, nextStepIdNo, nextStepId } = step.conditionsJsonb || {};
          
          if (nextStepIdYes && stepMap.has(nextStepIdYes)) {
            loadedEdges.push({
              id: `edge_${nodeId}_${stepMap.get(nextStepIdYes)}_yes`,
              source: nodeId,
              sourceHandle: 'yes',
              target: stepMap.get(nextStepIdYes)!,
              label: '✓ Yes',
              animated: true,
              markerEnd: { type: MarkerType.ArrowClosed, color: '#2D5BFF' },
              style: { stroke: '#2D5BFF', strokeWidth: 2 }
            });
          }
          if (nextStepIdNo && stepMap.has(nextStepIdNo)) {
            loadedEdges.push({
              id: `edge_${nodeId}_${stepMap.get(nextStepIdNo)}_no`,
              source: nodeId,
              sourceHandle: 'no',
              target: stepMap.get(nextStepIdNo)!,
              label: '✗ No',
              animated: true,
              markerEnd: { type: MarkerType.ArrowClosed, color: '#2D5BFF' },
              style: { stroke: '#2D5BFF', strokeWidth: 2 }
            });
          }
          if (nextStepId && stepMap.has(nextStepId)) {
            loadedEdges.push({
              id: `edge_${nodeId}_${stepMap.get(nextStepId)}`,
              source: nodeId,
              target: stepMap.get(nextStepId)!,
              animated: true,
              markerEnd: { type: MarkerType.ArrowClosed, color: '#2D5BFF' },
              style: { stroke: '#2D5BFF', strokeWidth: 2 }
            });
          }

          // Fallback to sequential if no branching pointers and it's not the last step
          if (!nextStepIdYes && !nextStepIdNo && !nextStepId && index < journey.steps.length - 1) {
            const nextNodeId = `step_${journey.steps[index+1].id}`;
            loadedEdges.push({
              id: `edge_${nodeId}_${nextNodeId}`,
              source: nodeId,
              target: nextNodeId,
              animated: true,
              markerEnd: { type: MarkerType.ArrowClosed, color: '#2D5BFF' },
              style: { stroke: '#2D5BFF', strokeWidth: 2 }
            });
          }
        });
      }

      setNodes(loadedNodes);
      setEdges(loadedEdges);
      setBuildMode(true);
    } catch (err) {
      alert('Failed to load journey details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveJourney = async (silent = false) => {
    if (!silent) setSaving(true);
    try {
      const startNode = nodes.find(n => n.type === 'segmentTrigger');
      if (!startNode || !startNode.data.segmentId) {
        throw new Error('Journey must start with a Segment Trigger and have a selected segment.');
      }

      const journeyData = {
        name: journeyName,
        segmentId: startNode.data.segmentId,
        isActive: false, // Default to draft when saving
      };

      let journeyId = currentJourneyId;
      if (journeyId) {
        await api.put(`/journeys/${journeyId}`, journeyData);
      } else {
        const res = await api.post('/journeys', journeyData);
        journeyId = res.data.data.id;
        setCurrentJourneyId(journeyId);
      }

      // Step sync logic:
      // 1. Get all step nodes
      const stepNodes = nodes.filter(n => !['segmentTrigger', 'endSuccess', 'endFailure'].includes(n.type!));
      
      // 2. Identify all current steps in DB for this journey (to clear them)
      const currentJourney = await api.get(`/journeys/${journeyId}`);
      if (currentJourney.data.data.steps) {
        for (const step of currentJourney.data.data.steps) {
          await api.delete(`/journeys/${journeyId}/steps/${step.id}`);
        }
      }

      // 3. Create new steps (Pass 1: Create without branch pointers)
      const nodeToStepId = new Map<string, string>();
      for (let i = 0; i < stepNodes.length; i++) {
        const node = stepNodes[i];
        
        // Build base conditions/metadata
        const conditionsJsonb: any = {
          position: { x: Math.round(node.position.x), y: Math.round(node.position.y) },
        };

        if (node.data.rules) {
          conditionsJsonb.rules = node.data.rules;
          conditionsJsonb.operator = node.data.operator || 'AND';
        }

        if (node.type === 'reassignSegment' && node.data.targetSegmentId) {
          conditionsJsonb.targetSegmentId = node.data.targetSegmentId;
        }

        const stepPayload = {
          stepOrder: i + 1,
          actionType: node.type === 'waitDelay' ? 'wait' : node.type === 'conditionCheck' ? 'condition_check' : node.type === 'manualReview' ? 'manual_review' : node.type === 'reassignSegment' ? 'reassign_segment' : 'send_message',
          channel: node.data.channel || null,
          templateId: node.data.templateId || null,
          delayHours: node.data.delayHours || 0,
          conditionsJsonb,
        };
        const res = await api.post(`/journeys/${journeyId}/steps`, stepPayload);
        nodeToStepId.set(node.id, res.data.data.id);
      }

      // 4. Update branch pointers (Pass 2)
      for (const node of stepNodes) {
        const stepId = nodeToStepId.get(node.id);
        const nodeEdges = edges.filter(e => e.source === node.id);
        
        const branchData: any = {};
        nodeEdges.forEach(edge => {
          const targetStepId = nodeToStepId.get(edge.target);
          if (targetStepId) {
            if (edge.sourceHandle === 'yes') branchData.nextStepIdYes = targetStepId;
            else if (edge.sourceHandle === 'no') branchData.nextStepIdNo = targetStepId;
            else branchData.nextStepId = targetStepId;
          }
        });

        if (Object.keys(branchData).length > 0) {
          // Fetch existing to merge
          const nodeToSave = stepNodes.find(sn => sn.id === node.id);
          const currentConditions = {
            position: { x: Math.round(node.position.x), y: Math.round(node.position.y) },
            ...(nodeToSave?.data.rules ? { rules: nodeToSave.data.rules, operator: nodeToSave.data.operator || 'AND' } : {}),
            ...(nodeToSave?.type === 'reassignSegment' ? { targetSegmentId: nodeToSave.data.targetSegmentId } : {})
          };
          
          await api.put(`/journeys/${journeyId}/steps/${stepId}`, {
            conditionsJsonb: { ...currentConditions, ...branchData }
          });
        }
      }

      if (!silent) alert('Journey saved successfully!');
      return journeyId;
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to save journey');
      return null;
    } finally {
      if (!silent) setSaving(false);
    }
  };

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      const journeyId = await handleSaveJourney(true);
      if (!journeyId) return;

      await api.post(`/journeys/${journeyId}/deploy`);
      alert('Journey deployed and activated!');
      setBuildMode(false);
      fetchJourneys();
    } catch (err) {
      alert('Deployment failed');
    } finally {
      setDeploying(false);
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

  const addNode = (type: string, initialData: any = {}) => {
    const id = `${type}_${Date.now()}`;
    setNodes((nds) => [
      ...nds,
      {
        id,
        type,
        position: { x: 250, y: 80 + (nds.length * 160) },
        data: initialData,
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
              onClick={() => { setBuildMode(true); setCurrentJourneyId(null); setJourneyName('New Journey'); setNodes([]); setEdges([]); }}
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
                onClick={() => { setBuildMode(true); setCurrentJourneyId(null); setJourneyName('New Journey'); setNodes([]); setEdges([]); }}
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
          <button 
            onClick={() => handleSaveJourney()}
            disabled={saving || deploying || nodes.length < 2}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Draft
          </button>
          <button 
            onClick={handleDeploy}
            disabled={saving || deploying || nodes.length < 2}
            className="flex items-center gap-2 px-5 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-sm disabled:opacity-50"
          >
            {deploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />} Deploy
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
                  key={p.label}
                  onClick={() => addNode(p.type, p.data)}
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

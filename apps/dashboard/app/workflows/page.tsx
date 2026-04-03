'use client';

import React, { useState, useCallback, useMemo } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { api } from '@/lib/api';
import { BucketNode } from '@/components/builder/nodes/BucketNode';
import { TemplateNode } from '@/components/builder/nodes/TemplateNode';
import { ChannelNode } from '@/components/builder/nodes/ChannelNode';
import { DelayNode } from '@/components/builder/nodes/DelayNode';
import { Layers, FileText, Radio, Clock, Save, Loader2, Plus, Trash2, RotateCcw, Rocket } from 'lucide-react';

const nodeTypes = {
  bucket: BucketNode,
  template: TemplateNode,
  channel: ChannelNode,
  delay: DelayNode,
};

const nodeTemplates = [
  { type: 'bucket', label: 'DPD Bucket', icon: Layers, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { type: 'template', label: 'Template', icon: FileText, color: 'bg-violet-50 text-violet-600 border-violet-200' },
  { type: 'channel', label: 'Channel', icon: Radio, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { type: 'delay', label: 'Timing', icon: Clock, color: 'bg-amber-50 text-amber-600 border-amber-200' },
];

export default function StrategyBuilderPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<string | null>(null);

  // Handler to update node data from inside custom nodes
  const handleNodeDataChange = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n))
    );
  }, [setNodes]);

  // Inject the onChange callback into all nodes
  const nodesWithCallbacks = useMemo(() =>
    nodes.map(n => ({ ...n, data: { ...n.data, onChange: handleNodeDataChange } })),
    [nodes, handleNodeDataChange]
  );

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) =>
      addEdge({ ...connection, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#2D5BFF' }, style: { stroke: '#2D5BFF', strokeWidth: 2 } }, eds)
    );
  }, [setEdges]);

  const addNode = (type: string) => {
    const id = `${type}_${Date.now()}`;
    const yOffset = nodes.filter(n => n.type === type).length * 30;
    const positions: Record<string, { x: number; y: number }> = {
      bucket: { x: 50, y: 100 + yOffset },
      template: { x: 350, y: 100 + yOffset },
      channel: { x: 650, y: 100 + yOffset },
      delay: { x: 350, y: 350 + yOffset },
    };

    setNodes((nds) => [
      ...nds,
      {
        id,
        type,
        position: positions[type] || { x: 200, y: 200 },
        data: {},
      },
    ]);
  };

  const clearCanvas = () => {
    if (confirm('Clear all nodes and connections?')) {
      setNodes([]);
      setEdges([]);
      setDeployStatus(null);
    }
  };

  const deployStrategy = async () => {
    setIsDeploying(true);
    setDeployStatus(null);

    try {
      // Traverse edges to build workflow rules from the graph
      // Each path: Bucket → Template → Channel (optionally through Delay)
      const rules: any[] = [];

      // Find all bucket nodes as entry points
      const bucketNodes = nodes.filter(n => n.type === 'bucket');

      for (const bucketNode of bucketNodes) {
        // Walk forward through edges
        const visited = new Set<string>();
        const queue = [bucketNode.id];
        let templateId: string | undefined;
        let channel: string | undefined;
        let delayDays = 0;
        let repeatInterval = 0;
        let priority = 1;

        while (queue.length > 0) {
          const currentId = queue.shift()!;
          if (visited.has(currentId)) continue;
          visited.add(currentId);

          const current = nodes.find(n => n.id === currentId);
          if (!current) continue;

          // Collect data from node
          if (current.type === 'template') templateId = current.data.templateId;
          if (current.type === 'channel') channel = current.data.channel;
          if (current.type === 'delay') {
            delayDays = current.data.delayDays || 0;
            repeatInterval = current.data.repeatInterval || 0;
            priority = current.data.priority || 1;
          }

          // Follow outgoing edges
          const outgoing = edges.filter(e => e.source === currentId);
          for (const edge of outgoing) {
            queue.push(edge.target);
          }
        }

        if (bucketNode.data.bucketId && templateId) {
          rules.push({
            name: `Rule_${bucketNode.data.bucketName || 'Bucket'}_${channel || 'sms'}`,
            bucketId: bucketNode.data.bucketId,
            templateId,
            channel: channel || 'sms',
            delayDays,
            repeatIntervalDays: repeatInterval,
            priority,
            isActive: true,
          });
        }
      }

      if (rules.length === 0) {
        setDeployStatus('error: No complete paths found. Connect Bucket → Template → Channel.');
        return;
      }

      // Deploy each rule
      let created = 0;
      for (const rule of rules) {
        await api.post('/workflow-rules', rule);
        created++;
      }

      setDeployStatus(`success: ${created} workflow rule${created !== 1 ? 's' : ''} deployed!`);
    } catch (err: any) {
      setDeployStatus(`error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Strategy Builder</h1>
          <p className="text-sm text-[var(--text-tertiary)]">Design collection automation workflows visually.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearCanvas} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>
          <button onClick={deployStrategy} disabled={isDeploying || nodes.length === 0} className="flex items-center gap-2 px-5 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-sm disabled:opacity-50">
            {isDeploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            {isDeploying ? 'Deploying...' : 'Deploy Strategy'}
          </button>
        </div>
      </div>

      {/* Deploy status */}
      {deployStatus && (
        <div className={`mb-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
          deployStatus.startsWith('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {deployStatus.replace('success: ', '').replace('error: ', '')}
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 card overflow-hidden">
        <ReactFlow
          nodes={nodesWithCallbacks}
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
              if (node.type === 'bucket') return '#10B981';
              if (node.type === 'template') return '#8B5CF6';
              if (node.type === 'channel') return '#3B82F6';
              if (node.type === 'delay') return '#F59E0B';
              return '#9CA3AF';
            }}
            className="!bg-white !border !border-[var(--border)] !rounded-lg !shadow-md"
            maskColor="rgba(0,0,0,0.05)"
          />

          {/* Node Palette */}
          <Panel position="top-left" className="!m-3">
            <div className="bg-white border border-[var(--border)] rounded-xl shadow-lg p-3 space-y-2">
              <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-1">Add Nodes</p>
              {nodeTemplates.map(nt => (
                <button
                  key={nt.type}
                  onClick={() => addNode(nt.type)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all hover:shadow-sm hover:scale-[1.02] active:scale-95 ${nt.color}`}
                >
                  <nt.icon className="w-4 h-4" />
                  {nt.label}
                </button>
              ))}
            </div>
          </Panel>

          {/* Instructions */}
          {nodes.length === 0 && (
            <Panel position="top-center" className="!mt-24">
              <div className="bg-white border border-[var(--border)] rounded-xl shadow-lg p-8 text-center max-w-md">
                <div className="w-12 h-12 mx-auto rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center mb-4">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Build Your Strategy</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                  Add nodes from the palette, then connect them: <br/>
                  <strong>Bucket</strong> → <strong>Timing</strong> → <strong>Template</strong> → <strong>Channel</strong>
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-3">Each complete path creates a workflow rule.</p>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>
    </div>
  );
}

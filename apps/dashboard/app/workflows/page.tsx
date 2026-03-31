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
import { Play, Save, Plus, Database, Shuffle, Filter, Mail, Activity, Sparkles, Zap, Loader2 } from 'lucide-react';

// State & Logic
import { useWorkflowStore } from '@/store/use-workflow-store';
import { WorkflowParser } from '@/lib/workflow-parser';

// Custom Node Components
import { SourceNode } from '@/components/builder/nodes/SourceNode';
import { MapperNode } from '@/components/builder/nodes/MapperNode';
import { ActionNode } from '@/components/builder/nodes/ActionNode';
import { AgentNode } from '@/components/builder/nodes/AgentNode';

export default function WorkflowBuilder() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useWorkflowStore();
  const [isDeploying, setIsDeploying] = useState(false);

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
      alert('Strategy successfully deployed to production! 🚀');
    } catch (err) {
      alert('Deployment failed. Verify your node connections.');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB]">
      {/* Figma Refined Toolbar */}
      <div className="h-16 border-b border-[#E4E4E7] bg-white flex items-center justify-between px-8 z-10 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-blue-600/5 text-blue-600 border border-blue-600/10">
                <Activity className="h-5 w-5" />
             </div>
             <div className="flex flex-col">
                <h1 className="text-[15px] font-bold tracking-tight text-[#111827]">Strategy Orchestration</h1>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                   <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Draft: NBFC_APR_V2</span>
                </div>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleDeploy}
            disabled={isDeploying}
            className="flex items-center gap-2.5 px-5 py-2 text-[12px] font-black bg-[#111827] text-white rounded-xl hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-950/10 active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeploying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 fill-emerald-400 text-emerald-400 group-hover:scale-125 transition-transform" />
            )}
            Deploy Transfer
          </button>
        </div>
      </div>

      {/* Strategy Canvas */}
      <div className="flex-1 relative overflow-hidden bg-white">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          colorMode="light"
          defaultEdgeOptions={{ 
            animated: true,
            style: { strokeWidth: 2, stroke: '#3B82F6' }
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="#E5E7EB" />
          <Controls className="!bg-white !border-[#E4E4E7] !shadow-xl !rounded-xl overflow-hidden" shadow={false} />
          
          <Panel position="bottom-center" className="mb-12">
             <div className="bg-white/95 border border-[#E4E4E7] px-8 py-4 rounded-[24px] flex items-center gap-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-xl ring-1 ring-black/5 ring-inset">
                {[
                  { icon: Database, label: 'Source', type: 'source' },
                  { icon: Shuffle, label: 'Mapper', type: 'mapper' },
                  { icon: Sparkles, label: 'AI Agent', type: 'agent' },
                  { icon: Mail, label: 'Channel', type: 'action' },
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex flex-col items-center gap-2 group cursor-pointer transition-all hover:-translate-y-2"
                    onClick={() => {
                       const newNode = {
                          id: `${Date.now()}`,
                          type: item.type,
                          position: { x: Math.random() * 400, y: Math.random() * 400 },
                          data: { label: item.label, mappings: [], templateId: 'TPL_DEFAULT' }
                       };
                       useWorkflowStore.getState().addNode(newNode as any);
                    }}
                  >
                    <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all bg-zinc-50 border-zinc-200 text-zinc-600 group-hover:border-blue-600 group-hover:text-blue-600`}>
                       <item.icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-400 group-hover:text-zinc-600 transition-colors">
                      {item.label}
                    </span>
                  </div>
                ))}
             </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

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
      alert('Strategy successfully deployed back to infrastructure! 🚀');
    } catch (err) {
      alert('Deployment failed. Verify your node connections.');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#09090B] font-sans selection:bg-blue-500/30">
      {/* Premium Dark Toolbar */}
      <div className="h-20 border-b border-white/5 bg-[#0D0D10]/80 backdrop-blur-2xl flex items-center justify-between px-10 z-20 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="p-2.5 rounded-2xl bg-blue-600/10 text-blue-500 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                <Activity className="h-5 w-5" />
             </div>
             <div className="flex flex-col">
                <h1 className="text-[16px] font-black tracking-tight text-white uppercase italic">Strategy Orchestration</h1>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                   <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] leading-none">Draft: NBFC_APR_OPS_V4</span>
                </div>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0D0D10] bg-zinc-800" />)}
             </div>
             <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">4 Online</span>
          </div>
          <button 
            onClick={handleDeploy}
            disabled={isDeploying}
            className="flex items-center gap-3 px-7 py-3.5 text-[11px] font-black bg-white text-black rounded-2xl hover:bg-zinc-200 transition-all shadow-[0_15px_40px_-5px_rgba(255,255,255,0.15)] active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden relative"
          >
            <span className="relative z-10 flex items-center gap-3">
                {isDeploying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                <Zap className="h-4 w-4 fill-blue-600 text-blue-600 group-hover:scale-125 transition-transform" />
                )}
                Finalize Strategy
            </span>
          </button>
        </div>
      </div>

      {/* Strategy Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          colorMode="dark"
          defaultEdgeOptions={{ 
            animated: true,
            style: { strokeWidth: 3, stroke: '#3B82F6' }
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={32} size={1} color="#27272A" />
          <Controls className="!bg-[#18181B] !border-white/10 !shadow-2xl !rounded-2xl overflow-hidden [&_button]:!border-white/5 [&_button]:!bg-transparent [&_button]:!text-zinc-500 hover:[&_button]:!bg-white/5" position="bottom-left" />
          
          <Panel position="bottom-center" className="mb-12">
             <div className="bg-[#18181B]/80 border border-white/10 px-10 py-5 rounded-[40px] flex items-center gap-12 shadow-[0_40px_100px_rgba(0,0,0,1)] backdrop-blur-[40px] ring-1 ring-white/5 ring-inset">
                {[
                  { icon: Database, label: 'Source', type: 'source', color: 'emerald' },
                  { icon: Shuffle, label: 'Mapper', type: 'mapper', color: 'violet' },
                  { icon: Sparkles, label: 'Agent', type: 'agent', color: 'indigo' },
                  { icon: Smartphone, label: 'Channel', type: 'action', color: 'blue' },
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex flex-col items-center gap-3 group cursor-pointer transition-all hover:-translate-y-2"
                    onClick={() => {
                        const id = `${Date.now()}`;
                        const newNode = {
                          id,
                          type: item.type,
                          position: { x: 400 + Math.random() * 100, y: 150 + Math.random() * 100 },
                          data: { label: item.label, mappings: [], templateId: 'TPL_DEFAULT' },
                          className: 'animate-in zoom-in duration-300'
                       };
                       useWorkflowStore.getState().addNode(newNode as any);
                    }}
                  >
                    <div className={`w-16 h-16 rounded-[24px] border border-white/5 flex items-center justify-center transition-all bg-black shadow-xl group-hover:border-${item.color}-500/50 group-hover:shadow-${item.color}-500/20 group-hover:text-${item.color}-500 text-zinc-600`}>
                       <item.icon className="h-7 w-7" />
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.3em] font-black text-zinc-600 group-hover:text-zinc-300 transition-colors">
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

function Smartphone({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
      <path d="M12 18h.01"/>
    </svg>
  );
}

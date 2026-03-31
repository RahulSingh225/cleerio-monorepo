import { Node, Edge } from '@xyflow/react';
import axios from 'axios';

/**
 * The WorkflowParser is the "one-click deploy" engine.
 * It translates the visual React Flow graph into Cleerio's 
 * Drizzle-backed configuration APIs.
 */
export class WorkflowParser {
  private api = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  async deploy(nodes: Node[], edges: Edge[]) {
    console.log('Deploying strategy orchestration...');

    // 1. Identify and Sync Field Mappings (from Mapper Nodes)
    const mapperNodes = nodes.filter(n => n.type === 'mapper');
    for (const node of mapperNodes) {
      await this.syncFieldMapping(node.data);
    }

    // 2. Identify and Sync Workflow Rules (from Agent/Action Nodes)
    const actionNodes = nodes.filter(n => n.type === 'action' || n.type === 'agent');
    for (const node of actionNodes) {
      await this.syncWorkflowRule(node, nodes, edges);
    }

    return { success: true, timestamp: new Date().toISOString() };
  }

  private async syncFieldMapping(data: any) {
    if (!data.mappings) return;
    
    // API: POST /tenant-field-registry/mapping
    return this.api.post('/tenant-field-registry/mapping', {
      mappings: data.mappings,
    });
  }

  private async syncWorkflowRule(node: Node, allNodes: Node[], allEdges: Edge[]) {
    // Find pre-requisite bucket/filter from inbound edges
    const inboundEdge = allEdges.find(e => e.target === node.id);
    const sourceNode = allNodes.find(n => n.id === inboundEdge?.source);
    
    // API: POST /workflow-rules
    return this.api.post('/workflow-rules', {
      name: `Rule_${node.id}`,
      bucketId: sourceNode?.data?.bucketId || 'DEFAULT',
      templateId: node.data.templateId || 'TPL_001',
      delayDays: node.data.delayDays || 0,
      isActive: true,
    });
  }
}

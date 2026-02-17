import { type Node, type Edge } from '@xyflow/react';

export type GraphNodeType = 'input' | 'orchestrator' | 'agent' | 'checkpoint' | 'output';

export type NodeStatus = 'pending' | 'running' | 'completed' | 'failed' | 'awaiting_approval' | 'approved' | 'skipped';

export type EdgeStatus = 'pending' | 'active' | 'completed' | 'failed';

export interface GraphNodeData extends Record<string, unknown> {
  label: string;
  type: GraphNodeType;
  status: NodeStatus;
  agentId?: string;
  agentColor?: string;
  agentIcon?: string;
  result?: string;
  duration?: number;
  inputModality?: 'text' | 'voice' | 'image';
  timestamp?: string;
}

export interface GraphEdgeData extends Record<string, unknown> {
  status: EdgeStatus;
  dataPreview?: string;
}

export type FlowNode = Node<GraphNodeData>;
export type FlowEdge = Edge<GraphEdgeData>;

export interface ExecutionGraphState {
  taskId: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  currentNodeId?: string;
  status: 'planning' | 'awaiting_approval' | 'executing' | 'completed' | 'failed';
}

export type ExecutionSSEEvent =
  | { type: 'graph_init'; graph: ExecutionGraphState }
  | { type: 'node_status'; nodeId: string; status: NodeStatus; result?: string; duration?: number }
  | { type: 'edge_status'; edgeId: string; status: EdgeStatus; dataPreview?: string }
  | { type: 'checkpoint_reached'; nodeId: string; stepId: string }
  | { type: 'execution_complete'; graph: ExecutionGraphState; summary?: string }
  | { type: 'execution_failed'; nodeId: string; error: string };

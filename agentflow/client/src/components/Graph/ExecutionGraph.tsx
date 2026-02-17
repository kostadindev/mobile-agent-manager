import { useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Dagre from '@dagrejs/dagre';
import { Maximize2, Minimize2, GitBranch } from 'lucide-react';
import { useStore } from '../../state/store';
import InputNode from './InputNode';
import OrchestratorNode from './OrchestratorNode';
import AgentNode from './AgentNode';
import CheckpointNode from './CheckpointNode';
import OutputNode from './OutputNode';
import StatusEdge from './StatusEdge';
import GraphLegend from './GraphLegend';

const nodeTypes = {
  input: InputNode,
  orchestrator: OrchestratorNode,
  agent: AgentNode,
  checkpoint: CheckpointNode,
  output: OutputNode,
};

const edgeTypes = {
  status: StatusEdge,
};

function layoutGraph(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 24, ranksep: 40 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 160, height: 44 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  Dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const { x, y } = g.node(node.id);
    return { ...node, position: { x: x - 80, y: y - 22 } };
  });

  return { nodes: layoutedNodes, edges };
}

interface ExecutionGraphProps {
  compact?: boolean;
}

export default function ExecutionGraph({ compact = false }: ExecutionGraphProps) {
  const { graphState, expandedGraph, setExpandedGraph } = useStore();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    if (!graphState) return;

    const taggedEdges = graphState.edges.map((e) => ({
      ...e,
      type: 'status',
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = layoutGraph(
      graphState.nodes,
      taggedEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [graphState, setNodes, setEdges]);

  const toggleExpand = useCallback(() => {
    setExpandedGraph(!expandedGraph);
  }, [expandedGraph, setExpandedGraph]);

  const statusLabel = useMemo(() => {
    if (!graphState) return '';
    switch (graphState.status) {
      case 'planning': return 'Plan Ready';
      case 'executing': return 'Executing...';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return '';
    }
  }, [graphState]);

  const statusColor = useMemo(() => {
    if (!graphState) return 'text-slate-500';
    switch (graphState.status) {
      case 'executing': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      default: return 'text-slate-500';
    }
  }, [graphState]);

  const statusDot = useMemo(() => {
    if (!graphState) return 'bg-slate-500';
    switch (graphState.status) {
      case 'executing': return 'bg-blue-400';
      case 'completed': return 'bg-green-400';
      case 'failed': return 'bg-red-400';
      default: return 'bg-slate-500';
    }
  }, [graphState]);

  if (!graphState) return null;

  const header = (
    <div className="absolute top-0 left-0 right-0 z-10 bg-slate-800/95 backdrop-blur-xl border-b border-slate-700/30">
      <div className="flex items-center justify-between px-3 py-1.5">
        <div className="flex items-center gap-2">
          <GitBranch className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px] font-semibold text-slate-300">Execution Graph</span>
          <div className="flex items-center gap-1.5" aria-live="polite">
            <div className={`w-1.5 h-1.5 rounded-full ${statusDot} ${graphState.status === 'executing' ? 'animate-pulse' : ''}`} />
            <span className={`text-[10px] font-medium ${statusColor}`}>{statusLabel}</span>
          </div>
        </div>
        <button
          onClick={toggleExpand}
          aria-label={expandedGraph ? 'Collapse execution graph' : 'Expand execution graph'}
          className="p-1.5 rounded-lg hover:bg-slate-700/80 transition-colors active:scale-90"
        >
          {expandedGraph ? (
            <Minimize2 className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>
      </div>
      <div className="px-3 pb-1.5">
        <GraphLegend />
      </div>
    </div>
  );

  const flow = (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: 0.25 }}
      nodesDraggable={false}
      nodesConnectable={false}
      panOnDrag={true}
      zoomOnScroll={true}
      minZoom={0.3}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        color="#1e293b"
        gap={20}
        size={1}
      />
    </ReactFlow>
  );

  if (expandedGraph) {
    return (
      <>
        {/* Placeholder to keep layout stable */}
        <div className={`rounded-2xl border border-slate-700/40 bg-slate-800/60 overflow-hidden ${compact ? 'h-[220px]' : 'h-[320px]'}`} />
        {createPortal(
          <div className="fixed inset-0 z-50 flex flex-col">
            <div className="absolute inset-0 bg-black/60" onClick={toggleExpand} />
            <div className="relative flex-1 bg-slate-800 overflow-hidden">
              {header}
              {flow}
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  return (
    <div
      className={`relative rounded-2xl border border-slate-700/40 bg-slate-800/60 backdrop-blur-sm overflow-hidden shadow-xl shadow-black/10 ${
        compact ? 'h-[220px]' : 'h-[320px]'
      }`}
    >
      {header}
      {flow}
    </div>
  );
}

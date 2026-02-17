import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Workflow } from 'lucide-react';
import type { GraphNodeData } from '../../types/graph';

export default function OrchestratorNode({ data }: NodeProps) {
  const d = data as unknown as GraphNodeData;

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-500/10 border-2 border-indigo-500/70 rounded-xl min-w-[120px] max-w-[160px] shadow-xl shadow-indigo-500/10 backdrop-blur-sm">
        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md flex-shrink-0">
          <Workflow className="w-3 h-3 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-[8px] text-indigo-300/80 font-semibold uppercase tracking-widest">Orchestrator</div>
          <div className="text-[10px] text-white font-semibold truncate">{d.label}</div>
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="!bg-indigo-400 !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-400 !w-2 !h-2 !border-0" />
    </div>
  );
}

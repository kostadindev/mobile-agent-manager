import { Handle, Position, type NodeProps } from '@xyflow/react';
import { MessageSquare, Mic, Camera } from 'lucide-react';
import type { GraphNodeData } from '../../types/graph';

const modalityIcons = {
  text: MessageSquare,
  voice: Mic,
  image: Camera,
};

export default function InputNode({ data }: NodeProps) {
  const d = data as unknown as GraphNodeData;
  const Icon = modalityIcons[d.inputModality ?? 'text'];

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/90 border border-slate-600/60 rounded-xl min-w-[100px] max-w-[160px] shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-700/80 flex-shrink-0">
        <Icon className="w-3 h-3 text-slate-300" />
      </div>
      <span className="text-[10px] text-slate-200 font-medium truncate">
        {d.label}
      </span>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2 !border-0" />
    </div>
  );
}

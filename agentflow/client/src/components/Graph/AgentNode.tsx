import { Handle, Position, type NodeProps } from '@xyflow/react';
import { BookOpen, Lightbulb, Globe, Bot, Check, Loader2, X, type LucideIcon } from 'lucide-react';
import type { GraphNodeData } from '../../types/graph';

const iconMap: Record<string, LucideIcon> = {
  BookOpen, Lightbulb, Globe, Bot,
};

export default function AgentNode({ data }: NodeProps) {
  const d = data as unknown as GraphNodeData;
  const Icon = iconMap[d.agentIcon ?? 'Bot'] ?? Bot;
  const color = d.agentColor ?? '#6B7280';
  const isRunning = d.status === 'running';
  const isComplete = d.status === 'completed';
  const isFailed = d.status === 'failed';

  return (
    <div
      className={`relative flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/90 rounded-xl min-w-[120px] max-w-[160px] shadow-lg backdrop-blur-sm transition-all duration-300 ${
        isRunning ? 'node-running border-2' : 'border border-slate-700/40'
      }`}
      style={{
        borderColor: isRunning ? color : undefined,
      }}
    >
      {/* Color accent bar */}
      <div
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
        style={{ backgroundColor: color }}
      />

      <div
        className="flex items-center justify-center w-6 h-6 rounded-lg ml-1 flex-shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-3 h-3" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-white font-medium truncate">{d.label}</div>
      </div>

      {/* Status indicator */}
      {isRunning && <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" style={{ color }} />}
      {isComplete && (
        <div className="w-4 h-4 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
          <Check className="w-2.5 h-2.5 text-green-400" />
        </div>
      )}
      {isFailed && (
        <div className="w-4 h-4 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
          <X className="w-2.5 h-2.5 text-red-400" />
        </div>
      )}
      {!isRunning && !isComplete && !isFailed && (
        <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-600 flex-shrink-0" />
      )}

      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2 !border-0" />
    </div>
  );
}

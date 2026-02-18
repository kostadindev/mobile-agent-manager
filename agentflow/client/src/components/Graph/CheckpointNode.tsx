import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import type { GraphNodeData } from '../../types/graph';
import { useT } from '../../i18n';

export default function CheckpointNode({ data }: NodeProps) {
  const d = data as unknown as GraphNodeData;
  const t = useT();

  const isAwaiting = d.status === 'awaiting_approval';
  const isApproved = d.status === 'approved' || d.status === 'completed';
  const isFailed = d.status === 'failed';

  const Icon = isFailed ? ShieldX : isApproved ? ShieldCheck : ShieldAlert;

  const borderColor = isFailed
    ? 'border-red-500/70'
    : isApproved
    ? 'border-green-500/70'
    : isAwaiting
    ? 'border-amber-500/70'
    : 'border-slate-700/50';

  const bgColor = isFailed
    ? 'bg-red-500/8'
    : isApproved
    ? 'bg-green-500/8'
    : isAwaiting
    ? 'bg-amber-500/8'
    : 'bg-surface-1';

  const iconColor = isFailed
    ? 'text-red-400'
    : isApproved
    ? 'text-green-400'
    : isAwaiting
    ? 'text-amber-400'
    : 'text-slate-500';

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1.5 border-2 rounded-xl min-w-[100px] max-w-[160px] shadow-lg backdrop-blur-sm transition-all duration-300 ${borderColor} ${bgColor} ${
        isAwaiting ? 'checkpoint-awaiting' : ''
      }`}
    >
      <Icon className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="text-[8px] text-slate-500 uppercase tracking-widest font-semibold">{t('node.checkpoint')}</div>
        <div className="text-[10px] text-on-surface font-medium truncate">{d.label}</div>
      </div>
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2 !border-0" />
    </div>
  );
}

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { CheckCircle2, Circle } from 'lucide-react';
import type { GraphNodeData } from '../../types/graph';
import { useT } from '../../i18n';

export default function OutputNode({ data }: NodeProps) {
  const d = data as unknown as GraphNodeData;
  const t = useT();
  const isComplete = d.status === 'completed';

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1.5 border-2 rounded-xl min-w-[100px] max-w-[160px] shadow-lg backdrop-blur-sm transition-all duration-500 ${
        isComplete
          ? 'bg-green-500/8 border-green-500/70'
          : 'bg-surface-1 border-slate-700/50'
      }`}
    >
      {isComplete ? (
        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
      ) : (
        <Circle className="w-4 h-4 text-slate-600 flex-shrink-0" />
      )}
      <div>
        <div className="text-[8px] text-slate-500 uppercase tracking-widest font-semibold">{t('node.output')}</div>
        <div className="text-[10px] text-on-surface font-medium">
          {isComplete ? t('node.allComplete') : t('node.waiting')}
        </div>
      </div>
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2 !border-0" />
    </div>
  );
}

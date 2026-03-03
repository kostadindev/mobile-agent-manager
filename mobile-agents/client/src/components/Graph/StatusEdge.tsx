import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import type { GraphEdgeData } from '../../types/graph';

const edgeColors: Record<string, string> = {
  pending: '#475569',
  active: '#3B82F6',
  completed: '#22C55E',
  failed: '#EF4444',
};

export default function StatusEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition } = props;
  const data = (props.data ?? { status: 'pending' }) as GraphEdgeData;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16,
  });

  const color = edgeColors[data.status] ?? edgeColors.pending;
  const isActive = data.status === 'active';

  return (
    <g className={isActive ? 'edge-active' : ''}>
      <BaseEdge
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: isActive ? 2.5 : 2,
          transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
        }}
      />
    </g>
  );
}

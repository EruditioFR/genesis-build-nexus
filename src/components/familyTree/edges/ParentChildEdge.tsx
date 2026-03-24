import { memo } from 'react';
import { type EdgeProps, getBezierPath } from '@xyflow/react';

interface ParentChildEdgeData {
  relationshipType?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export const ParentChildEdge = memo(({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  data,
}: EdgeProps<ParentChildEdgeData>) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.3,
  });

  const isAdopted = data?.relationshipType === 'adopted';
  const isStep = data?.relationshipType === 'step';

  return (
    <g>
      <path
        d={edgePath}
        fill="none"
        stroke="hsl(var(--secondary))"
        strokeWidth={1.8}
        strokeOpacity={0.6}
        strokeDasharray={isAdopted ? '6 4' : isStep ? '3 3' : undefined}
        style={style}
        className="transition-all duration-200"
      />
      {/* Arrival dot */}
      <circle
        cx={targetX}
        cy={targetY}
        r={3}
        fill="hsl(var(--secondary))"
        fillOpacity={0.5}
        style={style}
      />
    </g>
  );
});

ParentChildEdge.displayName = 'ParentChildEdge';

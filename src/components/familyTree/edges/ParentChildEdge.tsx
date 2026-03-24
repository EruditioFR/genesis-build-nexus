import { memo, useState } from 'react';
import { type EdgeProps, getBezierPath, type Edge } from '@xyflow/react';

type ParentChildEdgeData = {
  relationshipType?: string;
  isActive?: boolean;
};

export type ParentChildEdgeType = Edge<ParentChildEdgeData, 'parentChild'>;

export const ParentChildEdge = memo(({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  data,
}: EdgeProps<ParentChildEdgeType>) => {
  const [hovered, setHovered] = useState(false);

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.35,
  });

  const isAdopted = data?.relationshipType === 'adopted';
  const isStep = data?.relationshipType === 'step';

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Invisible wider hit area */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
      />
      {/* Visible edge */}
      <path
        d={edgePath}
        fill="none"
        stroke="hsl(var(--tree-edge-parent))"
        strokeWidth={hovered ? 2.5 : 1.8}
        strokeOpacity={hovered ? 0.85 : 0.55}
        strokeDasharray={isAdopted ? '6 4' : isStep ? '3 3' : undefined}
        strokeLinecap="round"
        style={{
          ...style,
          transition: 'stroke-width 0.2s ease, stroke-opacity 0.2s ease',
        }}
      />
      {/* Target dot */}
      <circle
        cx={targetX}
        cy={targetY}
        r={hovered ? 4 : 3}
        fill="hsl(var(--tree-edge-parent))"
        fillOpacity={hovered ? 0.7 : 0.45}
        style={{ transition: 'r 0.2s ease, fill-opacity 0.2s ease' }}
      />
    </g>
  );
});

ParentChildEdge.displayName = 'ParentChildEdge';

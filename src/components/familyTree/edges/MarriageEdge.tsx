import { memo } from 'react';
import { type EdgeProps, getStraightPath, type Edge } from '@xyflow/react';

type MarriageEdgeData = {
  unionType?: string;
  isActive?: boolean;
};

export type MarriageEdgeType = Edge<MarriageEdgeData, 'marriage'>;

export const MarriageEdge = memo(({
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
}: EdgeProps<MarriageEdgeType>) => {
  const [, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const offset = 2;

  return (
    <g style={style}>
      <line
        x1={sourceX}
        y1={sourceY - offset}
        x2={targetX}
        y2={targetY - offset}
        stroke="hsl(var(--accent))"
        strokeWidth={1.5}
      />
      <line
        x1={sourceX}
        y1={sourceY + offset}
        x2={targetX}
        y2={targetY + offset}
        stroke="hsl(var(--accent))"
        strokeWidth={1.5}
      />
      <text
        x={labelX}
        y={labelY + 1}
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[10px]"
        fill="hsl(var(--accent))"
      >
        ♥
      </text>
    </g>
  );
});

MarriageEdge.displayName = 'MarriageEdge';

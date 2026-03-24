import { memo } from 'react';
import { type EdgeProps, getStraightPath } from '@xyflow/react';

interface MarriageEdgeData {
  unionType?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export const MarriageEdge = memo(({
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
}: EdgeProps<MarriageEdgeData>) => {
  const [, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const offset = 2;

  return (
    <g>
      {/* Double line for marriage */}
      <line
        x1={sourceX}
        y1={sourceY - offset}
        x2={targetX}
        y2={targetY - offset}
        stroke="hsl(var(--accent))"
        strokeWidth={1.5}
        style={style}
      />
      <line
        x1={sourceX}
        y1={sourceY + offset}
        x2={targetX}
        y2={targetY + offset}
        stroke="hsl(var(--accent))"
        strokeWidth={1.5}
        style={style}
      />
      {/* Heart symbol at center */}
      <text
        x={labelX}
        y={labelY + 1}
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[10px]"
        style={{ ...style, fill: 'hsl(var(--accent))' }}
      >
        ♥
      </text>
    </g>
  );
});

MarriageEdge.displayName = 'MarriageEdge';

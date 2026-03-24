import { memo, useState } from 'react';
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
  const [hovered, setHovered] = useState(false);
  const [, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const offset = 2.5;
  const strokeColor = 'hsl(var(--tree-edge-marriage))';

  return (
    <g
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hit area */}
      <line
        x1={sourceX}
        y1={sourceY}
        x2={targetX}
        y2={targetY}
        stroke="transparent"
        strokeWidth={14}
      />
      {/* Double line */}
      <line
        x1={sourceX}
        y1={sourceY - offset}
        x2={targetX}
        y2={targetY - offset}
        stroke={strokeColor}
        strokeWidth={hovered ? 2 : 1.5}
        strokeOpacity={hovered ? 0.85 : 0.6}
        strokeLinecap="round"
        style={{ transition: 'stroke-width 0.2s ease, stroke-opacity 0.2s ease' }}
      />
      <line
        x1={sourceX}
        y1={sourceY + offset}
        x2={targetX}
        y2={targetY + offset}
        stroke={strokeColor}
        strokeWidth={hovered ? 2 : 1.5}
        strokeOpacity={hovered ? 0.85 : 0.6}
        strokeLinecap="round"
        style={{ transition: 'stroke-width 0.2s ease, stroke-opacity 0.2s ease' }}
      />
      {/* Heart icon */}
      <circle
        cx={labelX}
        cy={labelY}
        r={hovered ? 9 : 7}
        fill="hsl(var(--tree-card-bg))"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeOpacity={0.5}
        style={{ transition: 'r 0.2s ease' }}
      />
      <text
        x={labelX}
        y={labelY + 1}
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[9px]"
        fill={strokeColor}
        style={{ pointerEvents: 'none' }}
      >
        ♥
      </text>
    </g>
  );
});

MarriageEdge.displayName = 'MarriageEdge';

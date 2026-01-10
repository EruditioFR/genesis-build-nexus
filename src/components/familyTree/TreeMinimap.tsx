import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { FamilyPerson, ParentChildRelationship, FamilyUnion } from '@/types/familyTree';

interface MinimapProps {
  persons: FamilyPerson[];
  relationships: ParentChildRelationship[];
  unions: FamilyUnion[];
  rootPersonId?: string;
  viewportRect: { x: number; y: number; width: number; height: number };
  contentBounds: { width: number; height: number };
  onViewportChange: (x: number, y: number) => void;
  selectedPersonId?: string;
}

const MINIMAP_WIDTH = 180;
const MINIMAP_HEIGHT = 120;

export function TreeMinimap({
  persons,
  relationships,
  rootPersonId,
  viewportRect,
  contentBounds,
  onViewportChange,
  selectedPersonId,
}: MinimapProps) {
  // Calculate scale to fit content in minimap
  const scale = useMemo(() => {
    if (contentBounds.width === 0 || contentBounds.height === 0) return 1;
    const scaleX = MINIMAP_WIDTH / contentBounds.width;
    const scaleY = MINIMAP_HEIGHT / contentBounds.height;
    return Math.min(scaleX, scaleY, 1) * 0.9;
  }, [contentBounds]);

  // Calculate positions for minimap nodes
  const nodePositions = useMemo(() => {
    const positions: { id: string; x: number; y: number; isSelected: boolean; gender?: string }[] = [];
    const visited = new Set<string>();

    const getChildren = (personId: string): FamilyPerson[] => {
      const childIds = relationships.filter(r => r.parent_id === personId).map(r => r.child_id);
      return persons.filter(p => childIds.includes(p.id));
    };

    const rootPerson = rootPersonId
      ? persons.find(p => p.id === rootPersonId)
      : persons[0];

    if (!rootPerson) return positions;

    // Simple layout calculation
    const calculateLayout = (person: FamilyPerson, level: number, index: number, totalInLevel: number) => {
      if (visited.has(person.id)) return;
      visited.add(person.id);

      const levelWidth = MINIMAP_WIDTH - 20;
      const xSpacing = totalInLevel > 1 ? levelWidth / (totalInLevel - 1) : 0;
      const x = totalInLevel > 1 ? 10 + index * xSpacing : MINIMAP_WIDTH / 2;
      const y = 10 + level * 25;

      positions.push({
        id: person.id,
        x,
        y,
        isSelected: person.id === selectedPersonId,
        gender: person.gender || undefined,
      });

      const children = getChildren(person.id);
      children.forEach((child, childIndex) => {
        calculateLayout(child, level + 1, childIndex, children.length);
      });
    };

    calculateLayout(rootPerson, 0, 0, 1);
    return positions;
  }, [persons, relationships, rootPersonId, selectedPersonId]);

  // Calculate connections for minimap
  const connections = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];

    for (const rel of relationships) {
      const parentPos = nodePositions.find(p => p.id === rel.parent_id);
      const childPos = nodePositions.find(p => p.id === rel.child_id);
      if (parentPos && childPos) {
        lines.push({
          x1: parentPos.x,
          y1: parentPos.y + 3,
          x2: childPos.x,
          y2: childPos.y - 3,
        });
      }
    }

    return lines;
  }, [nodePositions, relationships]);

  // Viewport rectangle in minimap coordinates
  const minimapViewport = useMemo(() => {
    return {
      x: (viewportRect.x / contentBounds.width) * MINIMAP_WIDTH,
      y: (viewportRect.y / contentBounds.height) * MINIMAP_HEIGHT,
      width: (viewportRect.width / contentBounds.width) * MINIMAP_WIDTH,
      height: (viewportRect.height / contentBounds.height) * MINIMAP_HEIGHT,
    };
  }, [viewportRect, contentBounds]);

  const handleMinimapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert to content coordinates
    const contentX = (clickX / MINIMAP_WIDTH) * contentBounds.width - viewportRect.width / 2;
    const contentY = (clickY / MINIMAP_HEIGHT) * contentBounds.height - viewportRect.height / 2;

    onViewportChange(
      Math.max(0, Math.min(contentX, contentBounds.width - viewportRect.width)),
      Math.max(0, Math.min(contentY, contentBounds.height - viewportRect.height))
    );
  };

  if (persons.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg border shadow-lg overflow-hidden z-10"
    >
      <div className="px-2 py-1 border-b bg-muted/50">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          Navigation
        </span>
      </div>
      <svg
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        className="cursor-crosshair"
        onClick={handleMinimapClick}
      >
        {/* Background */}
        <rect
          x={0}
          y={0}
          width={MINIMAP_WIDTH}
          height={MINIMAP_HEIGHT}
          fill="hsl(var(--muted) / 0.3)"
        />

        {/* Connections */}
        {connections.map((conn, index) => (
          <line
            key={`conn-${index}`}
            x1={conn.x1}
            y1={conn.y1}
            x2={conn.x2}
            y2={conn.y2}
            stroke="hsl(var(--secondary) / 0.4)"
            strokeWidth={1}
          />
        ))}

        {/* Nodes */}
        {nodePositions.map((pos) => (
          <circle
            key={pos.id}
            cx={pos.x}
            cy={pos.y}
            r={pos.isSelected ? 5 : 3}
            fill={
              pos.isSelected
                ? 'hsl(var(--secondary))'
                : pos.gender === 'male'
                ? 'hsl(210, 80%, 60%)'
                : pos.gender === 'female'
                ? 'hsl(330, 80%, 60%)'
                : 'hsl(var(--muted-foreground))'
            }
            stroke={pos.isSelected ? 'hsl(var(--secondary))' : 'none'}
            strokeWidth={pos.isSelected ? 2 : 0}
            opacity={pos.isSelected ? 1 : 0.8}
          />
        ))}

        {/* Viewport rectangle */}
        <rect
          x={Math.max(0, minimapViewport.x)}
          y={Math.max(0, minimapViewport.y)}
          width={Math.min(minimapViewport.width, MINIMAP_WIDTH - minimapViewport.x)}
          height={Math.min(minimapViewport.height, MINIMAP_HEIGHT - minimapViewport.y)}
          fill="hsl(var(--primary) / 0.1)"
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
          rx={2}
          className="pointer-events-none"
        />
      </svg>
    </motion.div>
  );
}

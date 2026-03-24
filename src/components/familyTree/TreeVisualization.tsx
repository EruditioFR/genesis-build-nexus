import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Home } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FamilyPerson, ParentChildRelationship, FamilyUnion, TreeViewMode } from '@/types/familyTree';

// Layout constants
const CARD_WIDTH = 160;
const CARD_HEIGHT = 80;
const H_GAP = 40;
const V_GAP = 100;
const SPOUSE_GAP = 20;
const COMPONENT_GAP = 120;

// ─── Internal types ─────────────────────────────────────────────────────────

interface LayoutNode {
  personId: string;
  x: number;
  y: number;
  generation: number;
}

interface Connection {
  type: 'parent-child' | 'spouse';
  from: { x: number; y: number };
  to: { x: number; y: number };
  fromPersonId: string;
  toPersonId: string;
}

export interface PersonPositionData {
  personId: string;
  x: number;
  y: number;
}

interface PersonPosition {
  person: FamilyPerson;
  x: number;
  y: number;
  generation: number;
  spouses: FamilyPerson[];
}

// ─── Graph builder ──────────────────────────────────────────────────────────

function buildFamilyGraph(
  persons: FamilyPerson[],
  relationships: ParentChildRelationship[],
  unions: FamilyUnion[],
) {
  const personMap = new Map<string, FamilyPerson>();
  persons.forEach(p => personMap.set(p.id, p));

  const childrenOf = new Map<string, Set<string>>();
  const parentsOf = new Map<string, Set<string>>();
  const unionsOf = new Map<string, FamilyUnion[]>();

  for (const r of relationships) {
    if (!childrenOf.has(r.parent_id)) childrenOf.set(r.parent_id, new Set());
    childrenOf.get(r.parent_id)!.add(r.child_id);
    if (!parentsOf.has(r.child_id)) parentsOf.set(r.child_id, new Set());
    parentsOf.get(r.child_id)!.add(r.parent_id);
  }

  for (const u of unions) {
    if (!unionsOf.has(u.person1_id)) unionsOf.set(u.person1_id, []);
    unionsOf.get(u.person1_id)!.push(u);
    if (!unionsOf.has(u.person2_id)) unionsOf.set(u.person2_id, []);
    unionsOf.get(u.person2_id)!.push(u);
  }

  function getSpouseIds(personId: string): string[] {
    const personUnions = unionsOf.get(personId) || [];
    return personUnions.map(u => u.person1_id === personId ? u.person2_id : u.person1_id);
  }

  function getParentIds(personId: string): string[] {
    return Array.from(parentsOf.get(personId) || []);
  }

  function getChildIds(personId: string): string[] {
    return Array.from(childrenOf.get(personId) || []);
  }

  function findComponents(rootId?: string): string[][] {
    const visited = new Set<string>();
    const components: string[][] = [];

    const bfs = (startId: string): string[] => {
      const component: string[] = [];
      const queue = [startId];
      while (queue.length > 0) {
        const id = queue.shift()!;
        if (visited.has(id)) continue;
        visited.add(id);
        component.push(id);
        for (const cid of getChildIds(id)) if (!visited.has(cid)) queue.push(cid);
        for (const pid of getParentIds(id)) if (!visited.has(pid)) queue.push(pid);
        for (const sid of getSpouseIds(id)) if (!visited.has(sid)) queue.push(sid);
      }
      return component;
    };

    if (rootId && personMap.has(rootId)) {
      components.push(bfs(rootId));
    }

    for (const p of persons) {
      if (!visited.has(p.id)) {
        components.push(bfs(p.id));
      }
    }

    return components;
  }

  return {
    personMap,
    childrenOf,
    parentsOf,
    unionsOf,
    getSpouseIds,
    getParentIds,
    getChildIds,
    findComponents,
  };
}

// ─── Lineage-based layout engine (genealogical standard) ────────────────────
//
// Each bloodline forms an independent vertical column. Spouses with ancestry
// get their own column. Cross-lineage marriages are shown as horizontal lines.
//
// Algorithm:
// 1. BFS from root through parent-child links only → main lineage
// 2. Spouses with parents → separate lineages (recursively)
// 3. Spouses without parents → same lineage as partner
// 4. Layout each lineage as an independent subtree column
// 5. Post-processing: cross-lineage marriage + parent-child connections

interface Lineage {
  members: Set<string>;
  rootAncestorId: string;
}

function layoutUnified(
  rootId: string,
  graph: ReturnType<typeof buildFamilyGraph>,
  persons: FamilyPerson[],
  relationships: ParentChildRelationship[],
  unions: FamilyUnion[],
  viewMode: TreeViewMode,
): { positions: Map<string, LayoutNode>; connections: Connection[]; rootGeneration: number } {
  const positions = new Map<string, LayoutNode>();
  const connections: Connection[] = [];

  // ── Phase 1: Build lineages by blood connection ─────────────────────────
  const genOf = new Map<string, number>();
  const lineageOf = new Map<string, number>();
  const lineages: Lineage[] = [];

  /** BFS through parent-child links only. Returns lineage info. */
  function buildLineageFrom(startId: string, startGen: number, lineageIdx: number): Lineage {
    const members = new Set<string>();
    const queue: { id: string; gen: number }[] = [{ id: startId, gen: startGen }];

    while (queue.length > 0) {
      const { id, gen } = queue.shift()!;
      if (genOf.has(id)) continue;
      genOf.set(id, gen);
      members.add(id);
      lineageOf.set(id, lineageIdx);

      for (const pid of graph.getParentIds(id)) {
        if (!genOf.has(pid)) queue.push({ id: pid, gen: gen - 1 });
      }
      for (const cid of graph.getChildIds(id)) {
        if (!genOf.has(cid)) queue.push({ id: cid, gen: gen + 1 });
      }
    }

    // Find topmost ancestor without parents in this lineage
    let rootAncId = startId;
    let minGenVal = Infinity;
    for (const mid of members) {
      const g = genOf.get(mid)!;
      if (g < minGenVal) {
        const parentsInLineage = graph.getParentIds(mid).filter(p => members.has(p));
        if (parentsInLineage.length === 0) {
          rootAncId = mid;
          minGenVal = g;
        }
      }
    }

    return { members, rootAncestorId: rootAncId };
  }

  // Main lineage from root
  lineages.push(buildLineageFrom(rootId, 0, 0));

  // Iteratively discover spouse lineages
  let discoveryChanged = true;
  while (discoveryChanged) {
    discoveryChanged = false;
    for (const lineage of lineages) {
      for (const memberId of lineage.members) {
        for (const spouseId of graph.getSpouseIds(memberId)) {
          if (genOf.has(spouseId)) continue;
          const spouseParents = graph.getParentIds(spouseId);
          if (spouseParents.length > 0) {
            // Spouse has ancestry → separate lineage, anchored at partner's generation
            const newIdx = lineages.length;
            lineages.push(buildLineageFrom(spouseId, genOf.get(memberId)!, newIdx));
            discoveryChanged = true;
          } else {
            // Orphan spouse → place in partner's lineage
            genOf.set(spouseId, genOf.get(memberId)!);
            lineage.members.add(spouseId);
            lineageOf.set(spouseId, lineages.indexOf(lineage));
          }
        }
      }
    }
  }

  // ── Phase 2: Filter by view mode ────────────────────────────────────────
  const rootGen = genOf.get(rootId) ?? 0;
  const activeIds = new Set<string>();
  for (const [id, gen] of genOf) {
    if (viewMode === 'descendant' && gen < rootGen) continue;
    if (viewMode === 'ascendant' && gen > rootGen) continue;
    activeIds.add(id);
  }

  let minGen = Infinity;
  for (const id of activeIds) minGen = Math.min(minGen, genOf.get(id)!);
  if (!isFinite(minGen)) minGen = 0;
  const normGen = (id: string) => (genOf.get(id) ?? 0) - minGen;
  const normalizedRootGen = rootGen - minGen;

  // ── Phase 3: Layout each lineage as independent column ──────────────────
  const placed = new Set<string>();

  function getSpousesInLineage(id: string, li: number): string[] {
    return graph.getSpouseIds(id).filter(
      s => activeIds.has(s) && !placed.has(s) && lineageOf.get(s) === li
    );
  }

  function getChildrenInLineage(personId: string, spouseIds: string[], li: number): string[] {
    const all = new Set<string>();
    for (const cid of graph.getChildIds(personId))
      if (activeIds.has(cid) && !placed.has(cid) && lineageOf.get(cid) === li) all.add(cid);
    for (const sid of spouseIds)
      for (const cid of graph.getChildIds(sid))
        if (activeIds.has(cid) && !placed.has(cid) && lineageOf.get(cid) === li) all.add(cid);
    return [...all];
  }

  function measureInLineage(personId: string, li: number, tempPlaced: Set<string>): number {
    if (tempPlaced.has(personId)) return 0;
    tempPlaced.add(personId);

    const spouseIds = getSpousesInLineage(personId, li).filter(s => !tempPlaced.has(s));
    spouseIds.forEach(s => tempPlaced.add(s));

    const unitWidth = CARD_WIDTH + spouseIds.length * (CARD_WIDTH + SPOUSE_GAP);

    const childIds = getChildrenInLineage(personId, spouseIds, li);
    let childrenWidth = 0;
    for (const cid of childIds) childrenWidth += measureInLineage(cid, li, tempPlaced);
    if (childIds.length > 1) childrenWidth += (childIds.length - 1) * H_GAP;

    return Math.max(unitWidth, childrenWidth);
  }

  function placeInLineage(personId: string, li: number, x: number): number {
    if (placed.has(personId)) return 0;
    placed.add(personId);

    const gen = normGen(personId);
    const y = gen * (CARD_HEIGHT + V_GAP);
    const spouseIds = getSpousesInLineage(personId, li);
    spouseIds.forEach(s => placed.add(s));

    const childIds = getChildrenInLineage(personId, spouseIds, li);

    // Measure children
    const childWidths: number[] = [];
    let childrenWidth = 0;
    for (const cid of childIds) {
      const w = measureInLineage(cid, li, new Set(placed));
      childWidths.push(w);
      childrenWidth += w;
    }
    if (childIds.length > 1) childrenWidth += (childIds.length - 1) * H_GAP;

    const unitWidth = CARD_WIDTH + spouseIds.length * (CARD_WIDTH + SPOUSE_GAP);
    const totalWidth = Math.max(unitWidth, childrenWidth);
    const unitX = x + (totalWidth - unitWidth) / 2;

    // Place person
    positions.set(personId, { personId, x: unitX, y, generation: gen });

    // Place same-lineage spouses adjacent
    let sx = unitX + CARD_WIDTH + SPOUSE_GAP;
    for (const sid of spouseIds) {
      positions.set(sid, { personId: sid, x: sx, y, generation: gen });
      connections.push({
        type: 'spouse',
        from: { x: unitX + CARD_WIDTH, y: y + CARD_HEIGHT / 2 },
        to: { x: sx, y: y + CARD_HEIGHT / 2 },
        fromPersonId: personId,
        toPersonId: sid,
      });
      sx += CARD_WIDTH + SPOUSE_GAP;
    }

    // Union center for child connections
    let unionCenterX: number;
    if (spouseIds.length > 0) {
      const spPos = positions.get(spouseIds[0])!;
      unionCenterX = (unitX + CARD_WIDTH / 2 + spPos.x + CARD_WIDTH / 2) / 2;
    } else {
      unionCenterX = unitX + CARD_WIDTH / 2;
    }

    // Place children
    if (childIds.length > 0) {
      const childStartX = x + (totalWidth - childrenWidth) / 2;
      let cx = childStartX;
      for (let i = 0; i < childIds.length; i++) {
        placeInLineage(childIds[i], li, cx);
        const childPos = positions.get(childIds[i]);
        if (childPos) {
          connections.push({
            type: 'parent-child',
            from: { x: unionCenterX, y: y + CARD_HEIGHT },
            to: { x: childPos.x + CARD_WIDTH / 2, y: childPos.y },
            fromPersonId: personId,
            toPersonId: childIds[i],
          });
        }
        cx += childWidths[i] + H_GAP;
      }
    }

    return totalWidth;
  }

  // ── Order lineages: main first, then by marriage proximity ──────────────
  const lineageOrder: number[] = [0];
  const orderedSet = new Set([0]);
  const lineageQueue = [0];

  while (lineageQueue.length > 0) {
    const li = lineageQueue.shift()!;
    const lineage = lineages[li];
    if (!lineage) continue;
    for (const memberId of lineage.members) {
      for (const spouseId of graph.getSpouseIds(memberId)) {
        const spLi = lineageOf.get(spouseId);
        if (spLi !== undefined && !orderedSet.has(spLi)) {
          lineageOrder.push(spLi);
          orderedSet.add(spLi);
          lineageQueue.push(spLi);
        }
      }
    }
  }
  for (let i = 0; i < lineages.length; i++) {
    if (!orderedSet.has(i)) lineageOrder.push(i);
  }

  // ── Layout each lineage column ─────────────────────────────────────────
  let currentX = 0;
  for (const li of lineageOrder) {
    const lineage = lineages[li];
    if (!lineage) continue;

    // Find active root ancestor for this lineage
    let rootAncId = lineage.rootAncestorId;
    if (!activeIds.has(rootAncId)) {
      let topGen = Infinity;
      for (const mid of lineage.members) {
        if (activeIds.has(mid) && normGen(mid) < topGen) {
          const parents = graph.getParentIds(mid).filter(p => activeIds.has(p) && lineage.members.has(p));
          if (parents.length === 0) {
            rootAncId = mid;
            topGen = normGen(mid);
          }
        }
      }
    }

    if (placed.has(rootAncId)) continue;

    const w = placeInLineage(rootAncId, li, currentX);
    if (w > 0) currentX += w + COMPONENT_GAP;
  }

  // ── Phase 4: Cross-lineage connections ──────────────────────────────────

  // Cross-lineage spouse connections
  const existingSpouseKeys = new Set(
    connections.filter(c => c.type === 'spouse')
      .map(c => [c.fromPersonId, c.toPersonId].sort().join('|'))
  );
  for (const u of unions) {
    const key = [u.person1_id, u.person2_id].sort().join('|');
    if (existingSpouseKeys.has(key)) continue;
    const pos1 = positions.get(u.person1_id);
    const pos2 = positions.get(u.person2_id);
    if (!pos1 || !pos2) continue;
    const left = pos1.x < pos2.x ? pos1 : pos2;
    const right = pos1.x < pos2.x ? pos2 : pos1;
    const leftId = pos1.x < pos2.x ? u.person1_id : u.person2_id;
    const rightId = pos1.x < pos2.x ? u.person2_id : u.person1_id;
    connections.push({
      type: 'spouse',
      from: { x: left.x + CARD_WIDTH, y: left.y + CARD_HEIGHT / 2 },
      to: { x: right.x, y: right.y + CARD_HEIGHT / 2 },
      fromPersonId: leftId,
      toPersonId: rightId,
    });
  }

  // Cross-lineage parent-child connections
  const existingPCKeys = new Set(
    connections.filter(c => c.type === 'parent-child')
      .map(c => `${c.fromPersonId}→${c.toPersonId}`)
  );
  for (const r of relationships) {
    if (!activeIds.has(r.parent_id) || !activeIds.has(r.child_id)) continue;
    if (existingPCKeys.has(`${r.parent_id}→${r.child_id}`)) continue;
    const parentPos = positions.get(r.parent_id);
    const childPos = positions.get(r.child_id);
    if (!parentPos || !childPos) continue;
    connections.push({
      type: 'parent-child',
      from: { x: parentPos.x + CARD_WIDTH / 2, y: parentPos.y + CARD_HEIGHT },
      to: { x: childPos.x + CARD_WIDTH / 2, y: childPos.y },
      fromPersonId: r.parent_id,
      toPersonId: r.child_id,
    });
  }

  resolveOverlaps(positions);

  return { positions, connections, rootGeneration: normalizedRootGen };
}

// ─── Overlap resolver ───────────────────────────────────────────────────────

function resolveOverlaps(positions: Map<string, LayoutNode>): void {
  const byGeneration = new Map<number, LayoutNode[]>();
  for (const node of positions.values()) {
    if (!byGeneration.has(node.generation)) byGeneration.set(node.generation, []);
    byGeneration.get(node.generation)!.push(node);
  }

  for (const [, nodes] of byGeneration) {
    nodes.sort((a, b) => a.x - b.x);
    for (let i = 1; i < nodes.length; i++) {
      const prev = nodes[i - 1];
      const curr = nodes[i];
      const minX = prev.x + CARD_WIDTH + SPOUSE_GAP;
      if (curr.x < minX) {
        const shift = minX - curr.x;
        for (let j = i; j < nodes.length; j++) {
          nodes[j].x += shift;
        }
      }
    }
  }
}

// ─── Main component ─────────────────────────────────────────────────────────

interface TreeVisualizationProps {
  persons: FamilyPerson[];
  relationships: ParentChildRelationship[];
  unions: FamilyUnion[];
  rootPersonId?: string;
  viewMode: TreeViewMode;
  selectedPersonId?: string;
  highlightedPersonId?: string;
  activeBranchIds?: Set<string>;
  onPersonClick: (person: FamilyPerson) => void;
  onAddPerson: (type: 'parent' | 'child' | 'spouse', target: FamilyPerson) => void;
  onPositionsCalculated?: (positions: PersonPositionData[]) => void;
}

export function TreeVisualization({
  persons,
  relationships,
  unions,
  rootPersonId,
  viewMode,
  selectedPersonId,
  highlightedPersonId,
  activeBranchIds,
  onPersonClick,
  onAddPerson,
  onPositionsCalculated,
}: TreeVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const { positions, connections, bounds, rootGeneration } = useMemo(() => {
    if (persons.length === 0) {
      return {
        positions: [] as PersonPosition[],
        connections: [] as Connection[],
        bounds: { minX: 0, maxX: 800, minY: 0, maxY: 600 },
        rootGeneration: 0,
      };
    }

    const graph = buildFamilyGraph(persons, relationships, unions);

    // Find root person
    const rootPerson = rootPersonId
      ? persons.find(p => p.id === rootPersonId) || persons[0]
      : persons[0];

    // Find connected components
    const components = graph.findComponents(rootPerson.id);

    const allPositions = new Map<string, LayoutNode>();
    const allConnections: Connection[] = [];
    let currentX = 0;
    let detectedRootGen = 0;

    for (const component of components) {
      if (component.length === 0) continue;

      // Pick the root for this component
      const componentRoot = component.includes(rootPerson.id)
        ? rootPerson.id
        : component[0];

      // Use the unified layout engine
      const result = layoutUnified(componentRoot, graph, persons, relationships, unions, viewMode);

      // Shift positions by currentX offset
      for (const [id, pos] of result.positions) {
        allPositions.set(id, { ...pos, x: pos.x + currentX });
      }
      for (const conn of result.connections) {
        allConnections.push({
          ...conn,
          from: { x: conn.from.x + currentX, y: conn.from.y },
          to: { x: conn.to.x + currentX, y: conn.to.y },
        });
      }

      if (componentRoot === rootPerson.id) {
        detectedRootGen = result.rootGeneration;
      }

      // Calculate max X for next component
      let maxX = 0;
      for (const pos of result.positions.values()) {
        maxX = Math.max(maxX, pos.x + CARD_WIDTH);
      }
      currentX += maxX + COMPONENT_GAP;
    }

    // Safety net: place any persons not yet positioned
    const missingPersons = persons.filter(p => !allPositions.has(p.id));
    if (missingPersons.length > 0) {
      let maxY = 0;
      for (const pos of allPositions.values()) maxY = Math.max(maxY, pos.y);
      const orphanY = maxY + CARD_HEIGHT + COMPONENT_GAP;
      let orphanX = 0;
      for (const p of missingPersons) {
        allPositions.set(p.id, { personId: p.id, x: orphanX, y: orphanY, generation: 99 });
        orphanX += CARD_WIDTH + H_GAP;
      }
    }

    // Convert to PersonPosition array
    const positionsArray: PersonPosition[] = [];
    for (const [id, node] of allPositions) {
      const person = graph.personMap.get(id);
      if (person) {
        positionsArray.push({
          person,
          x: node.x,
          y: node.y,
          generation: node.generation,
          spouses: graph.getSpouseIds(id)
            .map(sid => graph.personMap.get(sid))
            .filter((p): p is FamilyPerson => !!p),
        });
      }
    }

    // Calculate bounds
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const pos of positionsArray) {
      minX = Math.min(minX, pos.x);
      maxX = Math.max(maxX, pos.x + CARD_WIDTH);
      minY = Math.min(minY, pos.y);
      maxY = Math.max(maxY, pos.y + CARD_HEIGHT);
    }

    return {
      positions: positionsArray,
      connections: allConnections,
      bounds: {
        minX: isFinite(minX) ? minX : 0,
        maxX: isFinite(maxX) ? maxX : 800,
        minY: isFinite(minY) ? minY : 0,
        maxY: isFinite(maxY) ? maxY : 600,
      },
      rootGeneration: detectedRootGen,
    };
  }, [persons, relationships, unions, rootPersonId, viewMode]);

  // Update dimensions
  useEffect(() => {
    const padding = 100;
    setDimensions({
      width: Math.max(800, bounds.maxX - bounds.minX + padding * 2),
      height: Math.max(600, bounds.maxY - bounds.minY + padding * 2),
    });
  }, [bounds]);

  const offsetX = 50 - bounds.minX;
  const offsetY = 50 - bounds.minY;

  // Report positions (stable ref to avoid re-render loops)
  const lastPositionsRef = useRef<string>('');
  useEffect(() => {
    if (onPositionsCalculated && positions.length > 0) {
      const positionsData: PersonPositionData[] = positions.map(pos => ({
        personId: pos.person.id,
        x: pos.x + offsetX,
        y: pos.y + offsetY,
      }));
      const key = positionsData.map(p => `${p.personId}:${p.x}:${p.y}`).join(',');
      if (key !== lastPositionsRef.current) {
        lastPositionsRef.current = key;
        onPositionsCalculated(positionsData);
      }
    }
  }, [positions, offsetX, offsetY, onPositionsCalculated]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        width: dimensions.width,
        height: dimensions.height,
        minWidth: '100%',
        minHeight: '100%',
      }}
    >
      {/* SVG connections layer */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={dimensions.width}
        height={dimensions.height}
      >
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.3" />
          </linearGradient>
          <symbol id="heartSymbol" viewBox="0 0 24 24" width="12" height="12">
            <path
              fill="hsl(var(--accent))"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </symbol>
        </defs>

        {connections.map((conn, index) => {
          const fromX = conn.from.x + offsetX;
          const fromY = conn.from.y + offsetY;
          const toX = conn.to.x + offsetX;
          const toY = conn.to.y + offsetY;

          const isActive = !activeBranchIds || (activeBranchIds.has(conn.fromPersonId) && activeBranchIds.has(conn.toPersonId));
          const connOpacity = isActive ? 1 : 0.15;

          if (conn.type === 'spouse') {
            const midX = (fromX + toX) / 2;
            const midY = fromY;
            // Double line for marriage (genealogical standard)
            return (
              <g key={`conn-${index}`} opacity={connOpacity}>
                <line
                  x1={fromX} y1={fromY - 1.5} x2={toX} y2={toY - 1.5}
                  stroke="hsl(var(--accent))"
                  strokeWidth="1.5"
                />
                <line
                  x1={fromX} y1={fromY + 1.5} x2={toX} y2={toY + 1.5}
                  stroke="hsl(var(--accent))"
                  strokeWidth="1.5"
                />
                <use href="#heartSymbol" x={midX - 6} y={midY - 6} />
              </g>
            );
          } else {
            // Orthogonal parent-child connection (genealogical standard)
            const midY = fromY + (toY - fromY) * 0.4;
            const path = `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`;
            return (
              <g key={`conn-${index}`} opacity={connOpacity}>
                <path
                  d={path}
                  fill="none"
                  stroke="hsl(var(--secondary))"
                  strokeWidth="1.5"
                  strokeOpacity="0.6"
                />
                <circle cx={toX} cy={toY} r="2.5" fill="hsl(var(--secondary))" fillOpacity="0.5" />
              </g>
            );
          }
        })}
      </svg>

      {/* Person cards */}
      {positions.map((pos) => (
        <div
          key={pos.person.id}
          className="absolute"
          style={{
            left: pos.x + offsetX,
            top: pos.y + offsetY,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
          }}
        >
          <TreePersonCard
            person={pos.person}
            isSelected={selectedPersonId === pos.person.id}
            isHighlighted={highlightedPersonId === pos.person.id}
            isRoot={rootPersonId === pos.person.id}
            isDimmed={!!activeBranchIds && !activeBranchIds.has(pos.person.id)}
            onClick={() => onPersonClick(pos.person)}
            generation={pos.generation}
          />
        </div>
      ))}

      {/* Generation labels */}
      <GenerationLabels
        positions={positions}
        offsetX={offsetX}
        offsetY={offsetY}
        rootGeneration={rootGeneration}
      />
    </div>
  );
}

// ─── Person Card ────────────────────────────────────────────────────────────

interface TreePersonCardProps {
  person: FamilyPerson;
  isSelected: boolean;
  isHighlighted?: boolean;
  isRoot?: boolean;
  isDimmed?: boolean;
  onClick: () => void;
  generation: number;
}

function TreePersonCard({ person, isSelected, isHighlighted, isRoot, isDimmed, onClick }: TreePersonCardProps) {
  const initials = `${person.first_names[0] || ''}${person.last_name[0] || ''}`.toUpperCase();

  const getBirthYear = () => {
    if (!person.birth_date) return null;
    return new Date(person.birth_date).getFullYear();
  };

  const getDeathYear = () => {
    if (!person.death_date) return null;
    return new Date(person.death_date).getFullYear();
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full h-full rounded-xl p-2 flex items-center gap-2 transition-all duration-300",
        "border-2 bg-card shadow-md hover:shadow-lg",
        "hover:-translate-y-0.5",
        isSelected
          ? "border-secondary ring-2 ring-secondary/20 shadow-secondary/20"
          : "border-border hover:border-secondary/50",
        isHighlighted && "animate-highlight-pulse",
        isDimmed && "opacity-20 scale-[0.97]",
        !person.is_alive && !isDimmed && "opacity-80"
      )}
    >
      {isRoot && (
        <div className="absolute -top-2 -left-2 z-10">
          <div className="w-5 h-5 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shadow-sm">
            <Home className="w-3 h-3" />
          </div>
        </div>
      )}

      <Avatar className={cn(
        "w-12 h-12 border-2",
        person.gender === 'male' ? 'border-blue-400/50' :
        person.gender === 'female' ? 'border-pink-400/50' :
        'border-secondary/30'
      )}>
        <AvatarImage src={person.profile_photo_url || undefined} />
        <AvatarFallback className={cn(
          "text-xs font-medium",
          person.gender === 'male' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
          person.gender === 'female' ? 'bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300' :
          'bg-secondary/10 text-secondary'
        )}>
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 text-left">
        <p className="text-xs font-semibold truncate leading-tight">
          {person.first_names}
        </p>
        <p className="text-xs text-muted-foreground truncate leading-tight">
          {person.last_name}
        </p>
        {(getBirthYear() || getDeathYear()) && (
          <p className="text-[10px] text-muted-foreground/70 mt-0.5">
            {getBirthYear() || '?'} - {!person.is_alive ? (getDeathYear() || '?') : ''}
          </p>
        )}
      </div>

      {!person.is_alive && (
        <div className="absolute top-1 right-1">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
        </div>
      )}
    </button>
  );
}

// ─── Generation Labels ──────────────────────────────────────────────────────

interface GenerationLabelsProps {
  positions: PersonPosition[];
  offsetX: number;
  offsetY: number;
  rootGeneration: number;
}

function GenerationLabels({ positions, offsetX, offsetY, rootGeneration }: GenerationLabelsProps) {
  const generations = useMemo(() => {
    const genMap = new Map<number, number>();
    for (const pos of positions) {
      if (!genMap.has(pos.generation)) {
        genMap.set(pos.generation, pos.y);
      }
    }
    return Array.from(genMap.entries()).sort((a, b) => a[0] - b[0]);
  }, [positions]);

  const getGenerationLabel = (gen: number) => {
    const diff = gen - rootGeneration;
    if (diff === 0) return 'Vous';
    if (diff === 1) return 'Enfants';
    if (diff === -1) return 'Parents';
    if (diff === 2) return 'Petits-enfants';
    if (diff === -2) return 'Grands-parents';
    if (diff === 3) return 'Arrière-petits-enfants';
    if (diff === -3) return 'Arrière-grands-parents';
    if (diff > 0) return `Génération +${diff}`;
    return `Génération ${diff}`;
  };

  return (
    <>
      {generations.map(([gen, y]) => (
        <div
          key={gen}
          className="absolute left-2 flex items-center"
          style={{ top: y + offsetY + CARD_HEIGHT / 2 - 12 }}
        >
          <Badge
            variant="outline"
            className="text-[10px] bg-background/80 backdrop-blur-sm border-dashed"
          >
            {getGenerationLabel(gen)}
          </Badge>
        </div>
      ))}
    </>
  );
}

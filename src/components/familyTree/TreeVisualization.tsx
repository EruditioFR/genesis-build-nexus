import { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

// ─── Unified layout engine ──────────────────────────────────────────────────
//
// Follows genealogical conventions:
// 1. BFS from root assigns generations (spouse = same, parent = gen-1, child = gen+1)
// 2. Filter by view mode (descendant/ascendant/hourglass)
// 3. Identify root ancestors (persons with no parents in active set)
// 4. Top-down recursive layout: each person + spouse(s) form a unit;
//    children are centered below their parents' union point.
// 5. Post-processing adds connections for converging branches.

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
  const placed = new Set<string>();

  // ── Step 1: BFS generation assignment ────────────────────────────────────
  const genOf = new Map<string, number>();
  {
    const q: { id: string; gen: number }[] = [{ id: rootId, gen: 0 }];
    const v = new Set<string>();
    while (q.length > 0) {
      const { id, gen } = q.shift()!;
      if (v.has(id)) continue;
      v.add(id);
      genOf.set(id, gen);
      for (const s of graph.getSpouseIds(id)) if (!v.has(s)) q.push({ id: s, gen });
      for (const p of graph.getParentIds(id)) if (!v.has(p)) q.push({ id: p, gen: gen - 1 });
      for (const c of graph.getChildIds(id)) if (!v.has(c)) q.push({ id: c, gen: gen + 1 });
    }
  }

  // ── Step 2: Filter by view mode ──────────────────────────────────────────
  const rootGen = genOf.get(rootId) ?? 0;
  const activeIds = new Set<string>();
  for (const [id, gen] of genOf) {
    if (viewMode === 'descendant' && gen < rootGen) continue;
    if (viewMode === 'ascendant' && gen > rootGen) continue;
    activeIds.add(id);
  }

  // Normalize so minimum active generation = 0
  let minGen = Infinity;
  for (const id of activeIds) minGen = Math.min(minGen, genOf.get(id)!);
  if (!isFinite(minGen)) minGen = 0;
  const normGen = (id: string) => (genOf.get(id) ?? 0) - minGen;
  const normalizedRootGen = rootGen - minGen;

  // ── Step 3: Recursive subtree measurement + placement ────────────────────

  /** Return spouse IDs on the same generation that haven't been placed yet */
  function getActiveSpouses(id: string): string[] {
    return graph.getSpouseIds(id).filter(s => activeIds.has(s) && !placed.has(s));
  }

  /** Return children of a family unit (person + spouses) that haven't been placed */
  function getUnitChildren(personId: string, spouseIds: string[]): string[] {
    const all = new Set<string>();
    for (const cid of graph.getChildIds(personId))
      if (activeIds.has(cid) && !placed.has(cid)) all.add(cid);
    for (const sid of spouseIds)
      for (const cid of graph.getChildIds(sid))
        if (activeIds.has(cid) && !placed.has(cid)) all.add(cid);
    return [...all];
  }

  /** Measure the width needed for a subtree rooted at personId */
  function measureSubtree(personId: string, tempPlaced: Set<string>): number {
    if (tempPlaced.has(personId)) return 0;
    tempPlaced.add(personId);

    const spouseIds = graph.getSpouseIds(personId).filter(
      s => activeIds.has(s) && !tempPlaced.has(s)
    );
    spouseIds.forEach(s => tempPlaced.add(s));

    const unitWidth = CARD_WIDTH + spouseIds.length * (CARD_WIDTH + SPOUSE_GAP);

    // Collect children
    const childIds: string[] = [];
    const allC = new Set<string>();
    for (const cid of graph.getChildIds(personId))
      if (activeIds.has(cid) && !tempPlaced.has(cid)) allC.add(cid);
    for (const sid of spouseIds)
      for (const cid of graph.getChildIds(sid))
        if (activeIds.has(cid) && !tempPlaced.has(cid)) allC.add(cid);
    childIds.push(...allC);

    let childrenWidth = 0;
    for (const cid of childIds) childrenWidth += measureSubtree(cid, tempPlaced);
    if (childIds.length > 1) childrenWidth += (childIds.length - 1) * H_GAP;

    return Math.max(unitWidth, childrenWidth);
  }

  /** Place a subtree starting at personId at horizontal offset x. Returns total width used. */
  function placeSubtree(personId: string, x: number): number {
    if (placed.has(personId)) return 0;
    placed.add(personId);

    const gen = normGen(personId);
    const spouseIds = getActiveSpouses(personId);
    spouseIds.forEach(s => placed.add(s));

    const unitWidth = CARD_WIDTH + spouseIds.length * (CARD_WIDTH + SPOUSE_GAP);
    const childIds = getUnitChildren(personId, spouseIds);

    // Measure children to determine total width
    const childWidths: number[] = [];
    let childrenWidth = 0;
    for (const cid of childIds) {
      const w = measureSubtree(cid, new Set(placed));
      childWidths.push(w);
      childrenWidth += w;
    }
    if (childIds.length > 1) childrenWidth += (childIds.length - 1) * H_GAP;

    const totalWidth = Math.max(unitWidth, childrenWidth);
    const unitX = x + (totalWidth - unitWidth) / 2;
    const y = gen * (CARD_HEIGHT + V_GAP);

    // Place main person
    positions.set(personId, { personId, x: unitX, y, generation: gen });

    // Place spouses adjacent
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

    // Union center point (midpoint between person and first spouse, or person center)
    let unionCenterX: number;
    if (spouseIds.length > 0) {
      const spPos = positions.get(spouseIds[0])!;
      unionCenterX = (unitX + CARD_WIDTH / 2 + spPos.x + CARD_WIDTH / 2) / 2;
    } else {
      unionCenterX = unitX + CARD_WIDTH / 2;
    }

    // Place children centered below the union
    if (childIds.length > 0) {
      const childStartX = x + (totalWidth - childrenWidth) / 2;
      let cx = childStartX;
      for (let i = 0; i < childIds.length; i++) {
        placeSubtree(childIds[i], cx);
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

  // ── Step 4: Find root ancestors and lay them out ─────────────────────────
  // Root ancestors = persons with no parents in the active set
  // Process the branch containing rootId first for better positioning

  const rootAncestors: string[] = [];
  const raVisited = new Set<string>();

  // Sort active persons by generation (topmost first)
  const sortedActive = [...activeIds].sort((a, b) => normGen(a) - normGen(b));

  for (const id of sortedActive) {
    if (raVisited.has(id)) continue;
    const parents = graph.getParentIds(id).filter(p => activeIds.has(p));
    if (parents.length === 0) {
      raVisited.add(id);
      for (const sid of graph.getSpouseIds(id)) raVisited.add(sid);
      rootAncestors.push(id);
    }
  }

  if (rootAncestors.length === 0) rootAncestors.push(rootId);

  // Put the ancestor belonging to root's branch first
  const rootComponent = new Set<string>();
  {
    // BFS up from rootId to find which root ancestor is in the main branch
    let cur = rootId;
    const seen = new Set<string>();
    while (true) {
      if (seen.has(cur)) break;
      seen.add(cur);
      rootComponent.add(cur);
      const parents = graph.getParentIds(cur).filter(p => activeIds.has(p));
      if (parents.length === 0) break;
      cur = parents[0];
    }
  }
  rootAncestors.sort((a, b) => {
    const aMain = rootComponent.has(a) ? 0 : 1;
    const bMain = rootComponent.has(b) ? 0 : 1;
    return aMain - bMain;
  });

  // Layout each root ancestor's subtree
  let currentX = 0;
  for (const ra of rootAncestors) {
    if (placed.has(ra)) continue;
    const w = placeSubtree(ra, currentX);
    if (w > 0) currentX += w + COMPONENT_GAP;
  }

  // ── Step 5: Post-processing ──────────────────────────────────────────────
  // Add missing spouse connections (for unions where both persons were placed
  // via different branches)
  const existingSpouseConns = new Set(
    connections.filter(c => c.type === 'spouse')
      .map(c => [c.fromPersonId, c.toPersonId].sort().join('|'))
  );
  for (const u of unions) {
    const key = [u.person1_id, u.person2_id].sort().join('|');
    if (existingSpouseConns.has(key)) continue;
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

  // Add missing parent-child connections (converging branches)
  const existingPCConns = new Set(
    connections.filter(c => c.type === 'parent-child')
      .map(c => `${c.fromPersonId}→${c.toPersonId}`)
  );
  for (const r of relationships) {
    if (!activeIds.has(r.parent_id) || !activeIds.has(r.child_id)) continue;
    const key = `${r.parent_id}→${r.child_id}`;
    if (existingPCConns.has(key)) continue;
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

  // Resolve overlaps
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

  // Report positions
  useEffect(() => {
    if (onPositionsCalculated && positions.length > 0) {
      const positionsData: PersonPositionData[] = positions.map(pos => ({
        personId: pos.person.id,
        x: pos.x + offsetX,
        y: pos.y + offsetY,
      }));
      onPositionsCalculated(positionsData);
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
            return (
              <g key={`conn-${index}`} opacity={connOpacity} className="transition-opacity duration-300">
                <motion.line
                  x1={fromX} y1={fromY} x2={toX} y2={toY}
                  stroke="hsl(var(--accent))"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.02 }}
                />
                <use href="#heartSymbol" x={midX - 6} y={midY - 6} />
              </g>
            );
          } else {
            // T-shape genealogical connection
            const midY = fromY + (toY - fromY) / 2;
            return (
              <g key={`conn-${index}`} opacity={connOpacity} className="transition-opacity duration-300">
                <motion.line
                  x1={fromX} y1={fromY} x2={fromX} y2={midY}
                  stroke="hsl(var(--secondary))" strokeWidth="2" strokeOpacity="0.5"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                />
                <motion.line
                  x1={fromX} y1={midY} x2={toX} y2={midY}
                  stroke="hsl(var(--secondary))" strokeWidth="2" strokeOpacity="0.5"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.02 + 0.1 }}
                />
                <motion.line
                  x1={toX} y1={midY} x2={toX} y2={toY}
                  stroke="hsl(var(--secondary))" strokeWidth="2" strokeOpacity="0.5"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.02 + 0.2 }}
                />
                <circle cx={toX} cy={midY} r="3" fill="hsl(var(--secondary))" fillOpacity="0.4" />
              </g>
            );
          }
        })}
      </svg>

      {/* Person cards */}
      {positions.map((pos, index) => (
        <motion.div
          key={pos.person.id}
          className="absolute"
          style={{
            left: pos.x + offsetX,
            top: pos.y + offsetY,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
          }}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: Math.min(index * 0.03, 1.5),
            ease: [0.23, 1, 0.32, 1],
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
        </motion.div>
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

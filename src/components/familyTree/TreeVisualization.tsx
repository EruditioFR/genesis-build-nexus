import { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

interface FamilyUnit {
  id: string;
  partners: string[];   // 1 or 2 person IDs
  childIds: string[];   // children of this specific union
}

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

  // Index: parentId → childIds
  const childrenOf = new Map<string, Set<string>>();
  // Index: childId → parentIds
  const parentsOf = new Map<string, Set<string>>();
  // Index: personId → union[]
  const unionsOf = new Map<string, FamilyUnion[]>();
  // Index: unionId → childIds (from relationship.union_id)
  const childrenOfUnion = new Map<string, Set<string>>();

  for (const r of relationships) {
    if (!childrenOf.has(r.parent_id)) childrenOf.set(r.parent_id, new Set());
    childrenOf.get(r.parent_id)!.add(r.child_id);
    if (!parentsOf.has(r.child_id)) parentsOf.set(r.child_id, new Set());
    parentsOf.get(r.child_id)!.add(r.parent_id);

    if (r.union_id) {
      if (!childrenOfUnion.has(r.union_id)) childrenOfUnion.set(r.union_id, new Set());
      childrenOfUnion.get(r.union_id)!.add(r.child_id);
    }
  }

  for (const u of unions) {
    if (!unionsOf.has(u.person1_id)) unionsOf.set(u.person1_id, []);
    unionsOf.get(u.person1_id)!.push(u);
    if (!unionsOf.has(u.person2_id)) unionsOf.set(u.person2_id, []);
    unionsOf.get(u.person2_id)!.push(u);
  }

  // Build FamilyUnits for a person (one per union + one for children without union)
  function getFamilyUnits(personId: string): FamilyUnit[] {
    const units: FamilyUnit[] = [];
    const personUnions = unionsOf.get(personId) || [];
    const allChildIds = childrenOf.get(personId) || new Set<string>();
    const assignedChildren = new Set<string>();

    for (const u of personUnions) {
      const partnerId = u.person1_id === personId ? u.person2_id : u.person1_id;
      const unionChildren = childrenOfUnion.get(u.id) || new Set<string>();

      // Also find children shared with this partner but not tagged to a union
      const partnerChildren = childrenOf.get(partnerId) || new Set<string>();
      const sharedChildren = new Set<string>();
      for (const cid of allChildIds) {
        if (unionChildren.has(cid) || partnerChildren.has(cid)) {
          sharedChildren.add(cid);
        }
      }

      const unitChildIds = Array.from(sharedChildren);
      unitChildIds.forEach(c => assignedChildren.add(c));

      units.push({
        id: u.id,
        partners: [personId, partnerId],
        childIds: unitChildIds,
      });
    }

    // Children not assigned to any union
    const unassigned = Array.from(allChildIds).filter(c => !assignedChildren.has(c));
    if (unassigned.length > 0 || (personUnions.length === 0 && allChildIds.size === 0)) {
      // Only create solo unit if person has no unions, or has unassigned children
      if (unassigned.length > 0) {
        units.push({
          id: `solo-${personId}`,
          partners: [personId],
          childIds: unassigned,
        });
      }
    }

    // If person has no unions and no children, still create a unit for them
    if (units.length === 0) {
      units.push({
        id: `solo-${personId}`,
        partners: [personId],
        childIds: [],
      });
    }

    return units;
  }

  // Get spouse IDs for a person
  function getSpouseIds(personId: string): string[] {
    const personUnions = unionsOf.get(personId) || [];
    return personUnions.map(u => u.person1_id === personId ? u.person2_id : u.person1_id);
  }

  // Get parent IDs for a person
  function getParentIds(personId: string): string[] {
    return Array.from(parentsOf.get(personId) || []);
  }

  // Get child IDs for a person
  function getChildIds(personId: string): string[] {
    return Array.from(childrenOf.get(personId) || []);
  }

  // Find connected components via BFS
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

        // Traverse relationships
        for (const cid of getChildIds(id)) if (!visited.has(cid)) queue.push(cid);
        for (const pid of getParentIds(id)) if (!visited.has(pid)) queue.push(pid);
        for (const sid of getSpouseIds(id)) if (!visited.has(sid)) queue.push(sid);
      }
      return component;
    };

    // Process root component first
    if (rootId && personMap.has(rootId)) {
      components.push(bfs(rootId));
    }

    // Process remaining components
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
    getFamilyUnits,
    getSpouseIds,
    getParentIds,
    getChildIds,
    findComponents,
  };
}

// ─── Layout engine (3-pass Walker-inspired) ─────────────────────────────────

interface LayoutEngine {
  positions: Map<string, LayoutNode>;
  connections: Connection[];
}

function layoutDescendant(
  rootId: string,
  graph: ReturnType<typeof buildFamilyGraph>,
  persons: FamilyPerson[],
  baseGeneration: number,
  xStart: number,
): LayoutEngine {
  const positions = new Map<string, LayoutNode>();
  const connections: Connection[] = [];
  const visited = new Set<string>();

  // Pass 1 & 2: measure + position (combined recursive)
  function measure(personId: string): number {
    if (visited.has(personId)) return 0;
    // Peek: don't mark visited yet for measurement
    const spouseIds = graph.getSpouseIds(personId).filter(s => !visited.has(s));
    const childIds = graph.getChildIds(personId).filter(c => !visited.has(c) && c !== personId);

    // Unit width (person + spouses)
    const unitWidth = CARD_WIDTH + spouseIds.length * (CARD_WIDTH + SPOUSE_GAP);

    // Children width
    // We need to temporarily mark visited to avoid infinite loops
    const tempVisited = new Set<string>();
    tempVisited.add(personId);
    spouseIds.forEach(s => tempVisited.add(s));

    let childrenWidth = 0;
    const uniqueChildren = [...new Set(childIds)];
    // Filter children that are also spouses (to avoid double counting)
    const actualChildren = uniqueChildren.filter(c => !tempVisited.has(c));

    if (actualChildren.length > 0) {
      for (const cid of actualChildren) {
        childrenWidth += measureDeep(cid, new Set([...visited, personId, ...spouseIds]));
      }
      childrenWidth += (actualChildren.length - 1) * H_GAP;
    }

    return Math.max(unitWidth, childrenWidth);
  }

  function measureDeep(personId: string, parentVisited: Set<string>): number {
    if (parentVisited.has(personId)) return CARD_WIDTH;
    const localVisited = new Set(parentVisited);
    localVisited.add(personId);

    const spouseIds = graph.getSpouseIds(personId).filter(s => !localVisited.has(s));
    spouseIds.forEach(s => localVisited.add(s));

    const unitWidth = CARD_WIDTH + spouseIds.length * (CARD_WIDTH + SPOUSE_GAP);

    const childIds = graph.getChildIds(personId).filter(c => !localVisited.has(c));
    let childrenWidth = 0;
    if (childIds.length > 0) {
      for (const cid of childIds) {
        childrenWidth += measureDeep(cid, localVisited);
      }
      childrenWidth += (childIds.length - 1) * H_GAP;
    }

    return Math.max(unitWidth, childrenWidth);
  }

  // Pass 3: position
  function position(personId: string, x: number, generation: number): number {
    if (visited.has(personId)) {
      return positions.get(personId) ? CARD_WIDTH : 0;
    }
    visited.add(personId);

    const spouseIds = graph.getSpouseIds(personId).filter(s => !visited.has(s));
    // Mark spouses visited before processing children
    spouseIds.forEach(s => visited.add(s));

    const childIds = graph.getChildIds(personId).filter(c => !visited.has(c));
    // Deduplicate: a child might appear from multiple parents
    const uniqueChildIds = [...new Set(childIds)];

    // Measure children width
    let childrenWidth = 0;
    const childWidths: number[] = [];
    for (const cid of uniqueChildIds) {
      const w = measureDeep(cid, new Set(visited));
      childWidths.push(w);
      childrenWidth += w;
    }
    if (uniqueChildIds.length > 1) {
      childrenWidth += (uniqueChildIds.length - 1) * H_GAP;
    }

    const unitWidth = CARD_WIDTH + spouseIds.length * (CARD_WIDTH + SPOUSE_GAP);
    const totalWidth = Math.max(unitWidth, childrenWidth);

    // Center the couple unit within totalWidth
    const unitX = x + (totalWidth - unitWidth) / 2;
    const y = generation * (CARD_HEIGHT + V_GAP);

    // Place person
    positions.set(personId, { personId, x: unitX, y, generation });

    // Place spouses
    let spouseX = unitX + CARD_WIDTH + SPOUSE_GAP;
    for (const sid of spouseIds) {
      positions.set(sid, { personId: sid, x: spouseX, y, generation });

      // Spouse connection
      connections.push({
        type: 'spouse',
        from: { x: unitX + CARD_WIDTH, y: y + CARD_HEIGHT / 2 },
        to: { x: spouseX, y: y + CARD_HEIGHT / 2 },
        fromPersonId: personId,
        toPersonId: sid,
      });
      spouseX += CARD_WIDTH + SPOUSE_GAP;
    }

    // Calculate union center for child connections
    let unionCenterX: number;
    if (spouseIds.length > 0) {
      const firstSpousePos = positions.get(spouseIds[0])!;
      unionCenterX = (unitX + CARD_WIDTH / 2 + firstSpousePos.x + CARD_WIDTH / 2) / 2;
    } else {
      unionCenterX = unitX + CARD_WIDTH / 2;
    }

    // Place children centered under union point
    if (uniqueChildIds.length > 0) {
      const childrenStartX = x + (totalWidth - childrenWidth) / 2;
      let cx = childrenStartX;

      for (let i = 0; i < uniqueChildIds.length; i++) {
        const cid = uniqueChildIds[i];
        const cw = position(cid, cx, generation + 1);
        const childPos = positions.get(cid);

        if (childPos) {
          connections.push({
            type: 'parent-child',
            from: { x: unionCenterX, y: y + CARD_HEIGHT },
            to: { x: childPos.x + CARD_WIDTH / 2, y: childPos.y },
            fromPersonId: personId,
            toPersonId: cid,
          });
        }

        cx += childWidths[i] + H_GAP;
      }
    }

    return totalWidth;
  }

  position(rootId, xStart, baseGeneration);
  return { positions, connections };
}

function layoutAscendant(
  rootId: string,
  graph: ReturnType<typeof buildFamilyGraph>,
  persons: FamilyPerson[],
  baseGeneration: number,
  xStart: number,
): LayoutEngine {
  const positions = new Map<string, LayoutNode>();
  const connections: Connection[] = [];
  const visited = new Set<string>();

  function measureUp(personId: string, localVisited: Set<string>): number {
    if (localVisited.has(personId)) return CARD_WIDTH;
    const lv = new Set(localVisited);
    lv.add(personId);

    const parentIds = graph.getParentIds(personId).filter(p => !lv.has(p));
    if (parentIds.length === 0) return CARD_WIDTH;

    // Parents are a couple unit
    let parentsWidth = 0;
    if (parentIds.length >= 2) {
      // Two parents form a unit; each may have their own ancestors
      const p1w = measureUp(parentIds[0], lv);
      lv.add(parentIds[0]);
      const p2w = measureUp(parentIds[1], lv);
      parentsWidth = p1w + SPOUSE_GAP + p2w;
    } else {
      parentsWidth = measureUp(parentIds[0], lv);
    }

    return Math.max(CARD_WIDTH, parentsWidth);
  }

  function positionUp(personId: string, x: number, generation: number): number {
    if (visited.has(personId)) return CARD_WIDTH;
    visited.add(personId);

    const parentIds = graph.getParentIds(personId).filter(p => !visited.has(p));

    // Measure parents to know total width
    let parentsWidth = 0;
    const parentWidths: number[] = [];
    const tempVisited = new Set(visited);

    for (const pid of parentIds) {
      const w = measureUp(pid, tempVisited);
      parentWidths.push(w);
      parentsWidth += w;
      tempVisited.add(pid);
    }
    if (parentIds.length > 1) {
      parentsWidth += SPOUSE_GAP;
    }

    const totalWidth = Math.max(CARD_WIDTH, parentsWidth);
    const personX = x + (totalWidth - CARD_WIDTH) / 2;
    const y = generation * (CARD_HEIGHT + V_GAP);

    positions.set(personId, { personId, x: personX, y, generation });

    // Position parents above
    if (parentIds.length > 0) {
      const parentsStartX = x + (totalWidth - parentsWidth) / 2;
      let px = parentsStartX;

      for (let i = 0; i < parentIds.length; i++) {
        const pid = parentIds[i];
        const pw = positionUp(pid, px, generation - 1);
        px += parentWidths[i] + SPOUSE_GAP;
      }

      // Spouse connection between parents
      if (parentIds.length >= 2) {
        const p1Pos = positions.get(parentIds[0]);
        const p2Pos = positions.get(parentIds[1]);
        if (p1Pos && p2Pos) {
          const left = p1Pos.x < p2Pos.x ? p1Pos : p2Pos;
          const right = p1Pos.x < p2Pos.x ? p2Pos : p1Pos;
          const leftId = p1Pos.x < p2Pos.x ? parentIds[0] : parentIds[1];
          const rightId = p1Pos.x < p2Pos.x ? parentIds[1] : parentIds[0];

          connections.push({
            type: 'spouse',
            from: { x: left.x + CARD_WIDTH, y: left.y + CARD_HEIGHT / 2 },
            to: { x: right.x, y: right.y + CARD_HEIGHT / 2 },
            fromPersonId: leftId,
            toPersonId: rightId,
          });

          // Parent-child connection from union center
          const unionCenterX = (left.x + CARD_WIDTH / 2 + right.x + CARD_WIDTH / 2) / 2;
          connections.push({
            type: 'parent-child',
            from: { x: unionCenterX, y: left.y + CARD_HEIGHT },
            to: { x: personX + CARD_WIDTH / 2, y },
            fromPersonId: leftId,
            toPersonId: personId,
          });
        }
      } else if (parentIds.length === 1) {
        const parentPos = positions.get(parentIds[0]);
        if (parentPos) {
          connections.push({
            type: 'parent-child',
            from: { x: parentPos.x + CARD_WIDTH / 2, y: parentPos.y + CARD_HEIGHT },
            to: { x: personX + CARD_WIDTH / 2, y },
            fromPersonId: parentIds[0],
            toPersonId: personId,
          });
        }
      }
    }

    return totalWidth;
  }

  positionUp(rootId, xStart, baseGeneration);
  return { positions, connections };
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
    const personMap = graph.personMap;

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

    for (let ci = 0; ci < components.length; ci++) {
      const component = components[ci];
      if (component.length === 0) continue;

      // Pick best root for this component
      const componentRoot = component.includes(rootPerson.id)
        ? rootPerson.id
        : component.reduce((best, id) => {
            const conns = graph.getChildIds(id).length + graph.getParentIds(id).length + graph.getSpouseIds(id).length;
            const bestConns = graph.getChildIds(best).length + graph.getParentIds(best).length + graph.getSpouseIds(best).length;
            return conns > bestConns ? id : best;
          }, component[0]);

      let engine: LayoutEngine;

      if (viewMode === 'descendant') {
        engine = layoutDescendant(componentRoot, graph, persons, 0, currentX);
        if (componentRoot === rootPerson.id) detectedRootGen = 0;
      } else if (viewMode === 'ascendant') {
        // Calculate max depth for ascendant
        const maxDepth = calculateMaxAscendantDepth(componentRoot, graph);
        engine = layoutAscendant(componentRoot, graph, persons, maxDepth, currentX);
        if (componentRoot === rootPerson.id) detectedRootGen = maxDepth;
      } else {
        // Hourglass: ascendant + descendant combined
        const maxDepth = calculateMaxAscendantDepth(componentRoot, graph);
        const ascEngine = layoutAscendant(componentRoot, graph, persons, maxDepth, currentX);
        
        // Get root position from ascendant layout
        const rootPos = ascEngine.positions.get(componentRoot);
        const rootX = rootPos ? rootPos.x : currentX;

        // Build descendant from root (skip root itself, it's already positioned)
        const descEngine = layoutDescendant(componentRoot, graph, persons, maxDepth, currentX);

        // Merge: use ascendant positions for ancestors, descendant for descendants
        // Ascendant takes priority for the root and ancestors
        engine = {
          positions: new Map([...descEngine.positions, ...ascEngine.positions]),
          connections: [...ascEngine.connections, ...descEngine.connections.filter(c => {
            // Remove duplicate connections
            return !ascEngine.connections.some(ac => 
              ac.fromPersonId === c.fromPersonId && ac.toPersonId === c.toPersonId
            );
          })],
        };

        if (componentRoot === rootPerson.id) detectedRootGen = maxDepth;
      }

      // Merge into allPositions
      for (const [id, pos] of engine.positions) {
        allPositions.set(id, pos);
      }
      allConnections.push(...engine.connections);

      // Calculate max X for next component offset
      let maxX = 0;
      for (const pos of engine.positions.values()) {
        maxX = Math.max(maxX, pos.x + CARD_WIDTH);
      }
      currentX = maxX + COMPONENT_GAP;
    }

    // Resolve overlaps (pass 3b)
    resolveOverlaps(allPositions);

    // Convert to PersonPosition array
    const positionsArray: PersonPosition[] = [];
    for (const [id, node] of allPositions) {
      const person = personMap.get(id);
      if (person) {
        positionsArray.push({
          person,
          x: node.x,
          y: node.y,
          generation: node.generation,
          spouses: graph.getSpouseIds(id)
            .map(sid => personMap.get(sid))
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

// ─── Overlap resolver ───────────────────────────────────────────────────────

function resolveOverlaps(positions: Map<string, LayoutNode>): void {
  // Group by generation (same y level)
  const byGeneration = new Map<number, LayoutNode[]>();
  for (const node of positions.values()) {
    if (!byGeneration.has(node.generation)) byGeneration.set(node.generation, []);
    byGeneration.get(node.generation)!.push(node);
  }

  // For each generation, sort by x and fix overlaps
  for (const [, nodes] of byGeneration) {
    nodes.sort((a, b) => a.x - b.x);

    for (let i = 1; i < nodes.length; i++) {
      const prev = nodes[i - 1];
      const curr = nodes[i];
      const minX = prev.x + CARD_WIDTH + SPOUSE_GAP;

      if (curr.x < minX) {
        const shift = minX - curr.x;
        // Shift this node and all nodes to its right
        for (let j = i; j < nodes.length; j++) {
          nodes[j].x += shift;
        }
      }
    }
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function calculateMaxAscendantDepth(
  personId: string,
  graph: ReturnType<typeof buildFamilyGraph>,
): number {
  const visited = new Set<string>();

  function depth(id: string): number {
    if (visited.has(id)) return 0;
    visited.add(id);
    const parentIds = graph.getParentIds(id);
    if (parentIds.length === 0) return 0;
    return 1 + Math.max(...parentIds.map(pid => depth(pid)));
  }

  return depth(personId);
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
        "w-full h-full rounded-xl p-2 flex items-center gap-2 transition-all duration-200",
        "border-2 bg-card shadow-md hover:shadow-lg",
        "hover:-translate-y-0.5",
        isSelected
          ? "border-secondary ring-2 ring-secondary/20 shadow-secondary/20"
          : "border-border hover:border-secondary/50",
        isHighlighted && "animate-highlight-pulse",
        !person.is_alive && "opacity-80"
      )}
    >
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

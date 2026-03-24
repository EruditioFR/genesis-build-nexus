import { memo as reactMemo, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  MiniMap,
  Controls,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  type NodeTypes,
  type EdgeTypes,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Handle, Position } from '@xyflow/react';
import type { FamilyPerson, ParentChildRelationship, FamilyUnion, TreeViewMode } from '@/types/familyTree';
import { PersonFlowNode, type PersonNodeData } from './nodes/PersonFlowNode';
import { MarriageEdge } from './edges/MarriageEdge';
import { ParentChildEdge } from './edges/ParentChildEdge';

// Layout constants
const CARD_WIDTH = 180;
const CARD_HEIGHT = 90;
const H_GAP = 50;
const V_GAP = 120;
const SPOUSE_GAP = 30;
const COMPONENT_GAP = 140;

export interface PersonPositionData {
  personId: string;
  x: number;
  y: number;
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

// ─── Lineage-based layout engine ────────────────────────────────────────────

interface LayoutNode {
  personId: string;
  x: number;
  y: number;
  generation: number;
}

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
): { positions: Map<string, LayoutNode>; rootGeneration: number } {
  const positions = new Map<string, LayoutNode>();

  const genOf = new Map<string, number>();
  const lineageOf = new Map<string, number>();
  const lineages: Lineage[] = [];

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

  lineages.push(buildLineageFrom(rootId, 0, 0));

  let discoveryChanged = true;
  while (discoveryChanged) {
    discoveryChanged = false;
    for (const lineage of lineages) {
      for (const memberId of lineage.members) {
        for (const spouseId of graph.getSpouseIds(memberId)) {
          if (genOf.has(spouseId)) continue;
          const spouseParents = graph.getParentIds(spouseId);
          if (spouseParents.length > 0) {
            const newIdx = lineages.length;
            lineages.push(buildLineageFrom(spouseId, genOf.get(memberId)!, newIdx));
            discoveryChanged = true;
          } else {
            genOf.set(spouseId, genOf.get(memberId)!);
            lineage.members.add(spouseId);
            lineageOf.set(spouseId, lineages.indexOf(lineage));
          }
        }
      }
    }
  }

  const rootGen = genOf.get(rootId) ?? 0;
  // Data is pre-filtered by viewMode upstream, so include all discovered persons
  const activeIds = new Set<string>();
  for (const [id] of genOf) {
    activeIds.add(id);
  }

  let minGen = Infinity;
  for (const id of activeIds) minGen = Math.min(minGen, genOf.get(id)!);
  if (!isFinite(minGen)) minGen = 0;
  const normGen = (id: string) => (genOf.get(id) ?? 0) - minGen;
  const normalizedRootGen = rootGen - minGen;

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

    positions.set(personId, { personId, x: unitX, y, generation: gen });

    let sx = unitX + CARD_WIDTH + SPOUSE_GAP;
    for (const sid of spouseIds) {
      positions.set(sid, { personId: sid, x: sx, y, generation: gen });
      sx += CARD_WIDTH + SPOUSE_GAP;
    }

    if (childIds.length > 0) {
      const childStartX = x + (totalWidth - childrenWidth) / 2;
      let cx = childStartX;
      for (let i = 0; i < childIds.length; i++) {
        placeInLineage(childIds[i], li, cx);
        cx += childWidths[i] + H_GAP;
      }
    }

    return totalWidth;
  }

  // Order lineages
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

  let currentX = 0;
  for (const li of lineageOrder) {
    const lineage = lineages[li];
    if (!lineage) continue;

    const rootAncs: string[] = [];
    for (const mid of lineage.members) {
      if (!activeIds.has(mid)) continue;
      const parentsInLineage = graph.getParentIds(mid).filter(
        p => activeIds.has(p) && lineage.members.has(p)
      );
      if (parentsInLineage.length === 0) {
        rootAncs.push(mid);
      }
    }

    rootAncs.sort((a, b) => normGen(a) - normGen(b));

    const rootAncsFiltered: string[] = [];
    const willBePlacedAsSpouse = new Set<string>();
    for (const ancId of rootAncs) {
      if (willBePlacedAsSpouse.has(ancId)) continue;
      rootAncsFiltered.push(ancId);
      for (const sid of graph.getSpouseIds(ancId)) {
        if (lineageOf.get(sid) === li && rootAncs.includes(sid)) {
          willBePlacedAsSpouse.add(sid);
        }
      }
    }

    for (const rootAncId of rootAncsFiltered) {
      if (placed.has(rootAncId)) continue;
      const w = placeInLineage(rootAncId, li, currentX);
      if (w > 0) currentX += w + COMPONENT_GAP;
    }
  }

  // Resolve overlaps
  resolveOverlaps(positions);

  return { positions, rootGeneration: normalizedRootGen };
}

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

// ─── Pre-filter persons by viewMode ─────────────────────────────────────────

function filterByViewMode(
  persons: FamilyPerson[],
  relationships: ParentChildRelationship[],
  unions: FamilyUnion[],
  rootPersonId: string | undefined,
  viewMode: TreeViewMode,
): { persons: FamilyPerson[]; relationships: ParentChildRelationship[]; unions: FamilyUnion[] } {
  if (viewMode === 'hourglass' || persons.length === 0) {
    return { persons, relationships, unions };
  }

  const personMap = new Map(persons.map(p => [p.id, p]));
  const rootId = rootPersonId && personMap.has(rootPersonId) ? rootPersonId : persons[0]?.id;
  if (!rootId) return { persons, relationships, unions };

  // Build adjacency
  const childrenOf = new Map<string, Set<string>>();
  const parentsOf = new Map<string, Set<string>>();
  const spousesOf = new Map<string, Set<string>>();

  for (const r of relationships) {
    if (!childrenOf.has(r.parent_id)) childrenOf.set(r.parent_id, new Set());
    childrenOf.get(r.parent_id)!.add(r.child_id);
    if (!parentsOf.has(r.child_id)) parentsOf.set(r.child_id, new Set());
    parentsOf.get(r.child_id)!.add(r.parent_id);
  }
  for (const u of unions) {
    if (!spousesOf.has(u.person1_id)) spousesOf.set(u.person1_id, new Set());
    spousesOf.get(u.person1_id)!.add(u.person2_id);
    if (!spousesOf.has(u.person2_id)) spousesOf.set(u.person2_id, new Set());
    spousesOf.get(u.person2_id)!.add(u.person1_id);
  }

  const activeIds = new Set<string>();
  const queue = [rootId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    activeIds.add(currentId);

    // Add spouses
    for (const sid of spousesOf.get(currentId) || []) {
      activeIds.add(sid);
    }

    if (viewMode === 'ascendant') {
      // Traverse parents
      for (const pid of parentsOf.get(currentId) || []) {
        if (!visited.has(pid)) queue.push(pid);
      }
    } else {
      // Traverse children
      for (const cid of childrenOf.get(currentId) || []) {
        if (!visited.has(cid)) queue.push(cid);
      }
    }
  }

  const filteredPersons = persons.filter(p => activeIds.has(p.id));
  const filteredRels = relationships.filter(r => activeIds.has(r.parent_id) && activeIds.has(r.child_id));
  const filteredUnions = unions.filter(u => activeIds.has(u.person1_id) && activeIds.has(u.person2_id));

  return { persons: filteredPersons, relationships: filteredRels, unions: filteredUnions };
}

// ─── Convert layout to React Flow nodes & edges ─────────────────────────────

function buildFlowElements(
  persons: FamilyPerson[],
  relationships: ParentChildRelationship[],
  unions: FamilyUnion[],
  rootPersonId: string | undefined,
  viewMode: TreeViewMode,
  selectedPersonId: string | undefined,
  highlightedPersonId: string | undefined,
  activeBranchIds: Set<string> | undefined,
  rootGeneration: number,
): { nodes: Node<PersonNodeData>[]; edges: Edge[]; positionData: PersonPositionData[] } {
  if (persons.length === 0) {
    return { nodes: [], edges: [], positionData: [] };
  }

  const graph = buildFamilyGraph(persons, relationships, unions);
  const rootPerson = rootPersonId
    ? persons.find(p => p.id === rootPersonId) || persons[0]
    : persons[0];

  const components = graph.findComponents(rootPerson.id);
  const allPositions = new Map<string, LayoutNode>();
  let currentX = 0;
  let detectedRootGen = 0;

  for (const component of components) {
    if (component.length === 0) continue;
    const componentRoot = component.includes(rootPerson.id) ? rootPerson.id : component[0];
    const result = layoutUnified(componentRoot, graph, persons, relationships, unions, viewMode);

    for (const [id, pos] of result.positions) {
      allPositions.set(id, { ...pos, x: pos.x + currentX });
    }

    if (componentRoot === rootPerson.id) {
      detectedRootGen = result.rootGeneration;
    }

    let maxX = 0;
    for (const pos of result.positions.values()) {
      maxX = Math.max(maxX, pos.x + CARD_WIDTH);
    }
    currentX += maxX + COMPONENT_GAP;
  }

  // Safety net for unpositioned persons
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

  // Build React Flow nodes
  const nodes: Node<PersonNodeData>[] = [];
  const positionData: PersonPositionData[] = [];

  for (const [id, pos] of allPositions) {
    const person = graph.personMap.get(id);
    if (!person) continue;

    const isDimmed = !!activeBranchIds && !activeBranchIds.has(id);
    const genDiff = pos.generation - (rootGeneration ?? detectedRootGen);

    nodes.push({
      id,
      type: 'person',
      position: { x: pos.x, y: pos.y },
      data: {
        person,
        isSelected: selectedPersonId === id,
        isHighlighted: highlightedPersonId === id,
        isRoot: rootPersonId === id,
        isDimmed,
        generation: pos.generation,
        generationLabel: getGenerationLabel(genDiff),
      },
      style: { width: CARD_WIDTH, height: CARD_HEIGHT },
    });

    positionData.push({ personId: id, x: pos.x, y: pos.y });
  }

  // Build edges
  const edges: Edge[] = [];

  // Spouse edges + union junction nodes
  const spouseKeys = new Set<string>();
  const unionJunctionMap = new Map<string, string>(); // "p1|p2" sorted key -> junction node id

  for (const u of unions) {
    const pos1 = allPositions.get(u.person1_id);
    const pos2 = allPositions.get(u.person2_id);
    if (!pos1 || !pos2) continue;
    const key = [u.person1_id, u.person2_id].sort().join('|');
    if (spouseKeys.has(key)) continue;
    spouseKeys.add(key);

    const left = pos1.x < pos2.x ? u.person1_id : u.person2_id;
    const right = pos1.x < pos2.x ? u.person2_id : u.person1_id;
    const leftPos = pos1.x < pos2.x ? pos1 : pos2;
    const rightPos = pos1.x < pos2.x ? pos2 : pos1;

    const isActive = !activeBranchIds || (activeBranchIds.has(u.person1_id) && activeBranchIds.has(u.person2_id));

    edges.push({
      id: `marriage-${key}`,
      source: left,
      target: right,
      type: 'marriage',
      sourceHandle: 'right',
      targetHandle: 'left',
      data: { unionType: u.union_type, isActive },
      style: { opacity: isActive ? 1 : 0.15 },
    });

    // Create invisible junction node at midpoint between the couple, at bottom of cards
    const junctionId = `union-junction-${key}`;
    const junctionX = (leftPos.x + CARD_WIDTH + rightPos.x) / 2;
    const junctionY = leftPos.y + CARD_HEIGHT;

    nodes.push({
      id: junctionId,
      type: 'unionJunction',
      position: { x: junctionX - 1, y: junctionY },
      data: {} as PersonNodeData,
      style: { width: 2, height: 2, opacity: 0, pointerEvents: 'none' },
      selectable: false,
      draggable: false,
    });

    unionJunctionMap.set(key, junctionId);
  }

  // Parent-child edges - route through union junction when possible
  const childrenConnected = new Set<string>();
  for (const r of relationships) {
    if (!allPositions.has(r.parent_id) || !allPositions.has(r.child_id)) continue;
    if (childrenConnected.has(r.child_id)) continue;

    const isActive = !activeBranchIds || (activeBranchIds.has(r.parent_id) && activeBranchIds.has(r.child_id));

    // Find co-parent to use the union junction
    const otherParents = graph.getParentIds(r.child_id).filter(p => p !== r.parent_id && allPositions.has(p));
    let sourceId = r.parent_id;
    let sourceHandle = 'bottom';

    if (otherParents.length > 0) {
      const coParentId = otherParents[0];
      const junctionKey = [r.parent_id, coParentId].sort().join('|');
      const junctionId = unionJunctionMap.get(junctionKey);
      if (junctionId) {
        sourceId = junctionId;
        sourceHandle = 'bottom';
      }
    }

    edges.push({
      id: `parent-child-${r.parent_id}-${r.child_id}`,
      source: sourceId,
      target: r.child_id,
      type: 'parentChild',
      sourceHandle,
      targetHandle: 'top',
      data: { relationshipType: r.relationship_type, isActive },
      style: { opacity: isActive ? 1 : 0.15 },
    });
    childrenConnected.add(r.child_id);
  }

  return { nodes, edges, positionData };
}

function getGenerationLabel(diff: number): string {
  if (diff === 0) return 'Vous';
  if (diff === 1) return 'Enfants';
  if (diff === -1) return 'Parents';
  if (diff === 2) return 'Petits-enfants';
  if (diff === -2) return 'Grands-parents';
  if (diff === 3) return 'Arr.-petits-enfants';
  if (diff === -3) return 'Arr.-grands-parents';
  if (diff > 0) return `Gén. +${diff}`;
  return `Gén. ${diff}`;
}

// Invisible junction node for union midpoints
const UnionJunctionNode = reactMemo(() => (
  <div style={{ width: 2, height: 2 }}>
    <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0, pointerEvents: 'none' }} />
  </div>
));
UnionJunctionNode.displayName = 'UnionJunctionNode';

// ─── Custom node types ──────────────────────────────────────────────────────

const nodeTypes: NodeTypes = {
  person: PersonFlowNode,
  unionJunction: UnionJunctionNode,
};

const edgeTypes: EdgeTypes = {
  marriage: MarriageEdge,
  parentChild: ParentChildEdge,
};

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
  showMinimap?: boolean;
  onCenterOnPerson?: string | null;
}

function TreeVisualizationInner({
  persons,
  relationships,
  unions,
  rootPersonId,
  viewMode,
  selectedPersonId,
  highlightedPersonId,
  activeBranchIds,
  onPersonClick,
  onPositionsCalculated,
  showMinimap = true,
  onCenterOnPerson,
}: TreeVisualizationProps) {
  const { fitView, setCenter } = useReactFlow();
  const lastPositionsRef = useRef<string>('');

  const filtered = useMemo(() => filterByViewMode(persons, relationships, unions, rootPersonId, viewMode), [persons, relationships, unions, rootPersonId, viewMode]);

  const { nodes, edges, positionData } = useMemo(() => {
    return buildFlowElements(
      filtered.persons,
      filtered.relationships,
      filtered.unions,
      rootPersonId,
      viewMode,
      selectedPersonId,
      highlightedPersonId,
      activeBranchIds,
      0,
    );
  }, [filtered, rootPersonId, viewMode, selectedPersonId, highlightedPersonId, activeBranchIds]);

  // Report positions
  useEffect(() => {
    if (onPositionsCalculated && positionData.length > 0) {
      const key = positionData.map(p => `${p.personId}:${p.x}:${p.y}`).join(',');
      if (key !== lastPositionsRef.current) {
        lastPositionsRef.current = key;
        onPositionsCalculated(positionData);
      }
    }
  }, [positionData, onPositionsCalculated]);

  // Center on root person on initial load
  const hasInitialFit = useRef(false);
  useEffect(() => {
    if (nodes.length > 0 && !hasInitialFit.current) {
      hasInitialFit.current = true;
      const rootNode = rootPersonId ? nodes.find(n => n.id === rootPersonId) : nodes[0];
      if (rootNode) {
        setTimeout(() => {
          setCenter(
            rootNode.position.x + CARD_WIDTH / 2,
            rootNode.position.y + CARD_HEIGHT / 2,
            { zoom: 1.2, duration: 800 }
          );
        }, 150);
      } else {
        setTimeout(() => fitView({ padding: 0.2, duration: 500 }), 100);
      }
    }
  }, [nodes.length, fitView, setCenter, rootPersonId, nodes]);

  // Center on person when requested
  useEffect(() => {
    if (onCenterOnPerson && nodes.length > 0) {
      const node = nodes.find(n => n.id === onCenterOnPerson);
      if (node) {
        setCenter(
          node.position.x + CARD_WIDTH / 2,
          node.position.y + CARD_HEIGHT / 2,
          { zoom: 1, duration: 600 }
        );
      }
    }
  }, [onCenterOnPerson, nodes, setCenter]);

  const onNodeClick: NodeMouseHandler<Node<PersonNodeData>> = useCallback((_event, node) => {
    onPersonClick(node.data.person);
  }, [onPersonClick]);

  const minimapNodeColor = useCallback((node: Node<PersonNodeData>) => {
    if (node.data.isSelected) return 'hsl(var(--secondary))';
    if (node.data.person.gender === 'male') return 'hsl(210, 70%, 60%)';
    if (node.data.person.gender === 'female') return 'hsl(330, 70%, 60%)';
    return 'hsl(var(--muted-foreground))';
  }, []);

  return (
    <div className="absolute inset-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
        className="bg-[hsl(var(--tree-bg))]"
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={0.8} color="hsl(30 20% 80% / 0.5)" />
        <Controls
          showInteractive={false}
          className="!bg-card !border !border-border !rounded-xl !shadow-lg [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted"
        />
        {showMinimap && (
          <MiniMap
            nodeColor={minimapNodeColor}
            nodeStrokeWidth={0}
            maskColor="hsl(var(--background) / 0.7)"
            className="!bg-card/95 !border !border-border !rounded-lg !shadow-lg"
            pannable
            zoomable
          />
        )}
      </ReactFlow>
    </div>
  );
}

export function TreeVisualization(props: TreeVisualizationProps) {
  return (
    <ReactFlowProvider>
      <TreeVisualizationInner {...props} />
    </ReactFlowProvider>
  );
}

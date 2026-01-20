import { useMemo, useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FamilyPerson, ParentChildRelationship, FamilyUnion, TreeViewMode } from '@/types/familyTree';

// Constants for layout
const CARD_WIDTH = 160;
const CARD_HEIGHT = 80;
const HORIZONTAL_GAP = 40;
const VERTICAL_GAP = 100;
const SPOUSE_GAP = 20;

interface PersonPosition {
  person: FamilyPerson;
  x: number;
  y: number;
  generation: number;
  spouses: FamilyPerson[];
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

interface TreeVisualizationProps {
  persons: FamilyPerson[];
  relationships: ParentChildRelationship[];
  unions: FamilyUnion[];
  rootPersonId?: string;
  viewMode: TreeViewMode;
  selectedPersonId?: string;
  highlightedPersonId?: string;
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
  onPersonClick,
  onAddPerson,
  onPositionsCalculated,
}: TreeVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Helper functions
  const getPersonChildren = (personId: string): FamilyPerson[] => {
    const childIds = relationships.filter(r => r.parent_id === personId).map(r => r.child_id);
    return persons.filter(p => childIds.includes(p.id));
  };

  const getPersonParents = (personId: string): FamilyPerson[] => {
    const parentIds = relationships.filter(r => r.child_id === personId).map(r => r.parent_id);
    return persons.filter(p => parentIds.includes(p.id));
  };

  const getPersonSpouses = (personId: string): FamilyPerson[] => {
    const spouseIds = unions
      .filter(u => u.person1_id === personId || u.person2_id === personId)
      .map(u => u.person1_id === personId ? u.person2_id : u.person1_id);
    return persons.filter(p => spouseIds.includes(p.id));
  };

  // Calculate positions for all persons
  const { positions, connections, bounds } = useMemo(() => {
    const positionsMap = new Map<string, PersonPosition>();
    const allConnections: Connection[] = [];
    const visitedDescendants = new Set<string>();
    const visitedAscendants = new Set<string>();

    // Find root person
    const rootPerson = rootPersonId
      ? persons.find(p => p.id === rootPersonId)
      : persons[0];

    if (!rootPerson) {
      return { positions: [], connections: [], bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 } };
    }

    // Build descendants tree (generation increases downward)
    const buildDescendantsTree = (
      person: FamilyPerson,
      generation: number,
      xOffset: number
    ): { width: number; centerX: number } => {
      if (visitedDescendants.has(person.id)) {
        const existing = positionsMap.get(person.id);
        return { width: CARD_WIDTH, centerX: existing?.x || xOffset };
      }
      visitedDescendants.add(person.id);

      const spouses = getPersonSpouses(person.id);
      const children = getPersonChildren(person.id);
      
      // Filter spouses that will actually be positioned (not already placed)
      const spousesToPosition = spouses.filter(spouse => !visitedDescendants.has(spouse.id));
      
      // Calculate width needed for children
      let childrenTotalWidth = 0;
      const childPositions: { centerX: number; width: number }[] = [];

      if (children.length > 0) {
        let currentX = xOffset;
        for (const child of children) {
          const childResult = buildDescendantsTree(child, generation + 1, currentX);
          childPositions.push(childResult);
          childrenTotalWidth += childResult.width;
          currentX += childResult.width + HORIZONTAL_GAP;
        }
        childrenTotalWidth += (children.length - 1) * HORIZONTAL_GAP;
      }

      // Calculate unit width (person + spouses that will be positioned)
      const unitWidth = CARD_WIDTH + spousesToPosition.length * (CARD_WIDTH + SPOUSE_GAP);

      // Final width is max of unit width and children width
      const totalWidth = Math.max(unitWidth, childrenTotalWidth);

      // Center X for this person
      const centerX = xOffset + totalWidth / 2 - unitWidth / 2;

      // Store position
      positionsMap.set(person.id, {
        person,
        x: centerX,
        y: generation * (CARD_HEIGHT + VERTICAL_GAP),
        generation,
        spouses,
      });

      // Position spouses and calculate union center point
      let spouseX = centerX + CARD_WIDTH + SPOUSE_GAP;
      let unionCenterX = centerX + CARD_WIDTH / 2; // Default: center of person
      let firstSpousePositioned = false;
      
      // Use spousesToPosition already calculated above
      
      for (const spouse of spousesToPosition) {
        positionsMap.set(spouse.id, {
          person: spouse,
          x: spouseX,
          y: generation * (CARD_HEIGHT + VERTICAL_GAP),
          generation,
          spouses: [],
        });

        // Spouse connection
        allConnections.push({
          type: 'spouse',
          from: { x: centerX + CARD_WIDTH, y: generation * (CARD_HEIGHT + VERTICAL_GAP) + CARD_HEIGHT / 2 },
          to: { x: spouseX, y: generation * (CARD_HEIGHT + VERTICAL_GAP) + CARD_HEIGHT / 2 },
          fromPersonId: person.id,
          toPersonId: spouse.id,
        });
        
        // Calculate union center (midpoint between centers of person and first spouse cards)
        if (!firstSpousePositioned) {
          const personCenterX = centerX + CARD_WIDTH / 2;
          const spouseCenterX = spouseX + CARD_WIDTH / 2;
          unionCenterX = (personCenterX + spouseCenterX) / 2;
          firstSpousePositioned = true;
        }
        
        spouseX += CARD_WIDTH + SPOUSE_GAP;
      }
      
      // If spouse already positioned, still calculate union center for child connections
      if (!firstSpousePositioned && spouses.length > 0) {
        const existingSpousePos = positionsMap.get(spouses[0].id);
        if (existingSpousePos) {
          const personCenterX = centerX + CARD_WIDTH / 2;
          const spouseCenterX = existingSpousePos.x + CARD_WIDTH / 2;
          unionCenterX = (personCenterX + spouseCenterX) / 2;
        }
      }

      // Update child positions to be centered under union point (between both parents)
      if (children.length > 0) {
        const childrenSpan = childPositions.reduce((sum, cp) => sum + cp.width, 0) + (children.length - 1) * HORIZONTAL_GAP;
        const childrenStartX = unionCenterX - childrenSpan / 2;

        let currentChildX = childrenStartX;
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          const childPos = positionsMap.get(child.id);
          if (childPos) {
            const shiftX = currentChildX - (childPos.x - CARD_WIDTH / 2);
            // Shift this child and all its descendants
            const shiftDescendants = (id: string, shift: number) => {
              const pos = positionsMap.get(id);
              if (pos) {
                pos.x += shift;
                for (const c of getPersonChildren(id)) {
                  shiftDescendants(c.id, shift);
                }
              }
            };
            shiftDescendants(child.id, shiftX);
          }
          currentChildX += childPositions[i].width + HORIZONTAL_GAP;

          // Parent-child connection: connect to union point (between both parents)
          const childPosition = positionsMap.get(child.id);
          if (childPosition) {
            allConnections.push({
              type: 'parent-child',
              from: { x: unionCenterX, y: generation * (CARD_HEIGHT + VERTICAL_GAP) + CARD_HEIGHT },
              to: { x: childPosition.x + CARD_WIDTH / 2, y: childPosition.y },
              fromPersonId: person.id,
              toPersonId: child.id,
            });
          }
        }
      }

      return { width: totalWidth, centerX };
    };

    // Build ascendants tree (generation decreases upward)
    const buildAscendantsTree = (
      person: FamilyPerson,
      generation: number,
      xOffset: number
    ): { width: number; centerX: number } => {
      if (visitedAscendants.has(person.id)) {
        const existing = positionsMap.get(person.id);
        return { width: CARD_WIDTH, centerX: existing?.x || xOffset };
      }
      visitedAscendants.add(person.id);

      const parents = getPersonParents(person.id);
      
      let parentsWidth = 0;
      if (parents.length > 0) {
        let currentX = xOffset;
        for (const parent of parents) {
          const parentResult = buildAscendantsTree(parent, generation - 1, currentX);
          parentsWidth += parentResult.width;
          currentX += parentResult.width + HORIZONTAL_GAP;
        }
        parentsWidth += (parents.length - 1) * HORIZONTAL_GAP;
      }

      const totalWidth = Math.max(CARD_WIDTH, parentsWidth);
      const centerX = xOffset + totalWidth / 2 - CARD_WIDTH / 2;

      // Update or set position
      const existingPos = positionsMap.get(person.id);
      if (!existingPos) {
        const spouses = getPersonSpouses(person.id);
        positionsMap.set(person.id, {
          person,
          x: centerX,
          y: generation * (CARD_HEIGHT + VERTICAL_GAP),
          generation,
          spouses,
        });
      }

      // Create spouse connection between parents if both exist
      if (parents.length >= 2) {
        const parent1Pos = positionsMap.get(parents[0].id);
        const parent2Pos = positionsMap.get(parents[1].id);
        
        if (parent1Pos && parent2Pos) {
          // Check if spouse connection doesn't already exist
          const spouseConnectionExists = allConnections.some(
            conn => conn.type === 'spouse' && 
            ((conn.fromPersonId === parents[0].id && conn.toPersonId === parents[1].id) ||
             (conn.fromPersonId === parents[1].id && conn.toPersonId === parents[0].id))
          );
          
          if (!spouseConnectionExists) {
            // Determine which parent is on the left
            const leftParent = parent1Pos.x < parent2Pos.x ? parent1Pos : parent2Pos;
            const rightParent = parent1Pos.x < parent2Pos.x ? parent2Pos : parent1Pos;
            const leftParentId = parent1Pos.x < parent2Pos.x ? parents[0].id : parents[1].id;
            const rightParentId = parent1Pos.x < parent2Pos.x ? parents[1].id : parents[0].id;
            
            allConnections.push({
              type: 'spouse',
              from: { x: leftParent.x + CARD_WIDTH, y: leftParent.y + CARD_HEIGHT / 2 },
              to: { x: rightParent.x, y: rightParent.y + CARD_HEIGHT / 2 },
              fromPersonId: leftParentId,
              toPersonId: rightParentId,
            });
          }
        }
      }

      // Create connection to parents - connect to union point if both parents exist
      if (parents.length >= 2) {
        const parent1Pos = positionsMap.get(parents[0].id);
        const parent2Pos = positionsMap.get(parents[1].id);
        const personPos = positionsMap.get(person.id);
        
        if (parent1Pos && parent2Pos && personPos) {
          // Calculate union center point (midpoint between centers of both parent cards)
          const parent1CenterX = parent1Pos.x + CARD_WIDTH / 2;
          const parent2CenterX = parent2Pos.x + CARD_WIDTH / 2;
          const unionCenterX = (parent1CenterX + parent2CenterX) / 2;
          
          allConnections.push({
            type: 'parent-child',
            from: { x: unionCenterX, y: parent1Pos.y + CARD_HEIGHT },
            to: { x: personPos.x + CARD_WIDTH / 2, y: personPos.y },
            fromPersonId: parents[0].id,
            toPersonId: person.id,
          });
        }
      } else if (parents.length === 1) {
        // Single parent case
        const parentPos = positionsMap.get(parents[0].id);
        const personPos = positionsMap.get(person.id);
        if (parentPos && personPos) {
          allConnections.push({
            type: 'parent-child',
            from: { x: parentPos.x + CARD_WIDTH / 2, y: parentPos.y + CARD_HEIGHT },
            to: { x: personPos.x + CARD_WIDTH / 2, y: personPos.y },
            fromPersonId: parents[0].id,
            toPersonId: person.id,
          });
        }
      }

      return { width: totalWidth, centerX };
    };

    // Build tree based on view mode
    if (viewMode === 'descendant') {
      buildDescendantsTree(rootPerson, 0, 0);
    } else if (viewMode === 'ascendant') {
      buildAscendantsTree(rootPerson, 3, 0); // Start at generation 3 to have room for ancestors above
    } else {
      // Hourglass: both directions
      buildAscendantsTree(rootPerson, 3, 0);
      visitedDescendants.add(rootPerson.id); // Mark root as visited for descendants
      buildDescendantsTree(rootPerson, 3, positionsMap.get(rootPerson.id)?.x || 0);
    }

    // Calculate bounds
    const positionsArray = Array.from(positionsMap.values());
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
      bounds: { minX: minX || 0, maxX: maxX || 800, minY: minY || 0, maxY: maxY || 600 },
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

  // Calculate offset to center the tree
  const offsetX = 50 - bounds.minX;
  const offsetY = 50 - bounds.minY;

  // Report positions with offset applied
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
      {/* SVG Layer for connections */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={dimensions.width}
        height={dimensions.height}
      >
        <defs>
          {/* Gradient for connections */}
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.3" />
          </linearGradient>
          
          {/* Heart symbol for spouse connections */}
          <symbol id="heartSymbol" viewBox="0 0 24 24" width="12" height="12">
            <path
              fill="hsl(var(--accent))"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </symbol>
        </defs>

        {/* Render connections */}
        {connections.map((conn, index) => {
          const fromX = conn.from.x + offsetX;
          const fromY = conn.from.y + offsetY;
          const toX = conn.to.x + offsetX;
          const toY = conn.to.y + offsetY;

          if (conn.type === 'spouse') {
            // Horizontal line with heart in the middle
            const midX = (fromX + toX) / 2;
            const midY = fromY;
            return (
              <g key={`conn-${index}`}>
                <motion.line
                  x1={fromX}
                  y1={fromY}
                  x2={toX}
                  y2={toY}
                  stroke="hsl(var(--accent))"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                />
                <use href="#heartSymbol" x={midX - 6} y={midY - 6} />
              </g>
            );
          } else {
            // Parent-child: curved path
            const midY = (fromY + toY) / 2;
            const path = `M ${fromX} ${fromY} 
                          L ${fromX} ${midY - 10}
                          Q ${fromX} ${midY}, ${(fromX + toX) / 2} ${midY}
                          Q ${toX} ${midY}, ${toX} ${midY + 10}
                          L ${toX} ${toY}`;
            
            return (
              <motion.path
                key={`conn-${index}`}
                d={path}
                fill="none"
                stroke="url(#connectionGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.03 }}
              />
            );
          }
        })}
      </svg>

      {/* Person Cards Layer */}
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
            delay: index * 0.05,
            ease: [0.23, 1, 0.32, 1]
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
        viewMode={viewMode}
      />
    </div>
  );
}

// Person Card Component
interface TreePersonCardProps {
  person: FamilyPerson;
  isSelected: boolean;
  isHighlighted?: boolean;
  onClick: () => void;
  generation: number;
}

function TreePersonCard({ person, isSelected, isHighlighted, onClick, generation }: TreePersonCardProps) {
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

// Generation Labels Component
interface GenerationLabelsProps {
  positions: PersonPosition[];
  offsetX: number;
  offsetY: number;
  viewMode: TreeViewMode;
}

function GenerationLabels({ positions, offsetX, offsetY, viewMode }: GenerationLabelsProps) {
  const generations = useMemo(() => {
    const genMap = new Map<number, number>();
    for (const pos of positions) {
      if (!genMap.has(pos.generation)) {
        genMap.set(pos.generation, pos.y);
      }
    }
    return Array.from(genMap.entries()).sort((a, b) => a[0] - b[0]);
  }, [positions]);

  const getGenerationLabel = (gen: number, baseGen: number) => {
    const diff = gen - baseGen;
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

  // Find the base generation (where the root person is)
  const baseGeneration = viewMode === 'descendant' ? 0 : 3;

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
            {getGenerationLabel(gen, baseGeneration)}
          </Badge>
        </div>
      ))}
    </>
  );
}

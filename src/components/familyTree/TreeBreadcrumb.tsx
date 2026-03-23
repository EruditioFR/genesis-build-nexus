import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FamilyPerson, ParentChildRelationship } from '@/types/familyTree';

interface TreeBreadcrumbProps {
  selectedPerson: FamilyPerson;
  rootPersonId?: string;
  persons: FamilyPerson[];
  relationships: ParentChildRelationship[];
  onPersonClick: (person: FamilyPerson) => void;
}

export function TreeBreadcrumb({
  selectedPerson,
  rootPersonId,
  persons,
  relationships,
  onPersonClick,
}: TreeBreadcrumbProps) {
  const { t } = useTranslation('familyTree');

  const path = useMemo(() => {
    if (!rootPersonId) return [selectedPerson];

    const personMap = new Map(persons.map(p => [p.id, p]));
    const parentsOf = new Map<string, string[]>();
    for (const r of relationships) {
      if (!parentsOf.has(r.child_id)) parentsOf.set(r.child_id, []);
      parentsOf.get(r.child_id)!.push(r.parent_id);
    }

    // BFS from root to selectedPerson
    const visited = new Set<string>();
    const parentTrace = new Map<string, string | null>();
    const queue = [rootPersonId];
    visited.add(rootPersonId);
    parentTrace.set(rootPersonId, null);

    // Build child→parent graph for BFS from root downward
    const childrenOf = new Map<string, string[]>();
    for (const r of relationships) {
      if (!childrenOf.has(r.parent_id)) childrenOf.set(r.parent_id, []);
      childrenOf.get(r.parent_id)!.push(r.child_id);
    }

    // Also traverse spouse connections for broader reach
    let found = rootPersonId === selectedPerson.id;

    while (queue.length > 0 && !found) {
      const current = queue.shift()!;
      const children = childrenOf.get(current) || [];
      for (const childId of children) {
        if (!visited.has(childId)) {
          visited.add(childId);
          parentTrace.set(childId, current);
          queue.push(childId);
          if (childId === selectedPerson.id) {
            found = true;
            break;
          }
        }
      }
    }

    if (!found) {
      // Try reverse: go up from selected to root
      const upPath: FamilyPerson[] = [];
      const upVisited = new Set<string>();
      let current: string | undefined = selectedPerson.id;

      while (current && !upVisited.has(current)) {
        upVisited.add(current);
        const person = personMap.get(current);
        if (person) upPath.unshift(person);
        if (current === rootPersonId) break;
        const parents = parentsOf.get(current) || [];
        current = parents[0]; // Follow first parent
      }

      if (upPath.length > 0 && upPath[0].id === rootPersonId) {
        return upPath;
      }
      return [selectedPerson];
    }

    // Reconstruct path from root to selected
    const result: FamilyPerson[] = [];
    let traceId: string | null = selectedPerson.id;
    while (traceId !== null) {
      const p = personMap.get(traceId);
      if (p) result.unshift(p);
      traceId = parentTrace.get(traceId) ?? null;
    }

    return result;
  }, [selectedPerson, rootPersonId, persons, relationships]);

  if (path.length <= 1) return null;

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-card/80 backdrop-blur-sm border-b overflow-x-auto">
      {path.map((person, index) => (
        <div key={person.id} className="flex items-center gap-1 shrink-0">
          {index > 0 && (
            <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
          )}
          <button
            onClick={() => onPersonClick(person)}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors",
              "hover:bg-muted",
              person.id === selectedPerson.id
                ? "bg-secondary/10 text-secondary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {index === 0 && person.id === rootPersonId && (
              <Home className="w-3 h-3" />
            )}
            <span className="truncate max-w-[120px]">
              {person.first_names} {person.last_name}
            </span>
            {person.id === selectedPerson.id && (
              <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5">
                {t('breadcrumb.here')}
              </Badge>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}

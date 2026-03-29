// Family Tree Data Validation Engine
// Checks temporal, biological, structural and data quality issues

import type { FamilyPerson, ParentChildRelationship, FamilyUnion } from '@/types/familyTree';

export type ValidationSeverity = 'error' | 'warning' | 'info';
export type ValidationCategory = 'temporal' | 'biological' | 'data_quality' | 'structural';

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  category: ValidationCategory;
  personId?: string;
  personName?: string;
  relatedPersonId?: string;
  relatedPersonName?: string;
  message: string;
  detail?: string;
}

function personName(p: FamilyPerson): string {
  return `${p.first_names} ${p.last_name}`.trim() || '(inconnu)';
}

function parseDate(d?: string | null): Date | null {
  if (!d) return null;
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function yearsBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
}

function daysBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000);
}

export function validateFamilyTree(
  persons: FamilyPerson[],
  relationships: ParentChildRelationship[],
  unions: FamilyUnion[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  let issueIdx = 0;
  const nextId = () => `v-${issueIdx++}`;

  const personMap = new Map(persons.map(p => [p.id, p]));

  // Index: parent -> children, child -> parents
  const childrenOf = new Map<string, string[]>();
  const parentsOf = new Map<string, string[]>();
  for (const r of relationships) {
    if (!childrenOf.has(r.parent_id)) childrenOf.set(r.parent_id, []);
    childrenOf.get(r.parent_id)!.push(r.child_id);
    if (!parentsOf.has(r.child_id)) parentsOf.set(r.child_id, []);
    parentsOf.get(r.child_id)!.push(r.parent_id);
  }

  // Index: person -> unions
  const unionsOf = new Map<string, FamilyUnion[]>();
  for (const u of unions) {
    if (!unionsOf.has(u.person1_id)) unionsOf.set(u.person1_id, []);
    unionsOf.get(u.person1_id)!.push(u);
    if (!unionsOf.has(u.person2_id)) unionsOf.set(u.person2_id, []);
    unionsOf.get(u.person2_id)!.push(u);
  }

  // Connected persons (have at least one relation or union)
  const connectedPersons = new Set<string>();
  for (const r of relationships) {
    connectedPersons.add(r.parent_id);
    connectedPersons.add(r.child_id);
  }
  for (const u of unions) {
    connectedPersons.add(u.person1_id);
    connectedPersons.add(u.person2_id);
  }

  // ===== 1. PER-PERSON CHECKS =====
  for (const p of persons) {
    const birth = parseDate(p.birth_date);
    const death = parseDate(p.death_date);

    // 1a. Death before birth
    if (birth && death && death < birth) {
      issues.push({
        id: nextId(), severity: 'error', category: 'temporal',
        personId: p.id, personName: personName(p),
        message: `Date de décès antérieure à la date de naissance`,
        detail: `Naissance : ${p.birth_date}, Décès : ${p.death_date}`
      });
    }

    // 1b. Exceptional longevity
    if (birth && p.is_alive) {
      const age = yearsBetween(birth, new Date());
      if (age > 110) {
        issues.push({
          id: nextId(), severity: 'warning', category: 'biological',
          personId: p.id, personName: personName(p),
          message: `Longévité exceptionnelle : ${Math.floor(age)} ans et toujours en vie`,
        });
      }
    }
    if (birth && death) {
      const age = yearsBetween(birth, death);
      if (age > 110) {
        issues.push({
          id: nextId(), severity: 'warning', category: 'biological',
          personId: p.id, personName: personName(p),
          message: `Longévité exceptionnelle : décédé(e) à ${Math.floor(age)} ans`,
        });
      }
    }

    // 1c. No name
    if (!p.first_names?.trim() && !p.last_name?.trim()) {
      issues.push({
        id: nextId(), severity: 'info', category: 'data_quality',
        personId: p.id, personName: '(sans nom)',
        message: `Personne sans nom ni prénom`,
      });
    }

    // 1d. Incomplete date (year only = "XXXX-01-01")
    if (p.birth_date && /^\d{4}-01-01$/.test(p.birth_date) && p.birth_date_precision !== 'year') {
      issues.push({
        id: nextId(), severity: 'info', category: 'data_quality',
        personId: p.id, personName: personName(p),
        message: `Date de naissance possiblement incomplète (année seule ?)`,
        detail: p.birth_date,
      });
    }

    // 1e. Isolated person (structural)
    if (!connectedPersons.has(p.id)) {
      issues.push({
        id: nextId(), severity: 'info', category: 'structural',
        personId: p.id, personName: personName(p),
        message: `Personne isolée : aucun lien parent, enfant ou conjoint`,
      });
    }
  }

  // ===== 2. PARENT-CHILD CHECKS =====
  for (const r of relationships) {
    const parent = personMap.get(r.parent_id);
    const child = personMap.get(r.child_id);
    if (!parent || !child) continue;

    const parentBirth = parseDate(parent.birth_date);
    const parentDeath = parseDate(parent.death_date);
    const childBirth = parseDate(child.birth_date);

    // 2a. Child born before parent
    if (parentBirth && childBirth && childBirth <= parentBirth) {
      issues.push({
        id: nextId(), severity: 'error', category: 'temporal',
        personId: child.id, personName: personName(child),
        relatedPersonId: parent.id, relatedPersonName: personName(parent),
        message: `Né(e) avant son parent ${personName(parent)}`,
      });
    }

    // 2b. Child born after parent's death
    if (parentDeath && childBirth) {
      const daysAfterDeath = daysBetween(parentDeath, childBirth);
      if (parent.gender === 'female' && daysAfterDeath > 0) {
        issues.push({
          id: nextId(), severity: 'error', category: 'temporal',
          personId: child.id, personName: personName(child),
          relatedPersonId: parent.id, relatedPersonName: personName(parent),
          message: `Né(e) après le décès de sa mère ${personName(parent)}`,
        });
      } else if (parent.gender === 'male' && daysAfterDeath > 280) {
        issues.push({
          id: nextId(), severity: 'error', category: 'temporal',
          personId: child.id, personName: personName(child),
          relatedPersonId: parent.id, relatedPersonName: personName(parent),
          message: `Né(e) plus de 9 mois après le décès de son père ${personName(parent)}`,
        });
      }
    }

    // 2c. Parent age at birth
    if (parentBirth && childBirth) {
      const ageAtBirth = yearsBetween(parentBirth, childBirth);
      if (ageAtBirth < 0) continue; // already caught above

      if (parent.gender === 'female') {
        if (ageAtBirth < 13) {
          issues.push({
            id: nextId(), severity: 'warning', category: 'biological',
            personId: parent.id, personName: personName(parent),
            relatedPersonId: child.id, relatedPersonName: personName(child),
            message: `Mère âgée de ${Math.floor(ageAtBirth)} ans à la naissance de ${personName(child)}`,
          });
        } else if (ageAtBirth > 50) {
          issues.push({
            id: nextId(), severity: 'warning', category: 'biological',
            personId: parent.id, personName: personName(parent),
            relatedPersonId: child.id, relatedPersonName: personName(child),
            message: `Mère âgée de ${Math.floor(ageAtBirth)} ans à la naissance de ${personName(child)}`,
          });
        }
      } else if (parent.gender === 'male') {
        if (ageAtBirth < 14) {
          issues.push({
            id: nextId(), severity: 'warning', category: 'biological',
            personId: parent.id, personName: personName(parent),
            relatedPersonId: child.id, relatedPersonName: personName(child),
            message: `Père âgé de ${Math.floor(ageAtBirth)} ans à la naissance de ${personName(child)}`,
          });
        } else if (ageAtBirth > 75) {
          issues.push({
            id: nextId(), severity: 'warning', category: 'biological',
            personId: parent.id, personName: personName(parent),
            relatedPersonId: child.id, relatedPersonName: personName(child),
            message: `Père âgé de ${Math.floor(ageAtBirth)} ans à la naissance de ${personName(child)}`,
          });
        }
      }
    }
  }

  // ===== 3. SIBLING CHECKS =====
  // Group children by parent pairs
  const siblingGroups = new Map<string, string[]>();
  for (const [parentId, children] of childrenOf.entries()) {
    if (children.length < 2) continue;
    const key = parentId;
    siblingGroups.set(key, children);
  }

  const checkedSiblingPairs = new Set<string>();
  for (const [, siblings] of siblingGroups) {
    const siblingsWithDates = siblings
      .map(id => personMap.get(id))
      .filter((p): p is FamilyPerson => !!p && !!p.birth_date)
      .sort((a, b) => (a.birth_date! > b.birth_date! ? 1 : -1));

    for (let i = 0; i < siblingsWithDates.length - 1; i++) {
      const older = siblingsWithDates[i];
      const younger = siblingsWithDates[i + 1];
      const pairKey = [older.id, younger.id].sort().join('-');
      if (checkedSiblingPairs.has(pairKey)) continue;
      checkedSiblingPairs.add(pairKey);

      const d1 = parseDate(older.birth_date);
      const d2 = parseDate(younger.birth_date);
      if (!d1 || !d2) continue;

      const gap = daysBetween(d1, d2);
      if (gap > 0 && gap < 270) {
        issues.push({
          id: nextId(), severity: 'warning', category: 'biological',
          personId: younger.id, personName: personName(younger),
          relatedPersonId: older.id, relatedPersonName: personName(older),
          message: `Né(e) seulement ${Math.floor(gap)} jours après ${personName(older)} (frère/sœur)`,
        });
      }

      const yearsGap = yearsBetween(d1, d2);
      if (yearsGap > 25) {
        issues.push({
          id: nextId(), severity: 'info', category: 'biological',
          personId: younger.id, personName: personName(younger),
          relatedPersonId: older.id, relatedPersonName: personName(older),
          message: `${Math.floor(yearsGap)} ans d'écart avec ${personName(older)} (frère/sœur)`,
        });
      }
    }
  }

  // ===== 4. UNION CHECKS =====
  for (const u of unions) {
    const p1 = personMap.get(u.person1_id);
    const p2 = personMap.get(u.person2_id);
    if (!p1 || !p2) continue;

    const startDate = parseDate(u.start_date);
    const p1Birth = parseDate(p1.birth_date);
    const p2Birth = parseDate(p2.birth_date);
    const p1Death = parseDate(p1.death_date);
    const p2Death = parseDate(p2.death_date);

    // 4a. Marriage before birth of a spouse
    if (startDate) {
      if (p1Birth && startDate < p1Birth) {
        issues.push({
          id: nextId(), severity: 'error', category: 'temporal',
          personId: p1.id, personName: personName(p1),
          relatedPersonId: p2.id, relatedPersonName: personName(p2),
          message: `Union enregistrée avant la naissance de ${personName(p1)}`,
        });
      }
      if (p2Birth && startDate < p2Birth) {
        issues.push({
          id: nextId(), severity: 'error', category: 'temporal',
          personId: p2.id, personName: personName(p2),
          relatedPersonId: p1.id, relatedPersonName: personName(p1),
          message: `Union enregistrée avant la naissance de ${personName(p2)}`,
        });
      }

      // 4b. Marriage after death
      if (p1Death && startDate > p1Death) {
        issues.push({
          id: nextId(), severity: 'error', category: 'temporal',
          personId: p1.id, personName: personName(p1),
          message: `Union enregistrée après le décès de ${personName(p1)}`,
        });
      }
      if (p2Death && startDate > p2Death) {
        issues.push({
          id: nextId(), severity: 'error', category: 'temporal',
          personId: p2.id, personName: personName(p2),
          message: `Union enregistrée après le décès de ${personName(p2)}`,
        });
      }

      // 4c. Early marriage
      if (p1Birth) {
        const ageAtMarriage = yearsBetween(p1Birth, startDate);
        if (ageAtMarriage < 14) {
          issues.push({
            id: nextId(), severity: 'warning', category: 'biological',
            personId: p1.id, personName: personName(p1),
            message: `Marié(e) à ${Math.floor(ageAtMarriage)} ans`,
          });
        }
      }
      if (p2Birth) {
        const ageAtMarriage = yearsBetween(p2Birth, startDate);
        if (ageAtMarriage < 14) {
          issues.push({
            id: nextId(), severity: 'warning', category: 'biological',
            personId: p2.id, personName: personName(p2),
            message: `Marié(e) à ${Math.floor(ageAtMarriage)} ans`,
          });
        }
      }
    }

    // 4d. Age gap in couple
    if (p1Birth && p2Birth) {
      const gap = Math.abs(yearsBetween(p1Birth, p2Birth));
      if (gap > 40) {
        issues.push({
          id: nextId(), severity: 'info', category: 'biological',
          personId: p1.id, personName: personName(p1),
          relatedPersonId: p2.id, relatedPersonName: personName(p2),
          message: `${Math.floor(gap)} ans d'écart entre les conjoints`,
        });
      }
    }
  }

  // ===== 5. DUPLICATE DETECTION =====
  for (let i = 0; i < persons.length; i++) {
    for (let j = i + 1; j < persons.length; j++) {
      const a = persons[i];
      const b = persons[j];
      const sameFirst = a.first_names?.toLowerCase().trim() === b.first_names?.toLowerCase().trim();
      const sameLast = a.last_name?.toLowerCase().trim() === b.last_name?.toLowerCase().trim();
      const sameBirth = a.birth_date && b.birth_date && a.birth_date === b.birth_date;

      if (sameFirst && sameLast && a.first_names?.trim()) {
        issues.push({
          id: nextId(), severity: sameBirth ? 'warning' : 'info', category: 'data_quality',
          personId: a.id, personName: personName(a),
          relatedPersonId: b.id, relatedPersonName: personName(b),
          message: `Doublon potentiel : ${personName(a)} apparaît deux fois${sameBirth ? ' avec la même date de naissance' : ''}`,
        });
      }
    }
  }

  // Sort: errors first, then warnings, then info
  const severityOrder: Record<ValidationSeverity, number> = { error: 0, warning: 1, info: 2 };
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return issues;
}

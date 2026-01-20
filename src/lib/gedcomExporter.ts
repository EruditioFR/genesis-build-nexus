// GEDCOM Exporter for Family Tree
// Generates GEDCOM 5.5.1 compatible files

import type { 
  FamilyTree, 
  FamilyPerson, 
  ParentChildRelationship, 
  FamilyUnion 
} from '@/types/familyTree';

interface ExportData {
  tree: FamilyTree;
  persons: FamilyPerson[];
  relationships: ParentChildRelationship[];
  unions: FamilyUnion[];
}

function formatGedcomDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;

    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  } catch {
    return null;
  }
}

function escapeGedcomValue(value: string): string {
  // GEDCOM uses @@ for literal @ signs
  return value.replace(/@/g, '@@');
}

function generatePersonId(index: number): string {
  return `@I${index + 1}@`;
}

function generateFamilyId(index: number): string {
  return `@F${index + 1}@`;
}

export function exportToGedcom(data: ExportData): string {
  const lines: string[] = [];
  const { tree, persons, relationships, unions } = data;

  // Create ID mappings
  const personToGedcomId: Record<string, string> = {};
  persons.forEach((person, index) => {
    personToGedcomId[person.id] = generatePersonId(index);
  });

  const unionToGedcomId: Record<string, string> = {};
  unions.forEach((union, index) => {
    unionToGedcomId[union.id] = generateFamilyId(index);
  });

  // Find family relationships (union + children)
  interface FamilyGroup {
    unionId?: string;
    person1Id?: string;
    person2Id?: string;
    childIds: string[];
    marriageDate?: string | null;
    marriagePlace?: string | null;
    divorceDate?: string | null;
  }

  const families: FamilyGroup[] = [];

  // Build families from unions
  unions.forEach((union) => {
    const childIds = relationships
      .filter(r => r.union_id === union.id)
      .map(r => r.child_id);

    families.push({
      unionId: union.id,
      person1Id: union.person1_id,
      person2Id: union.person2_id,
      childIds: [...new Set(childIds)],
      marriageDate: union.start_date,
      marriagePlace: union.start_place,
      divorceDate: union.end_date,
    });
  });

  // Find orphan parent-child relationships (no union)
  const handledChildren = new Set(families.flatMap(f => f.childIds));
  const orphanRelationships = relationships.filter(r => !r.union_id && !handledChildren.has(r.child_id));

  // Group orphan relationships by parent pairs
  const orphanFamilies: Record<string, FamilyGroup> = {};
  orphanRelationships.forEach((rel) => {
    // Find if this child has another parent
    const sameChildRels = orphanRelationships.filter(r => r.child_id === rel.child_id);
    const parentIds = sameChildRels.map(r => r.parent_id).sort();
    const key = parentIds.join('-');

    if (!orphanFamilies[key]) {
      orphanFamilies[key] = {
        person1Id: parentIds[0],
        person2Id: parentIds[1],
        childIds: [],
      };
    }

    if (!orphanFamilies[key].childIds.includes(rel.child_id)) {
      orphanFamilies[key].childIds.push(rel.child_id);
    }
  });

  Object.values(orphanFamilies).forEach((family) => {
    families.push(family);
  });

  // Assign GEDCOM IDs to new families
  let familyIndex = unions.length;
  families.forEach((family) => {
    if (!family.unionId) {
      family.unionId = `generated-${familyIndex}`;
      unionToGedcomId[family.unionId] = generateFamilyId(familyIndex);
      familyIndex++;
    }
  });

  // Get families for a person (as spouse)
  const getPersonFamilies = (personId: string): string[] => {
    return families
      .filter(f => f.person1Id === personId || f.person2Id === personId)
      .map(f => unionToGedcomId[f.unionId!])
      .filter(Boolean);
  };

  // Get families for a person (as child)
  const getPersonChildFamilies = (personId: string): string[] => {
    return families
      .filter(f => f.childIds.includes(personId))
      .map(f => unionToGedcomId[f.unionId!])
      .filter(Boolean);
  };

  // === HEADER ===
  lines.push('0 HEAD');
  lines.push('1 SOUR MemoireCapsule');
  lines.push('2 NAME MemoireCapsule');
  lines.push('2 VERS 1.0');
  lines.push('1 DEST ANY');
  lines.push(`1 DATE ${formatGedcomDate(new Date().toISOString())}`);
  lines.push('1 GEDC');
  lines.push('2 VERS 5.5.1');
  lines.push('2 FORM LINEAGE-LINKED');
  lines.push('1 CHAR UTF-8');
  if (tree.name) {
    lines.push(`1 NOTE ${escapeGedcomValue(tree.name)}`);
  }

  // === INDIVIDUALS ===
  persons.forEach((person) => {
    const gedcomId = personToGedcomId[person.id];
    
    lines.push(`0 ${gedcomId} INDI`);

    // Name
    const lastName = person.last_name || '';
    const firstName = person.first_names || '';
    lines.push(`1 NAME ${escapeGedcomValue(firstName)} /${escapeGedcomValue(lastName)}/`);
    if (firstName) {
      lines.push(`2 GIVN ${escapeGedcomValue(firstName)}`);
    }
    if (lastName) {
      lines.push(`2 SURN ${escapeGedcomValue(lastName)}`);
    }
    if (person.maiden_name) {
      lines.push(`2 _MARNM ${escapeGedcomValue(person.maiden_name)}`);
    }

    // Gender
    if (person.gender === 'male') {
      lines.push('1 SEX M');
    } else if (person.gender === 'female') {
      lines.push('1 SEX F');
    } else {
      lines.push('1 SEX U');
    }

    // Birth
    if (person.birth_date || person.birth_place) {
      lines.push('1 BIRT');
      if (person.birth_date) {
        const formattedDate = formatGedcomDate(person.birth_date);
        if (formattedDate) {
          lines.push(`2 DATE ${formattedDate}`);
        }
      }
      if (person.birth_place) {
        lines.push(`2 PLAC ${escapeGedcomValue(person.birth_place)}`);
      }
    }

    // Death
    if (!person.is_alive || person.death_date || person.death_place) {
      lines.push('1 DEAT');
      if (person.death_date) {
        const formattedDate = formatGedcomDate(person.death_date);
        if (formattedDate) {
          lines.push(`2 DATE ${formattedDate}`);
        }
      }
      if (person.death_place) {
        lines.push(`2 PLAC ${escapeGedcomValue(person.death_place)}`);
      }
      if (!person.death_date && !person.death_place && !person.is_alive) {
        lines.push('2 TYPE Y'); // Yes, deceased but no details
      }
    }

    // Burial
    if (person.burial_date || person.burial_place) {
      lines.push('1 BURI');
      if (person.burial_date) {
        const formattedDate = formatGedcomDate(person.burial_date);
        if (formattedDate) {
          lines.push(`2 DATE ${formattedDate}`);
        }
      }
      if (person.burial_place) {
        lines.push(`2 PLAC ${escapeGedcomValue(person.burial_place)}`);
      }
    }

    // Occupation
    if (person.occupation) {
      lines.push(`1 OCCU ${escapeGedcomValue(person.occupation)}`);
    }

    // Nationality
    if (person.nationality) {
      lines.push(`1 NATI ${escapeGedcomValue(person.nationality)}`);
    }

    // Biography as note
    if (person.biography) {
      lines.push(`1 NOTE ${escapeGedcomValue(person.biography)}`);
    }

    // Family links (as spouse)
    const spouseFamilies = getPersonFamilies(person.id);
    spouseFamilies.forEach((famId) => {
      lines.push(`1 FAMS ${famId}`);
    });

    // Family links (as child)
    const childFamilies = getPersonChildFamilies(person.id);
    childFamilies.forEach((famId) => {
      lines.push(`1 FAMC ${famId}`);
    });
  });

  // === FAMILIES ===
  families.forEach((family) => {
    const gedcomId = unionToGedcomId[family.unionId!];
    
    lines.push(`0 ${gedcomId} FAM`);

    // Husband (person1 - typically male, but we check gender)
    if (family.person1Id && personToGedcomId[family.person1Id]) {
      const person1 = persons.find(p => p.id === family.person1Id);
      if (person1?.gender === 'female') {
        lines.push(`1 WIFE ${personToGedcomId[family.person1Id]}`);
      } else {
        lines.push(`1 HUSB ${personToGedcomId[family.person1Id]}`);
      }
    }

    // Wife (person2 - typically female, but we check gender)
    if (family.person2Id && personToGedcomId[family.person2Id]) {
      const person2 = persons.find(p => p.id === family.person2Id);
      if (person2?.gender === 'male') {
        lines.push(`1 HUSB ${personToGedcomId[family.person2Id]}`);
      } else {
        lines.push(`1 WIFE ${personToGedcomId[family.person2Id]}`);
      }
    }

    // Children
    family.childIds.forEach((childId) => {
      if (personToGedcomId[childId]) {
        lines.push(`1 CHIL ${personToGedcomId[childId]}`);
      }
    });

    // Marriage
    if (family.marriageDate || family.marriagePlace) {
      lines.push('1 MARR');
      if (family.marriageDate) {
        const formattedDate = formatGedcomDate(family.marriageDate);
        if (formattedDate) {
          lines.push(`2 DATE ${formattedDate}`);
        }
      }
      if (family.marriagePlace) {
        lines.push(`2 PLAC ${escapeGedcomValue(family.marriagePlace)}`);
      }
    }

    // Divorce
    if (family.divorceDate) {
      lines.push('1 DIV');
      const formattedDate = formatGedcomDate(family.divorceDate);
      if (formattedDate) {
        lines.push(`2 DATE ${formattedDate}`);
      }
    }
  });

  // === TRAILER ===
  lines.push('0 TRLR');

  return lines.join('\n');
}

export function downloadGedcom(data: ExportData, filename?: string): void {
  const gedcomContent = exportToGedcom(data);
  const blob = new Blob([gedcomContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${data.tree.name || 'arbre-genealogique'}.ged`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

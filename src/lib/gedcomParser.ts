// GEDCOM Parser for Family Tree Import
// Supports GEDCOM 5.5 and 5.5.1 formats

export interface GedcomIndividual {
  id: string; // GEDCOM INDI ID (e.g., @I1@)
  firstName: string;
  lastName: string;
  maidenName?: string;
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  occupation?: string;
  notes?: string;
}

export interface GedcomFamily {
  id: string; // GEDCOM FAM ID (e.g., @F1@)
  husbandId?: string;
  wifeId?: string;
  childrenIds: string[];
  marriageDate?: string;
  marriagePlace?: string;
  divorceDate?: string;
}

export interface GedcomParseResult {
  individuals: GedcomIndividual[];
  families: GedcomFamily[];
  errors: string[];
  warnings: string[];
}

interface GedcomLine {
  level: number;
  tag: string;
  value: string;
  pointer?: string;
}

function parseLine(line: string): GedcomLine | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // GEDCOM line format: LEVEL [POINTER] TAG [VALUE]
  // Examples:
  // 0 @I1@ INDI
  // 1 NAME John /Doe/
  // 2 DATE 1 JAN 1990

  const match = trimmed.match(/^(\d+)\s+(@[^@]+@)?\s*(\S+)\s*(.*)?$/);
  if (!match) return null;

  const [, levelStr, pointer, tag, value] = match;
  
  return {
    level: parseInt(levelStr, 10),
    tag: tag.toUpperCase(),
    value: value?.trim() || '',
    pointer: pointer?.replace(/@/g, ''),
  };
}

function parseGedcomDate(dateStr: string): string | undefined {
  if (!dateStr) return undefined;

  // Handle approximate dates (ABT, EST, BEF, AFT, etc.)
  const cleanDate = dateStr
    .replace(/^(ABT|ABOUT|EST|ESTIMATED|CAL|CALCULATED|BEF|BEFORE|AFT|AFTER)\s*/i, '')
    .trim();

  // Try to parse common date formats
  // Format: DD MMM YYYY (e.g., "1 JAN 1990")
  const fullMatch = cleanDate.match(/^(\d{1,2})\s+([A-Z]{3})\s+(\d{4})$/i);
  if (fullMatch) {
    const [, day, month, year] = fullMatch;
    const monthMap: Record<string, string> = {
      JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
      JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12',
    };
    const monthNum = monthMap[month.toUpperCase()];
    if (monthNum) {
      return `${year}-${monthNum}-${day.padStart(2, '0')}`;
    }
  }

  // Format: MMM YYYY (e.g., "JAN 1990")
  const monthYearMatch = cleanDate.match(/^([A-Z]{3})\s+(\d{4})$/i);
  if (monthYearMatch) {
    const [, month, year] = monthYearMatch;
    const monthMap: Record<string, string> = {
      JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
      JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12',
    };
    const monthNum = monthMap[month.toUpperCase()];
    if (monthNum) {
      return `${year}-${monthNum}-01`;
    }
  }

  // Format: YYYY only
  const yearMatch = cleanDate.match(/^(\d{4})$/);
  if (yearMatch) {
    return `${yearMatch[1]}-01-01`;
  }

  return undefined;
}

function parseName(nameValue: string): { firstName: string; lastName: string; maidenName?: string } {
  // GEDCOM name format: "FirstName /LastName/"
  // May also include maiden name: "FirstName /LastName/ (née MaidenName)"
  
  const match = nameValue.match(/^([^/]*)\s*\/([^/]*)\//);
  if (match) {
    const [, firstName, lastName] = match;
    
    // Check for maiden name in parentheses or after the main name
    const maidenMatch = nameValue.match(/\((?:née|nee|born)\s+([^)]+)\)/i);
    
    return {
      firstName: firstName?.trim() || '',
      lastName: lastName?.trim() || '',
      maidenName: maidenMatch?.[1]?.trim(),
    };
  }

  // If no slashes, just use the whole value as first name
  return {
    firstName: nameValue.trim(),
    lastName: '',
  };
}

export function parseGedcom(content: string): GedcomParseResult {
  const result: GedcomParseResult = {
    individuals: [],
    families: [],
    errors: [],
    warnings: [],
  };

  // Handle different encodings/line endings
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  
  let currentIndividual: Partial<GedcomIndividual> | null = null;
  let currentFamily: Partial<GedcomFamily> | null = null;
  let currentTag: string | null = null;
  let currentSubTag: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const parsedLine = parseLine(lines[i]);
    if (!parsedLine) continue;

    const { level, tag, value, pointer } = parsedLine;

    // Level 0 - Top level records
    if (level === 0) {
      // Save previous record
      if (currentIndividual?.id) {
        result.individuals.push(currentIndividual as GedcomIndividual);
      }
      if (currentFamily?.id) {
        result.families.push(currentFamily as GedcomFamily);
      }

      currentIndividual = null;
      currentFamily = null;
      currentTag = null;
      currentSubTag = null;

      if (tag === 'INDI' && pointer) {
        currentIndividual = {
          id: pointer,
          firstName: '',
          lastName: '',
          gender: 'unknown',
        };
      } else if (tag === 'FAM' && pointer) {
        currentFamily = {
          id: pointer,
          childrenIds: [],
        };
      }
    }
    // Level 1 - Individual or Family properties
    else if (level === 1) {
      currentTag = tag;
      currentSubTag = null;

      if (currentIndividual) {
        switch (tag) {
          case 'NAME': {
            const { firstName, lastName, maidenName } = parseName(value);
            currentIndividual.firstName = firstName;
            currentIndividual.lastName = lastName;
            if (maidenName) currentIndividual.maidenName = maidenName;
            break;
          }
          case 'SEX':
            currentIndividual.gender = value === 'M' ? 'male' : value === 'F' ? 'female' : 'unknown';
            break;
          case 'BIRT':
          case 'DEAT':
          case 'OCCU':
            // These will have sub-tags with actual values
            break;
          case 'NOTE':
            currentIndividual.notes = value;
            break;
        }
      }

      if (currentFamily) {
        switch (tag) {
          case 'HUSB':
            currentFamily.husbandId = value.replace(/@/g, '');
            break;
          case 'WIFE':
            currentFamily.wifeId = value.replace(/@/g, '');
            break;
          case 'CHIL':
            currentFamily.childrenIds = currentFamily.childrenIds || [];
            currentFamily.childrenIds.push(value.replace(/@/g, ''));
            break;
          case 'MARR':
          case 'DIV':
            // These will have sub-tags with actual values
            break;
        }
      }
    }
    // Level 2 - Sub-properties
    else if (level === 2) {
      currentSubTag = tag;

      if (currentIndividual) {
        if (currentTag === 'BIRT') {
          if (tag === 'DATE') {
            currentIndividual.birthDate = parseGedcomDate(value);
          } else if (tag === 'PLAC') {
            currentIndividual.birthPlace = value;
          }
        } else if (currentTag === 'DEAT') {
          if (tag === 'DATE') {
            currentIndividual.deathDate = parseGedcomDate(value);
          } else if (tag === 'PLAC') {
            currentIndividual.deathPlace = value;
          }
        } else if (currentTag === 'OCCU' && tag === 'TYPE') {
          currentIndividual.occupation = value;
        } else if (currentTag === 'OCCU' && !currentIndividual.occupation) {
          // Some GEDCOM files put occupation directly under OCCU
          currentIndividual.occupation = value;
        }
      }

      if (currentFamily) {
        if (currentTag === 'MARR') {
          if (tag === 'DATE') {
            currentFamily.marriageDate = parseGedcomDate(value);
          } else if (tag === 'PLAC') {
            currentFamily.marriagePlace = value;
          }
        } else if (currentTag === 'DIV') {
          if (tag === 'DATE') {
            currentFamily.divorceDate = parseGedcomDate(value);
          }
        }
      }
    }
  }

  // Save last record
  if (currentIndividual?.id) {
    result.individuals.push(currentIndividual as GedcomIndividual);
  }
  if (currentFamily?.id) {
    result.families.push(currentFamily as GedcomFamily);
  }

  // Validate results
  if (result.individuals.length === 0) {
    result.errors.push('Aucun individu trouvé dans le fichier GEDCOM');
  }

  // Check for incomplete data
  result.individuals.forEach((ind) => {
    if (!ind.firstName && !ind.lastName) {
      result.warnings.push(`Individu ${ind.id} n'a pas de nom`);
    }
  });

  return result;
}

// Utility to check file validity before full parsing
export function isValidGedcomFile(content: string): boolean {
  const lines = content.split('\n');
  
  // Look for GEDCOM header
  for (const line of lines.slice(0, 10)) {
    const parsed = parseLine(line);
    if (parsed?.level === 0 && parsed?.tag === 'HEAD') {
      return true;
    }
    // Also accept files that start directly with records
    if (parsed?.level === 0 && (parsed?.tag === 'INDI' || parsed?.tag === 'FAM')) {
      return true;
    }
  }
  
  return false;
}

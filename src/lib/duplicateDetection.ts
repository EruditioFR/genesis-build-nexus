// Duplicate Detection for GEDCOM Import

import type { FamilyPerson } from '@/types/familyTree';
import type { GedcomIndividual } from './gedcomParser';

export interface DuplicateMatch {
  importedPerson: GedcomIndividual;
  existingPerson: FamilyPerson;
  confidence: number; // 0-100
  matchReasons: string[];
}

export interface DuplicateCheckResult {
  duplicates: DuplicateMatch[];
  uniquePersons: GedcomIndividual[];
}

// Normalize strings for comparison
function normalize(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]/g, '') // Keep only alphanumeric
    .trim();
}

// Extract year from date string
function extractYear(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const match = dateStr.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : null;
}

// Calculate similarity between two strings (0-1)
function stringSimilarity(a: string, b: string): number {
  const normA = normalize(a);
  const normB = normalize(b);
  
  if (!normA || !normB) return 0;
  if (normA === normB) return 1;
  
  // Check if one contains the other
  if (normA.includes(normB) || normB.includes(normA)) {
    return 0.8;
  }
  
  // Levenshtein-based similarity for short strings
  if (normA.length < 20 && normB.length < 20) {
    const maxLen = Math.max(normA.length, normB.length);
    const distance = levenshteinDistance(normA, normB);
    return Math.max(0, 1 - distance / maxLen);
  }
  
  return 0;
}

// Simple Levenshtein distance
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

// Calculate match score between imported and existing person
function calculateMatchScore(
  imported: GedcomIndividual,
  existing: FamilyPerson
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  // First name comparison (weight: 30)
  const firstNameSim = stringSimilarity(imported.firstName, existing.first_names);
  if (firstNameSim >= 0.9) {
    score += 30;
    reasons.push('Prénom identique');
  } else if (firstNameSim >= 0.7) {
    score += 20;
    reasons.push('Prénom similaire');
  }
  
  // Last name comparison (weight: 30)
  const lastNameSim = stringSimilarity(imported.lastName, existing.last_name);
  if (lastNameSim >= 0.9) {
    score += 30;
    reasons.push('Nom identique');
  } else if (lastNameSim >= 0.7) {
    score += 20;
    reasons.push('Nom similaire');
  }
  
  // Also check maiden name
  if (existing.maiden_name) {
    const maidenSim = stringSimilarity(imported.lastName, existing.maiden_name);
    if (maidenSim >= 0.9) {
      score += 15;
      reasons.push('Nom de jeune fille correspondant');
    }
  }
  
  // Birth year comparison (weight: 20)
  const importedYear = extractYear(imported.birthDate);
  const existingYear = extractYear(existing.birth_date);
  
  if (importedYear && existingYear) {
    if (importedYear === existingYear) {
      score += 20;
      reasons.push('Même année de naissance');
    } else if (Math.abs(importedYear - existingYear) <= 2) {
      score += 10;
      reasons.push('Année de naissance proche');
    }
  }
  
  // Birth place comparison (weight: 10)
  if (imported.birthPlace && existing.birth_place) {
    const placeSim = stringSimilarity(imported.birthPlace, existing.birth_place);
    if (placeSim >= 0.7) {
      score += 10;
      reasons.push('Lieu de naissance similaire');
    }
  }
  
  // Gender comparison (weight: 10)
  if (imported.gender && existing.gender) {
    if (imported.gender === existing.gender) {
      score += 10;
      reasons.push('Même genre');
    } else if (imported.gender !== 'unknown' && existing.gender !== 'unknown') {
      // Different gender is a strong negative signal
      score -= 30;
    }
  }
  
  return { score: Math.max(0, Math.min(100, score)), reasons };
}

// Find potential duplicates
export function detectDuplicates(
  importedPersons: GedcomIndividual[],
  existingPersons: FamilyPerson[],
  threshold: number = 50
): DuplicateCheckResult {
  const duplicates: DuplicateMatch[] = [];
  const uniquePersons: GedcomIndividual[] = [];
  const matchedImportIds = new Set<string>();
  
  for (const imported of importedPersons) {
    let bestMatch: DuplicateMatch | null = null;
    
    for (const existing of existingPersons) {
      const { score, reasons } = calculateMatchScore(imported, existing);
      
      if (score >= threshold) {
        if (!bestMatch || score > bestMatch.confidence) {
          bestMatch = {
            importedPerson: imported,
            existingPerson: existing,
            confidence: score,
            matchReasons: reasons,
          };
        }
      }
    }
    
    if (bestMatch) {
      duplicates.push(bestMatch);
      matchedImportIds.add(imported.id);
    } else {
      uniquePersons.push(imported);
    }
  }
  
  return { duplicates, uniquePersons };
}

// Merge decision for each duplicate
export type MergeDecision = 'skip' | 'merge' | 'create';

export interface DuplicateResolution {
  importedId: string;
  existingId?: string;
  decision: MergeDecision;
}

// Real-time validation warnings for person creation/editing
import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { FamilyPerson } from '@/types/familyTree';

interface PersonData {
  birth_date?: string | null;
  death_date?: string | null;
  is_alive?: boolean;
  gender?: string | null;
}

interface PersonValidationWarningsProps {
  /** The person being created/edited */
  person: PersonData;
  /** The relation type to the target (parent, child, spouse) */
  relationType?: 'parent' | 'child' | 'spouse' | 'sibling' | null;
  /** The target person (existing person we're linking to) */
  targetPerson?: FamilyPerson | null;
  /** Parents of the person being edited (for edit mode) */
  parents?: FamilyPerson[];
  /** Children of the person being edited (for edit mode) */
  children?: FamilyPerson[];
}

function parseDate(d?: string | null): Date | null {
  if (!d) return null;
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function yearsBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
}

export function PersonValidationWarnings({
  person,
  relationType,
  targetPerson,
  parents = [],
  children = [],
}: PersonValidationWarningsProps) {
  const warnings = useMemo(() => {
    const w: string[] = [];
    const birth = parseDate(person.birth_date);
    const death = parseDate(person.death_date);

    // Death before birth
    if (birth && death && death < birth) {
      w.push('La date de décès est antérieure à la date de naissance.');
    }

    // Longevity check
    if (birth && person.is_alive) {
      const age = yearsBetween(birth, new Date());
      if (age > 110) {
        w.push(`Cette personne aurait ${Math.floor(age)} ans. Vérifiez la date de naissance ou le statut "en vie".`);
      }
    }
    if (birth && death) {
      const age = yearsBetween(birth, death);
      if (age > 110) {
        w.push(`Longévité exceptionnelle : ${Math.floor(age)} ans.`);
      }
    }

    // Checks relative to the target person
    if (targetPerson && birth) {
      const targetBirth = parseDate(targetPerson.birth_date);
      const targetDeath = parseDate(targetPerson.death_date);

      if (relationType === 'child') {
        // New person is a child of targetPerson
        // Child born before parent
        if (targetBirth && birth <= targetBirth) {
          w.push(`L'enfant naît avant son parent (${targetPerson.first_names}).`);
        }
        // Parent age at child's birth
        if (targetBirth) {
          const parentAge = yearsBetween(targetBirth, birth);
          if (targetPerson.gender === 'female' && parentAge > 50) {
            w.push(`La mère aurait ${Math.floor(parentAge)} ans à cette naissance.`);
          } else if (targetPerson.gender === 'female' && parentAge < 13 && parentAge > 0) {
            w.push(`La mère n'aurait que ${Math.floor(parentAge)} ans à cette naissance.`);
          } else if (targetPerson.gender === 'male' && parentAge > 75) {
            w.push(`Le père aurait ${Math.floor(parentAge)} ans à cette naissance.`);
          } else if (targetPerson.gender === 'male' && parentAge < 14 && parentAge > 0) {
            w.push(`Le père n'aurait que ${Math.floor(parentAge)} ans à cette naissance.`);
          }
        }
        // Child born after parent's death
        if (targetDeath) {
          const daysAfter = (birth.getTime() - targetDeath.getTime()) / (24 * 60 * 60 * 1000);
          if (targetPerson.gender === 'female' && daysAfter > 0) {
            w.push(`L'enfant naît après le décès de sa mère.`);
          } else if (targetPerson.gender === 'male' && daysAfter > 280) {
            w.push(`L'enfant naît plus de 9 mois après le décès de son père.`);
          }
        }
      }

      if (relationType === 'parent') {
        // New person is a parent of targetPerson
        const childBirth = targetBirth;
        if (childBirth && birth >= childBirth) {
          w.push(`Ce parent naît après son enfant (${targetPerson.first_names}).`);
        }
        if (childBirth && birth) {
          const ageAtBirth = yearsBetween(birth, childBirth);
          if (person.gender === 'female' && ageAtBirth > 50) {
            w.push(`La mère aurait ${Math.floor(ageAtBirth)} ans à la naissance de l'enfant.`);
          } else if (person.gender === 'female' && ageAtBirth > 0 && ageAtBirth < 13) {
            w.push(`La mère n'aurait que ${Math.floor(ageAtBirth)} ans à la naissance de l'enfant.`);
          } else if (person.gender === 'male' && ageAtBirth > 75) {
            w.push(`Le père aurait ${Math.floor(ageAtBirth)} ans à la naissance de l'enfant.`);
          } else if (person.gender === 'male' && ageAtBirth > 0 && ageAtBirth < 14) {
            w.push(`Le père n'aurait que ${Math.floor(ageAtBirth)} ans à la naissance de l'enfant.`);
          }
        }
      }

      if (relationType === 'spouse') {
        // Age gap check
        if (targetBirth && birth) {
          const gap = Math.abs(yearsBetween(birth, targetBirth));
          if (gap > 40) {
            w.push(`${Math.floor(gap)} ans d'écart entre les conjoints.`);
          }
        }
      }
    }

    // Checks for edit mode (against existing parents/children)
    if (!relationType) {
      for (const parent of parents) {
        const parentBirth = parseDate(parent.birth_date);
        if (parentBirth && birth && birth <= parentBirth) {
          w.push(`Naît avant son parent ${parent.first_names} ${parent.last_name}.`);
        }
        if (parentBirth && birth) {
          const parentAge = yearsBetween(parentBirth, birth);
          if (parent.gender === 'female' && parentAge > 50) {
            w.push(`Sa mère ${parent.first_names} aurait ${Math.floor(parentAge)} ans à sa naissance.`);
          } else if (parent.gender === 'female' && parentAge > 0 && parentAge < 13) {
            w.push(`Sa mère ${parent.first_names} n'aurait que ${Math.floor(parentAge)} ans.`);
          }
        }
      }

      for (const child of children) {
        const childBirth = parseDate(child.birth_date);
        if (childBirth && birth && birth >= childBirth) {
          w.push(`Naît après son enfant ${child.first_names} ${child.last_name}.`);
        }
        if (childBirth && birth) {
          const ageAtBirth = yearsBetween(birth, childBirth);
          if (person.gender === 'female' && ageAtBirth > 50) {
            w.push(`Aurait ${Math.floor(ageAtBirth)} ans à la naissance de ${child.first_names}.`);
          }
        }
        if (death) {
          const childB = parseDate(child.birth_date);
          if (childB && childB > death) {
            w.push(`${child.first_names} naît après le décès de cette personne.`);
          }
        }
      }
    }

    return w;
  }, [person, relationType, targetPerson, parents, children]);

  if (warnings.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 p-3 space-y-1.5">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium text-sm">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        Attention — {warnings.length > 1 ? `${warnings.length} alertes` : '1 alerte'}
      </div>
      {warnings.map((w, i) => (
        <p key={i} className="text-xs text-amber-700 dark:text-amber-300 pl-6">• {w}</p>
      ))}
    </div>
  );
}

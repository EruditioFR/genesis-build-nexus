import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { FamilyTree, FamilyPerson, ParentChildRelationship, FamilyUnion } from '@/types/familyTree';

interface ExportOptions {
  tree: FamilyTree;
  persons: FamilyPerson[];
  relationships: ParentChildRelationship[];
  unions: FamilyUnion[];
  includeDetails?: boolean;
  includeTree?: boolean;
}

// Colors
const COLORS = {
  primary: [30, 58, 95] as [number, number, number], // #1E3A5F
  secondary: [139, 90, 43] as [number, number, number], // #8B5A2B
  text: [33, 33, 33] as [number, number, number],
  muted: [107, 114, 128] as [number, number, number],
  border: [229, 231, 235] as [number, number, number],
  male: [59, 130, 246] as [number, number, number],
  female: [236, 72, 153] as [number, number, number],
  background: [249, 250, 251] as [number, number, number],
};

export async function exportFamilyTreeToPDF(options: ExportOptions): Promise<void> {
  const { tree, persons, relationships, unions, includeDetails = true, includeTree = true } = options;
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  // Helper functions
  const addNewPageIfNeeded = (requiredHeight: number) => {
    if (currentY + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
      return true;
    }
    return false;
  };

  const drawLine = (y: number, width: number = contentWidth) => {
    pdf.setDrawColor(...COLORS.border);
    pdf.setLineWidth(0.3);
    pdf.line(margin, y, margin + width, y);
  };

  // Helper to get relationships
  const getPersonParents = (personId: string): FamilyPerson[] => {
    const parentIds = relationships.filter(r => r.child_id === personId).map(r => r.parent_id);
    return persons.filter(p => parentIds.includes(p.id));
  };

  const getPersonChildren = (personId: string): FamilyPerson[] => {
    const childIds = relationships.filter(r => r.parent_id === personId).map(r => r.child_id);
    return persons.filter(p => childIds.includes(p.id));
  };

  const getPersonSpouses = (personId: string): FamilyPerson[] => {
    const spouseIds = unions
      .filter(u => u.person1_id === personId || u.person2_id === personId)
      .map(u => u.person1_id === personId ? u.person2_id : u.person1_id);
    return persons.filter(p => spouseIds.includes(p.id));
  };

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return '';
    try {
      return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
    } catch {
      return date;
    }
  };

  const calculateAge = (person: FamilyPerson): number | null => {
    if (!person.birth_date) return null;
    const birth = new Date(person.birth_date);
    const end = person.death_date ? new Date(person.death_date) : new Date();
    return Math.floor((end.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  // ===== COVER PAGE =====
  // Background header
  pdf.setFillColor(...COLORS.primary);
  pdf.rect(0, 0, pageWidth, 80, 'F');

  // Tree icon (simplified)
  pdf.setFillColor(255, 255, 255);
  pdf.circle(pageWidth / 2, 35, 15, 'F');
  pdf.setFillColor(...COLORS.secondary);
  pdf.circle(pageWidth / 2, 35, 12, 'F');

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text(tree.name, pageWidth / 2, 65, { align: 'center' });

  // Subtitle
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Arbre Généalogique', pageWidth / 2, 73, { align: 'center' });

  currentY = 100;

  // Description
  if (tree.description) {
    pdf.setTextColor(...COLORS.text);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'italic');
    const descLines = pdf.splitTextToSize(tree.description, contentWidth - 20);
    pdf.text(descLines, pageWidth / 2, currentY, { align: 'center' });
    currentY += descLines.length * 6 + 10;
  }

  // Statistics box
  currentY += 10;
  const statsBoxHeight = 50;
  pdf.setFillColor(...COLORS.background);
  pdf.roundedRect(margin, currentY, contentWidth, statsBoxHeight, 3, 3, 'F');
  pdf.setDrawColor(...COLORS.border);
  pdf.roundedRect(margin, currentY, contentWidth, statsBoxHeight, 3, 3, 'S');

  const livingCount = persons.filter(p => p.is_alive).length;
  const deceasedCount = persons.filter(p => !p.is_alive).length;
  const maleCount = persons.filter(p => p.gender === 'male').length;
  const femaleCount = persons.filter(p => p.gender === 'female').length;

  const stats = [
    { label: 'Personnes', value: persons.length.toString() },
    { label: 'Vivantes', value: livingCount.toString() },
    { label: 'Décédées', value: deceasedCount.toString() },
    { label: 'Unions', value: unions.length.toString() },
  ];

  const statWidth = contentWidth / stats.length;
  stats.forEach((stat, index) => {
    const x = margin + statWidth * index + statWidth / 2;
    pdf.setTextColor(...COLORS.primary);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(stat.value, x, currentY + 22, { align: 'center' });
    pdf.setTextColor(...COLORS.muted);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(stat.label, x, currentY + 32, { align: 'center' });
  });

  currentY += statsBoxHeight + 20;

  // Export info
  pdf.setTextColor(...COLORS.muted);
  pdf.setFontSize(9);
  pdf.text(`Exporté le ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}`, pageWidth / 2, currentY, { align: 'center' });

  // ===== TREE VISUALIZATION PAGE =====
  if (includeTree && persons.length > 0) {
    pdf.addPage();
    currentY = margin;

    // Section title
    pdf.setFillColor(...COLORS.secondary);
    pdf.rect(margin, currentY, 4, 10, 'F');
    pdf.setTextColor(...COLORS.text);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Vue de l\'arbre', margin + 10, currentY + 7);
    currentY += 20;

    // Draw simplified tree structure
    const rootPerson = tree.root_person_id
      ? persons.find(p => p.id === tree.root_person_id)
      : persons[0];

    if (rootPerson) {
      drawSimplifiedTree(pdf, rootPerson, persons, relationships, unions, margin, currentY, contentWidth, getPersonChildren, getPersonSpouses);
    }
  }

  // ===== DETAILED PERSONS PAGES =====
  if (includeDetails) {
    pdf.addPage();
    currentY = margin;

    // Section title
    pdf.setFillColor(...COLORS.secondary);
    pdf.rect(margin, currentY, 4, 10, 'F');
    pdf.setTextColor(...COLORS.text);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Fiches individuelles', margin + 10, currentY + 7);
    currentY += 20;

    // Sort persons by birth date or name
    const sortedPersons = [...persons].sort((a, b) => {
      if (a.birth_date && b.birth_date) {
        return new Date(a.birth_date).getTime() - new Date(b.birth_date).getTime();
      }
      return `${a.last_name} ${a.first_names}`.localeCompare(`${b.last_name} ${b.first_names}`);
    });

    for (const person of sortedPersons) {
      const cardHeight = 70;
      addNewPageIfNeeded(cardHeight + 10);

      // Person card
      const cardY = currentY;
      
      // Card background
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(...COLORS.border);
      pdf.roundedRect(margin, cardY, contentWidth, cardHeight, 2, 2, 'FD');

      // Gender indicator bar
      const genderColor = person.gender === 'male' ? COLORS.male : 
                          person.gender === 'female' ? COLORS.female : 
                          COLORS.secondary;
      pdf.setFillColor(...genderColor);
      pdf.rect(margin, cardY, 3, cardHeight, 'F');

      // Avatar circle
      const avatarX = margin + 15;
      const avatarY = cardY + 15;
      pdf.setFillColor(...genderColor);
      pdf.circle(avatarX, avatarY, 8, 'F');
      
      // Initials
      const initials = `${person.first_names[0] || ''}${person.last_name[0] || ''}`.toUpperCase();
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(initials, avatarX, avatarY + 3, { align: 'center' });

      // Name
      const nameX = margin + 30;
      pdf.setTextColor(...COLORS.text);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${person.first_names} ${person.last_name}`, nameX, cardY + 12);

      // Maiden name
      if (person.maiden_name && person.maiden_name !== person.last_name) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(...COLORS.muted);
        pdf.text(`née ${person.maiden_name}`, nameX, cardY + 18);
      }

      // Status badge
      if (!person.is_alive) {
        const age = calculateAge(person);
        pdf.setFillColor(...COLORS.muted);
        const badgeText = age ? `Décédé(e) à ${age} ans` : 'Décédé(e)';
        const badgeWidth = pdf.getTextWidth(badgeText) + 6;
        pdf.roundedRect(margin + contentWidth - badgeWidth - 10, cardY + 6, badgeWidth, 8, 1, 1, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(7);
        pdf.text(badgeText, margin + contentWidth - badgeWidth / 2 - 10, cardY + 11.5, { align: 'center' });
      }

      // Info rows
      let infoY = cardY + 28;
      const infoX = nameX;
      pdf.setFontSize(9);

      // Birth info
      if (person.birth_date || person.birth_place) {
        pdf.setTextColor(...COLORS.text);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Naissance:', infoX, infoY);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...COLORS.muted);
        const birthInfo = [formatDate(person.birth_date), person.birth_place].filter(Boolean).join(' à ');
        pdf.text(birthInfo || '-', infoX + 25, infoY);
        infoY += 6;
      }

      // Death info
      if (!person.is_alive && (person.death_date || person.death_place)) {
        pdf.setTextColor(...COLORS.text);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Décès:', infoX, infoY);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...COLORS.muted);
        const deathInfo = [formatDate(person.death_date), person.death_place].filter(Boolean).join(' à ');
        pdf.text(deathInfo || '-', infoX + 25, infoY);
        infoY += 6;
      }

      // Occupation
      if (person.occupation) {
        pdf.setTextColor(...COLORS.text);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Profession:', infoX, infoY);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...COLORS.muted);
        pdf.text(person.occupation, infoX + 25, infoY);
        infoY += 6;
      }

      // Relations section
      const relationsX = margin + contentWidth / 2;
      let relY = cardY + 28;

      // Parents
      const parents = getPersonParents(person.id);
      if (parents.length > 0) {
        pdf.setTextColor(...COLORS.text);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Parents:', relationsX, relY);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...COLORS.muted);
        pdf.text(parents.map(p => `${p.first_names} ${p.last_name}`).join(', '), relationsX + 20, relY);
        relY += 6;
      }

      // Spouses
      const spouses = getPersonSpouses(person.id);
      if (spouses.length > 0) {
        pdf.setTextColor(...COLORS.text);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Conjoint(s):', relationsX, relY);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...COLORS.muted);
        const spouseText = spouses.map(s => `${s.first_names} ${s.last_name}`).join(', ');
        const spouseLines = pdf.splitTextToSize(spouseText, contentWidth / 2 - 25);
        pdf.text(spouseLines, relationsX + 25, relY);
        relY += spouseLines.length * 4 + 2;
      }

      // Children
      const children = getPersonChildren(person.id);
      if (children.length > 0) {
        pdf.setTextColor(...COLORS.text);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Enfants:', relationsX, relY);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...COLORS.muted);
        const childText = children.map(c => `${c.first_names} ${c.last_name}`).join(', ');
        const childLines = pdf.splitTextToSize(childText, contentWidth / 2 - 25);
        pdf.text(childLines, relationsX + 20, relY);
      }

      currentY += cardHeight + 8;
    }
  }

  // ===== FOOTER ON ALL PAGES =====
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setTextColor(...COLORS.muted);
    pdf.setFontSize(8);
    pdf.text(`${tree.name} - Page ${i}/${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  // Save the PDF
  const fileName = `arbre-${tree.name.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  pdf.save(fileName);
}

// Draw a simplified tree structure
function drawSimplifiedTree(
  pdf: jsPDF,
  rootPerson: FamilyPerson,
  persons: FamilyPerson[],
  relationships: ParentChildRelationship[],
  unions: FamilyUnion[],
  startX: number,
  startY: number,
  width: number,
  getChildren: (id: string) => FamilyPerson[],
  getSpouses: (id: string) => FamilyPerson[]
) {
  const nodeWidth = 35;
  const nodeHeight = 18;
  const levelHeight = 35;
  const visited = new Set<string>();

  interface NodePosition {
    person: FamilyPerson;
    x: number;
    y: number;
    level: number;
  }

  const positions: NodePosition[] = [];

  // Calculate tree layout
  const calculateLayout = (person: FamilyPerson, level: number, minX: number, maxX: number): number => {
    if (visited.has(person.id)) return (minX + maxX) / 2;
    visited.add(person.id);

    const children = getChildren(person.id);
    
    if (children.length === 0) {
      const x = (minX + maxX) / 2;
      positions.push({ person, x, y: startY + level * levelHeight, level });
      return x;
    }

    const childWidth = (maxX - minX) / children.length;
    let totalX = 0;
    
    children.forEach((child, index) => {
      const childMinX = minX + index * childWidth;
      const childMaxX = childMinX + childWidth;
      totalX += calculateLayout(child, level + 1, childMinX, childMaxX);
    });

    const x = totalX / children.length;
    positions.push({ person, x, y: startY + level * levelHeight, level });
    return x;
  };

  calculateLayout(rootPerson, 0, startX, startX + width);

  // Draw connections
  pdf.setDrawColor(...COLORS.secondary);
  pdf.setLineWidth(0.5);

  for (const pos of positions) {
    const children = getChildren(pos.person.id);
    for (const child of children) {
      const childPos = positions.find(p => p.person.id === child.id);
      if (childPos) {
        // Vertical line from parent
        pdf.line(pos.x + nodeWidth / 2, pos.y + nodeHeight, pos.x + nodeWidth / 2, pos.y + nodeHeight + 8);
        // Horizontal line
        const midY = pos.y + nodeHeight + 8;
        pdf.line(pos.x + nodeWidth / 2, midY, childPos.x + nodeWidth / 2, midY);
        // Vertical line to child
        pdf.line(childPos.x + nodeWidth / 2, midY, childPos.x + nodeWidth / 2, childPos.y);
      }
    }
  }

  // Draw nodes
  for (const pos of positions) {
    const genderColor = pos.person.gender === 'male' ? COLORS.male :
                        pos.person.gender === 'female' ? COLORS.female :
                        COLORS.secondary;

    // Node background
    pdf.setFillColor(...genderColor);
    pdf.roundedRect(pos.x, pos.y, nodeWidth, nodeHeight, 2, 2, 'F');

    // Node text
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    
    const firstName = pos.person.first_names.split(' ')[0];
    const displayName = firstName.length > 8 ? firstName.substring(0, 7) + '.' : firstName;
    pdf.text(displayName, pos.x + nodeWidth / 2, pos.y + 7, { align: 'center' });
    
    pdf.setFontSize(5);
    pdf.setFont('helvetica', 'normal');
    const lastName = pos.person.last_name.length > 10 ? pos.person.last_name.substring(0, 9) + '.' : pos.person.last_name;
    pdf.text(lastName, pos.x + nodeWidth / 2, pos.y + 12, { align: 'center' });

    // Birth year
    if (pos.person.birth_date) {
      const year = new Date(pos.person.birth_date).getFullYear();
      pdf.setFontSize(4);
      pdf.text(year.toString(), pos.x + nodeWidth / 2, pos.y + 16, { align: 'center' });
    }
  }
}

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
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

const C = {
  primary: rgb(30 / 255, 58 / 255, 95 / 255),
  secondary: rgb(139 / 255, 90 / 255, 43 / 255),
  text: rgb(33 / 255, 33 / 255, 33 / 255),
  muted: rgb(107 / 255, 114 / 255, 128 / 255),
  border: rgb(229 / 255, 231 / 255, 235 / 255),
  male: rgb(59 / 255, 130 / 255, 246 / 255),
  female: rgb(236 / 255, 72 / 255, 153 / 255),
  bg: rgb(249 / 255, 250 / 255, 251 / 255),
  white: rgb(1, 1, 1),
};

function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(test, fontSize) > maxWidth && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}

export async function exportFamilyTreeToPDF(options: ExportOptions): Promise<void> {
  const { tree, persons, relationships, unions, includeDetails = true, includeTree = true } = options;

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const W = 595.28;
  const H = 841.89;
  const M = 56;
  const CW = W - M * 2;

  // Helpers
  const getParents = (id: string) => persons.filter(p => relationships.some(r => r.child_id === id && r.parent_id === p.id));
  const getChildren = (id: string) => persons.filter(p => relationships.some(r => r.parent_id === id && r.child_id === p.id));
  const getSpouses = (id: string) => {
    const ids = unions.filter(u => u.person1_id === id || u.person2_id === id).map(u => u.person1_id === id ? u.person2_id : u.person1_id);
    return persons.filter(p => ids.includes(p.id));
  };
  const fmtDate = (d: string | null | undefined) => {
    if (!d) return '';
    try { return format(new Date(d), 'dd MMMM yyyy', { locale: fr }); } catch { return d; }
  };
  const calcAge = (p: FamilyPerson) => {
    if (!p.birth_date) return null;
    const end = p.death_date ? new Date(p.death_date) : new Date();
    return Math.floor((end.getTime() - new Date(p.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };
  const genderColor = (g: string | null) => g === 'male' ? C.male : g === 'female' ? C.female : C.secondary;

  // ===== COVER PAGE =====
  let page = pdfDoc.addPage([W, H]);
  // Header bar
  page.drawRectangle({ x: 0, y: H - 227, width: W, height: 227, color: C.primary });

  // Title
  const titleSize = 26;
  const titleW = fontBold.widthOfTextAtSize(tree.name, titleSize);
  page.drawText(tree.name, { x: (W - titleW) / 2, y: H - 185, size: titleSize, font: fontBold, color: C.white });

  // Subtitle
  const sub = 'Arbre Généalogique';
  const subW = font.widthOfTextAtSize(sub, 12);
  page.drawText(sub, { x: (W - subW) / 2, y: H - 207, size: 12, font, color: C.white });

  let y = H - 260;

  // Description
  if (tree.description) {
    const lines = wrapText(tree.description, fontItalic, 10, CW - 20);
    for (const line of lines) {
      const lw = fontItalic.widthOfTextAtSize(line, 10);
      page.drawText(line, { x: (W - lw) / 2, y, size: 10, font: fontItalic, color: C.text });
      y -= 14;
    }
    y -= 10;
  }

  // Stats box
  y -= 10;
  const boxH = 50;
  page.drawRectangle({ x: M, y: y - boxH, width: CW, height: boxH, color: C.bg, borderColor: C.border, borderWidth: 0.5 });

  const livingCount = persons.filter(p => p.is_alive).length;
  const stats = [
    { label: 'Personnes', value: persons.length.toString() },
    { label: 'Vivantes', value: livingCount.toString() },
    { label: 'Décédées', value: (persons.length - livingCount).toString() },
    { label: 'Unions', value: unions.length.toString() },
  ];

  const sw = CW / stats.length;
  stats.forEach((s, i) => {
    const cx = M + sw * i + sw / 2;
    const vw = fontBold.widthOfTextAtSize(s.value, 18);
    page.drawText(s.value, { x: cx - vw / 2, y: y - 22, size: 18, font: fontBold, color: C.primary });
    const lw = font.widthOfTextAtSize(s.label, 8);
    page.drawText(s.label, { x: cx - lw / 2, y: y - 35, size: 8, font, color: C.muted });
  });

  y -= boxH + 20;

  // Export date
  const exportStr = `Exporté le ${format(new Date(), 'dd MMMM yyyy à HH:mm', { locale: fr })}`;
  const ew = font.widthOfTextAtSize(exportStr, 8);
  page.drawText(exportStr, { x: (W - ew) / 2, y, size: 8, font, color: C.muted });

  // ===== TREE VISUALIZATION =====
  if (includeTree && persons.length > 0) {
    page = pdfDoc.addPage([W, H]);
    y = H - M;

    // Section title bar
    page.drawRectangle({ x: M, y: y - 10, width: 4, height: 14, color: C.secondary });
    page.drawText("Vue de l'arbre", { x: M + 10, y: y - 7, size: 15, font: fontBold, color: C.text });
    y -= 30;

    const rootPerson = tree.root_person_id ? persons.find(p => p.id === tree.root_person_id) : persons[0];
    if (rootPerson) {
      drawSimplifiedTree(page, rootPerson, getChildren, genderColor, font, fontBold, M, y, CW);
    }
  }

  // ===== DETAILED PERSONS =====
  if (includeDetails) {
    page = pdfDoc.addPage([W, H]);
    y = H - M;

    page.drawRectangle({ x: M, y: y - 10, width: 4, height: 14, color: C.secondary });
    page.drawText('Fiches individuelles', { x: M + 10, y: y - 7, size: 15, font: fontBold, color: C.text });
    y -= 30;

    const sorted = [...persons].sort((a, b) => {
      if (a.birth_date && b.birth_date) return new Date(a.birth_date).getTime() - new Date(b.birth_date).getTime();
      return `${a.last_name} ${a.first_names}`.localeCompare(`${b.last_name} ${b.first_names}`);
    });

    for (const person of sorted) {
      const cardH = 80;
      if (y - cardH < M) {
        page = pdfDoc.addPage([W, H]);
        y = H - M;
      }

      const cardY = y - cardH;

      // Card bg + border
      page.drawRectangle({ x: M, y: cardY, width: CW, height: cardH, color: C.white, borderColor: C.border, borderWidth: 0.5 });

      // Gender bar
      page.drawRectangle({ x: M, y: cardY, width: 3, height: cardH, color: genderColor(person.gender) });

      // Avatar circle
      const ax = M + 18;
      const ay = cardY + cardH - 18;
      page.drawCircle({ x: ax, y: ay, size: 10, color: genderColor(person.gender) });
      const initials = `${person.first_names[0] || ''}${person.last_name[0] || ''}`.toUpperCase();
      const iw = fontBold.widthOfTextAtSize(initials, 9);
      page.drawText(initials, { x: ax - iw / 2, y: ay - 3, size: 9, font: fontBold, color: C.white });

      // Name
      const nx = M + 35;
      page.drawText(`${person.first_names} ${person.last_name}`, { x: nx, y: cardY + cardH - 14, size: 12, font: fontBold, color: C.text });

      // Maiden name
      let infoY = cardY + cardH - 28;
      if (person.maiden_name && person.maiden_name !== person.last_name) {
        page.drawText(`née ${person.maiden_name}`, { x: nx, y: infoY, size: 8, font: fontItalic, color: C.muted });
        infoY -= 12;
      }

      // Deceased badge
      if (!person.is_alive) {
        const age = calcAge(person);
        const badge = age ? `Décédé(e) à ${age} ans` : 'Décédé(e)';
        const bw = font.widthOfTextAtSize(badge, 7) + 8;
        const bx = M + CW - bw - 8;
        page.drawRectangle({ x: bx, y: cardY + cardH - 16, width: bw, height: 10, color: C.muted });
        page.drawText(badge, { x: bx + 4, y: cardY + cardH - 13, size: 7, font, color: C.white });
      }

      // Info rows (left column)
      if (person.birth_date || person.birth_place) {
        page.drawText('Naissance:', { x: nx, y: infoY, size: 8, font: fontBold, color: C.text });
        const bi = [fmtDate(person.birth_date), person.birth_place].filter(Boolean).join(' à ');
        page.drawText(bi || '-', { x: nx + 50, y: infoY, size: 8, font, color: C.muted });
        infoY -= 11;
      }

      if (!person.is_alive && (person.death_date || person.death_place)) {
        page.drawText('Décès:', { x: nx, y: infoY, size: 8, font: fontBold, color: C.text });
        const di = [fmtDate(person.death_date), person.death_place].filter(Boolean).join(' à ');
        page.drawText(di || '-', { x: nx + 50, y: infoY, size: 8, font, color: C.muted });
        infoY -= 11;
      }

      if (person.occupation) {
        page.drawText('Profession:', { x: nx, y: infoY, size: 8, font: fontBold, color: C.text });
        page.drawText(person.occupation, { x: nx + 50, y: infoY, size: 8, font, color: C.muted });
      }

      // Relations (right column)
      const rx = M + CW / 2;
      let ry = cardY + cardH - 28;

      const parents = getParents(person.id);
      if (parents.length > 0) {
        page.drawText('Parents:', { x: rx, y: ry, size: 8, font: fontBold, color: C.text });
        const pt = parents.map(p => `${p.first_names} ${p.last_name}`).join(', ');
        const maxRW = CW / 2 - 55;
        const ptTrunc = font.widthOfTextAtSize(pt, 8) > maxRW ? pt.substring(0, 40) + '...' : pt;
        page.drawText(ptTrunc, { x: rx + 45, y: ry, size: 8, font, color: C.muted });
        ry -= 11;
      }

      const spouses = getSpouses(person.id);
      if (spouses.length > 0) {
        page.drawText('Conjoint(s):', { x: rx, y: ry, size: 8, font: fontBold, color: C.text });
        const st = spouses.map(s => `${s.first_names} ${s.last_name}`).join(', ');
        const stTrunc = font.widthOfTextAtSize(st, 8) > CW / 2 - 55 ? st.substring(0, 35) + '...' : st;
        page.drawText(stTrunc, { x: rx + 55, y: ry, size: 8, font, color: C.muted });
        ry -= 11;
      }

      const children = getChildren(person.id);
      if (children.length > 0) {
        page.drawText('Enfants:', { x: rx, y: ry, size: 8, font: fontBold, color: C.text });
        const ct = children.map(c => `${c.first_names} ${c.last_name}`).join(', ');
        const ctTrunc = font.widthOfTextAtSize(ct, 8) > CW / 2 - 55 ? ct.substring(0, 35) + '...' : ct;
        page.drawText(ctTrunc, { x: rx + 45, y: ry, size: 8, font, color: C.muted });
      }

      y -= cardH + 8;
    }
  }

  // Footer on all pages
  const pages = pdfDoc.getPages();
  const total = pages.length;
  pages.forEach((p, i) => {
    const footerText = `${tree.name} - Page ${i + 1}/${total}`;
    const fw = font.widthOfTextAtSize(footerText, 7);
    p.drawText(footerText, { x: (W - fw) / 2, y: 20, size: 7, font, color: C.muted });
  });

  // Save
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes.buffer], { type: 'application/pdf' });
  const a = document.createElement('a');
  a.href = url;
  a.download = `arbre-${tree.name.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function drawSimplifiedTree(
  page: any,
  rootPerson: FamilyPerson,
  getChildren: (id: string) => FamilyPerson[],
  genderColor: (g: string | null) => any,
  font: any,
  fontBold: any,
  startX: number,
  startY: number,
  width: number
) {
  const nodeW = 100;
  const nodeH = 22;
  const levelH = 45;
  const visited = new Set<string>();
  const positions: { person: FamilyPerson; x: number; y: number }[] = [];

  const layout = (person: FamilyPerson, level: number, minX: number, maxX: number): number => {
    if (visited.has(person.id) || level > 4) return (minX + maxX) / 2;
    visited.add(person.id);

    const children = getChildren(person.id);
    if (children.length === 0) {
      const x = (minX + maxX) / 2 - nodeW / 2;
      positions.push({ person, x, y: startY - level * levelH });
      return x + nodeW / 2;
    }

    const cw = (maxX - minX) / children.length;
    let total = 0;
    children.forEach((child, i) => {
      total += layout(child, level + 1, minX + i * cw, minX + (i + 1) * cw);
    });

    const x = total / children.length - nodeW / 2;
    positions.push({ person, x, y: startY - level * levelH });
    return x + nodeW / 2;
  };

  layout(rootPerson, 0, startX, startX + width);

  // Draw connections
  for (const pos of positions) {
    const children = getChildren(pos.person.id);
    for (const child of children) {
      const cp = positions.find(p => p.person.id === child.id);
      if (cp) {
        const px = pos.x + nodeW / 2;
        const py = pos.y;
        const cx = cp.x + nodeW / 2;
        const cy = cp.y + nodeH;
        const midY = (py + cy) / 2;
        page.drawLine({ start: { x: px, y: py }, end: { x: px, y: midY }, thickness: 0.5, color: C.secondary });
        page.drawLine({ start: { x: px, y: midY }, end: { x: cx, y: midY }, thickness: 0.5, color: C.secondary });
        page.drawLine({ start: { x: cx, y: midY }, end: { x: cx, y: cy }, thickness: 0.5, color: C.secondary });
      }
    }
  }

  // Draw nodes
  for (const pos of positions) {
    const gc = genderColor(pos.person.gender);
    page.drawRectangle({ x: pos.x, y: pos.y, width: nodeW, height: nodeH, color: gc });

    const firstName = pos.person.first_names.split(' ')[0];
    const display = firstName.length > 12 ? firstName.substring(0, 11) + '.' : firstName;
    const fw = fontBold.widthOfTextAtSize(display, 7);
    page.drawText(display, { x: pos.x + (nodeW - fw) / 2, y: pos.y + 13, size: 7, font: fontBold, color: C.white });

    const ln = pos.person.last_name.length > 14 ? pos.person.last_name.substring(0, 13) + '.' : pos.person.last_name;
    const lw = font.widthOfTextAtSize(ln, 6);
    page.drawText(ln, { x: pos.x + (nodeW - lw) / 2, y: pos.y + 5, size: 6, font, color: C.white });
  }
}

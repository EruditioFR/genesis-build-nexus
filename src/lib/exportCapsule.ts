import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getSignedUrl } from './signedUrlCache';

interface CapsuleExportData {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  capsule_type: string;
  status: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

interface MediaExportData {
  id: string;
  file_url: string;
  file_type: string;
  file_name: string | null;
  caption: string | null;
}

interface SharedCircleData {
  id: string;
  name: string;
}

interface CommentExportData {
  id: string;
  content: string;
  created_at: string;
  user_name: string | null;
}

const COLORS = {
  primary: rgb(30 / 255, 58 / 255, 95 / 255),
  text: rgb(0, 0, 0),
  muted: rgb(100 / 255, 100 / 255, 100 / 255),
  separator: rgb(200 / 255, 200 / 255, 200 / 255),
  footer: rgb(150 / 255, 150 / 255, 150 / 255),
};

/** Simple word-wrap that splits text into lines fitting within maxWidth */
function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const test = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(test, fontSize);
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length ? lines : [''];
}

/** Strip basic HTML tags for plain-text export */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function buildCapsulePdf(
  capsule: CapsuleExportData,
  medias: MediaExportData[],
  sharedCircles: SharedCircleData[],
  comments: CommentExportData[] = []
): Promise<PDFDocument> {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const margin = 56; // ~20mm
  const contentWidth = pageWidth - margin * 2;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const ensureSpace = (needed: number) => {
    if (y - needed < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
  };

  const drawText = (text: string, fontSize: number, options: { font?: any; color?: any; maxWidth?: number } = {}) => {
    const font = options.font || helvetica;
    const color = options.color || COLORS.text;
    const maxW = options.maxWidth || contentWidth;
    const lines = wrapText(text, font, fontSize, maxW);

    for (const line of lines) {
      ensureSpace(fontSize + 4);
      page.drawText(line, { x: margin, y, size: fontSize, font, color });
      y -= fontSize * 1.4;
    }
    y -= 4;
  };

  // Title
  drawText(capsule.title, 22, { font: helveticaBold, color: COLORS.primary });
  y -= 8;

  // Metadata
  const formattedDate = format(new Date(capsule.created_at), 'd MMMM yyyy', { locale: fr });
  const typeLabels: Record<string, string> = { text: 'Texte', photo: 'Photo', video: 'Vidéo', audio: 'Audio', mixed: 'Mixte' };
  const statusLabels: Record<string, string> = { draft: 'Brouillon', published: 'Publiée', scheduled: 'Programmée', archived: 'Archivée' };
  const metaLine = `Type: ${typeLabels[capsule.capsule_type] || capsule.capsule_type} • Statut: ${statusLabels[capsule.status] || capsule.status} • Créée le ${formattedDate}`;
  drawText(metaLine, 9, { color: COLORS.muted });
  y -= 6;

  // Separator
  ensureSpace(10);
  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.5, color: COLORS.separator });
  y -= 16;

  // Description
  if (capsule.description) {
    drawText('Description', 13, { font: helveticaBold });
    drawText(stripHtml(capsule.description), 10);
    y -= 8;
  }

  // Content
  if (capsule.content) {
    drawText('Contenu', 13, { font: helveticaBold });
    drawText(stripHtml(capsule.content), 10);
    y -= 8;
  }

  // Tags
  if (capsule.tags && capsule.tags.length > 0) {
    drawText('Tags', 13, { font: helveticaBold });
    drawText(capsule.tags.join(', '), 10);
    y -= 8;
  }

  // Shared circles
  if (sharedCircles.length > 0) {
    drawText('Partagé avec', 13, { font: helveticaBold });
    drawText(sharedCircles.map(c => c.name).join(', '), 10);
    y -= 8;
  }

  // Comments
  if (comments.length > 0) {
    drawText('Commentaires', 13, { font: helveticaBold });
    y -= 4;
    for (const comment of comments) {
      const commentDate = format(new Date(comment.created_at), 'd MMM yyyy à HH:mm', { locale: fr });
      const author = comment.user_name || 'Anonyme';
      drawText(`${author} - ${commentDate}`, 9, { font: helveticaBold, color: COLORS.muted });
      drawText(comment.content, 9);
      y -= 4;
    }
    y -= 4;
  }

  // Medias
  if (medias.length > 0) {
    drawText('Médias', 13, { font: helveticaBold });
    medias.forEach((media, index) => {
      const info = `${index + 1}. ${media.file_name || 'Fichier'} (${media.file_type})${media.caption ? ` - ${media.caption}` : ''}`;
      drawText(info, 9);
    });
  }

  // Footer on all pages
  const pages = pdfDoc.getPages();
  for (const p of pages) {
    p.drawText(
      `Exporté depuis Family Garden le ${format(new Date(), 'd MMMM yyyy à HH:mm', { locale: fr })}`,
      { x: margin, y: 28, size: 7, font: helvetica, color: COLORS.footer }
    );
  }

  return pdfDoc;
}

export async function exportCapsuleToPDF(
  capsule: CapsuleExportData,
  medias: MediaExportData[],
  sharedCircles: SharedCircleData[]
): Promise<void> {
  const pdfDoc = await buildCapsulePdf(capsule, medias, sharedCircles);
  const pdfBytes = await pdfDoc.save();

  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `capsule-${capsule.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportCapsuleToZIP(
  capsule: CapsuleExportData,
  medias: MediaExportData[],
  sharedCircles: SharedCircleData[],
  comments: CommentExportData[] = []
): Promise<void> {
  const zip = new JSZip();

  // Generate PDF
  const pdfDoc = await buildCapsulePdf(capsule, medias, sharedCircles, comments);
  const pdfBytes = await pdfDoc.save();
  zip.file('souvenir.pdf', pdfBytes);

  // Add capsule metadata as JSON
  const metadata = {
    id: capsule.id,
    title: capsule.title,
    description: capsule.description,
    content: capsule.content,
    type: capsule.capsule_type,
    status: capsule.status,
    tags: capsule.tags,
    created_at: capsule.created_at,
    updated_at: capsule.updated_at,
    shared_with: sharedCircles.map(c => c.name),
    comments: comments.map(c => ({
      content: c.content,
      author: c.user_name,
      date: c.created_at,
    })),
    medias: medias.map(m => ({
      file_name: m.file_name,
      file_type: m.file_type,
      caption: m.caption,
      original_url: m.file_url,
    })),
    exported_at: new Date().toISOString(),
  };
  zip.file('capsule.json', JSON.stringify(metadata, null, 2));

  // Add readable text version
  let readableContent = `# ${capsule.title}\n\n`;
  readableContent += `Type: ${capsule.capsule_type}\n`;
  readableContent += `Statut: ${capsule.status}\n`;
  readableContent += `Créée le: ${format(new Date(capsule.created_at), 'd MMMM yyyy', { locale: fr })}\n\n`;
  if (capsule.description) readableContent += `## Description\n${capsule.description}\n\n`;
  if (capsule.content) readableContent += `## Contenu\n${capsule.content}\n\n`;
  if (capsule.tags?.length) readableContent += `## Tags\n${capsule.tags.join(', ')}\n\n`;
  if (sharedCircles.length > 0) readableContent += `## Partagé avec\n${sharedCircles.map(c => c.name).join(', ')}\n\n`;
  if (medias.length > 0) {
    readableContent += `## Médias\n`;
    medias.forEach((media, index) => {
      readableContent += `${index + 1}. ${media.file_name || 'Fichier'} (${media.file_type})`;
      if (media.caption) readableContent += ` - ${media.caption}`;
      readableContent += '\n';
    });
  }
  zip.file('capsule.md', readableContent);

  // Download media files
  if (medias.length > 0) {
    const mediasFolder = zip.folder('medias');
    for (let i = 0; i < medias.length; i++) {
      const media = medias[i];
      try {
        const signedUrl = await getSignedUrl('capsule-medias', media.file_url, 3600);
        if (!signedUrl) continue;
        const response = await fetch(signedUrl);
        if (response.ok) {
          const blob = await response.blob();
          const extension = media.file_type.split('/')[1] || 'bin';
          const fileName = media.file_name || `media-${i + 1}.${extension}`;
          mediasFolder?.file(fileName, blob);
        }
      } catch (error) {
        console.error(`Failed to download media: ${media.file_url}`, error);
      }
    }
  }

  // Generate and download ZIP
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `capsule-${capsule.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

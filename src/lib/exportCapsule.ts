import jsPDF from 'jspdf';
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

export async function exportCapsuleToPDF(
  capsule: CapsuleExportData,
  medias: MediaExportData[],
  sharedCircles: SharedCircleData[]
): Promise<void> {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Helper to add text with word wrap
  const addText = (text: string, fontSize: number, isBold = false, color: [number, number, number] = [0, 0, 0]) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    pdf.setTextColor(...color);
    const lines = pdf.splitTextToSize(text, contentWidth);
    
    lines.forEach((line: string) => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(line, margin, y);
      y += fontSize * 0.5;
    });
    y += 5;
  };

  // Title
  addText(capsule.title, 24, true, [30, 58, 95]);
  y += 5;

  // Metadata line
  const formattedDate = format(new Date(capsule.created_at), 'd MMMM yyyy', { locale: fr });
  const typeLabels: Record<string, string> = {
    text: 'Texte',
    photo: 'Photo',
    video: 'Vidéo',
    audio: 'Audio',
    mixed: 'Mixte',
  };
  const statusLabels: Record<string, string> = {
    draft: 'Brouillon',
    published: 'Publiée',
    scheduled: 'Programmée',
    archived: 'Archivée',
  };

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Type: ${typeLabels[capsule.capsule_type] || capsule.capsule_type} • Statut: ${statusLabels[capsule.status] || capsule.status} • Créée le ${formattedDate}`, margin, y);
  y += 15;

  // Separator
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 15;

  // Description
  if (capsule.description) {
    addText('Description', 14, true);
    addText(capsule.description, 11);
    y += 10;
  }

  // Content
  if (capsule.content) {
    addText('Contenu', 14, true);
    addText(capsule.content, 11);
    y += 10;
  }

  // Tags
  if (capsule.tags && capsule.tags.length > 0) {
    addText('Tags', 14, true);
    addText(capsule.tags.join(', '), 11);
    y += 10;
  }

  // Shared circles
  if (sharedCircles.length > 0) {
    addText('Partagé avec', 14, true);
    addText(sharedCircles.map(c => c.name).join(', '), 11);
    y += 10;
  }

  // Medias info
  if (medias.length > 0) {
    addText('Médias', 14, true);
    medias.forEach((media, index) => {
      const mediaInfo = `${index + 1}. ${media.file_name || 'Fichier'} (${media.file_type})${media.caption ? ` - ${media.caption}` : ''}`;
      addText(mediaInfo, 10);
    });
  }

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    `Exporté depuis TimeCapsule le ${format(new Date(), 'd MMMM yyyy à HH:mm', { locale: fr })}`,
    margin,
    285
  );

  // Save
  pdf.save(`capsule-${capsule.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`);
}

export async function exportCapsuleToZIP(
  capsule: CapsuleExportData,
  medias: MediaExportData[],
  sharedCircles: SharedCircleData[],
  comments: CommentExportData[] = []
): Promise<void> {
  const zip = new JSZip();

  // Generate PDF with all text content
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const addPdfText = (text: string, fontSize: number, isBold = false, color: [number, number, number] = [0, 0, 0]) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    pdf.setTextColor(...color);
    const lines = pdf.splitTextToSize(text, contentWidth);
    
    lines.forEach((line: string) => {
      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(line, margin, y);
      y += fontSize * 0.5;
    });
    y += 5;
  };

  // Title
  addPdfText(capsule.title, 24, true, [30, 58, 95]);
  y += 5;

  // Metadata
  const formattedDate = format(new Date(capsule.created_at), 'd MMMM yyyy', { locale: fr });
  const typeLabels: Record<string, string> = {
    text: 'Texte',
    photo: 'Photo',
    video: 'Vidéo',
    audio: 'Audio',
    mixed: 'Mixte',
  };
  const statusLabels: Record<string, string> = {
    draft: 'Brouillon',
    published: 'Publiée',
    scheduled: 'Programmée',
    archived: 'Archivée',
  };

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Type: ${typeLabels[capsule.capsule_type] || capsule.capsule_type} • Statut: ${statusLabels[capsule.status] || capsule.status} • Créée le ${formattedDate}`, margin, y);
  y += 15;

  // Separator
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 15;

  // Description
  if (capsule.description) {
    addPdfText('Description', 14, true);
    addPdfText(capsule.description, 11);
    y += 10;
  }

  // Content
  if (capsule.content) {
    addPdfText('Contenu', 14, true);
    addPdfText(capsule.content, 11);
    y += 10;
  }

  // Tags
  if (capsule.tags && capsule.tags.length > 0) {
    addPdfText('Mots-clés', 14, true);
    addPdfText(capsule.tags.join(', '), 11);
    y += 10;
  }

  // Shared circles
  if (sharedCircles.length > 0) {
    addPdfText('Partagé avec', 14, true);
    addPdfText(sharedCircles.map(c => c.name).join(', '), 11);
    y += 10;
  }

  // Comments section
  if (comments.length > 0) {
    addPdfText('Commentaires', 14, true);
    y += 5;
    comments.forEach((comment) => {
      const commentDate = format(new Date(comment.created_at), 'd MMM yyyy à HH:mm', { locale: fr });
      const author = comment.user_name || 'Anonyme';
      addPdfText(`${author} - ${commentDate}`, 10, true, [80, 80, 80]);
      addPdfText(comment.content, 10);
      y += 5;
    });
  }

  // Medias info
  if (medias.length > 0) {
    addPdfText('Médias', 14, true);
    medias.forEach((media, index) => {
      const mediaInfo = `${index + 1}. ${media.file_name || 'Fichier'} (${media.file_type})${media.caption ? ` - ${media.caption}` : ''}`;
      addPdfText(mediaInfo, 10);
    });
  }

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    `Exporté depuis TimeCapsule le ${format(new Date(), 'd MMMM yyyy à HH:mm', { locale: fr })}`,
    margin,
    285
  );

  // Add PDF to ZIP
  const pdfBlob = pdf.output('blob');
  zip.file('souvenir.pdf', pdfBlob);

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

  // Add a readable text version
  let readableContent = `# ${capsule.title}\n\n`;
  readableContent += `Type: ${capsule.capsule_type}\n`;
  readableContent += `Statut: ${capsule.status}\n`;
  readableContent += `Créée le: ${format(new Date(capsule.created_at), 'd MMMM yyyy', { locale: fr })}\n\n`;

  if (capsule.description) {
    readableContent += `## Description\n${capsule.description}\n\n`;
  }

  if (capsule.content) {
    readableContent += `## Contenu\n${capsule.content}\n\n`;
  }

  if (capsule.tags && capsule.tags.length > 0) {
    readableContent += `## Tags\n${capsule.tags.join(', ')}\n\n`;
  }

  if (sharedCircles.length > 0) {
    readableContent += `## Partagé avec\n${sharedCircles.map(c => c.name).join(', ')}\n\n`;
  }

  if (medias.length > 0) {
    readableContent += `## Médias\n`;
    medias.forEach((media, index) => {
      readableContent += `${index + 1}. ${media.file_name || 'Fichier'} (${media.file_type})`;
      if (media.caption) readableContent += ` - ${media.caption}`;
      readableContent += '\n';
    });
  }

  zip.file('capsule.md', readableContent);

  // Create medias folder and download media files
  if (medias.length > 0) {
    const mediasFolder = zip.folder('medias');
    
    for (let i = 0; i < medias.length; i++) {
      const media = medias[i];
      try {
        // Generate signed URL for the media file
        const signedUrl = await getSignedUrl('capsule-medias', media.file_url, 3600);
        
        if (!signedUrl) {
          console.error(`Failed to get signed URL for: ${media.file_url}`);
          continue;
        }
        
        const response = await fetch(signedUrl);
        if (response.ok) {
          const blob = await response.blob();
          const extension = media.file_type.split('/')[1] || 'bin';
          const fileName = media.file_name || `media-${i + 1}.${extension}`;
          mediasFolder?.file(fileName, blob);
        } else {
          console.error(`Failed to fetch media: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Failed to download media: ${media.file_url}`, error);
      }
    }
  }

  // Generate and download
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

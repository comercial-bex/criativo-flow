import jsPDF from 'jspdf';

interface RoteiroData {
  titulo: string;
  cliente_id?: string;
  projeto_id?: string;
  plataforma: string;
  duracao_prevista_seg: number;
  objetivo: string;
  tom: string[];
  estilo: string[];
  roteiro_markdown: string;
  pilares_mensagem: string[];
  publico_alvo: string[];
  versao?: number;
}

export function exportRoteiroToPDF(roteiro: RoteiroData): Blob {
  const doc = new jsPDF();
  let yPosition = 20;
  const lineHeight = 7;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('🎬 Roteiro Audiovisual', margin, yPosition);
  yPosition += lineHeight * 2;

  // Metadata
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const metadata = [
    `Título: ${roteiro.titulo}`,
    `Plataforma: ${roteiro.plataforma}`,
    `Duração: ${roteiro.duracao_prevista_seg}s`,
    `Versão: ${roteiro.versao || 1}`,
    `Data: ${new Date().toLocaleDateString('pt-BR')}`,
  ];

  metadata.forEach(line => {
    doc.text(line, margin, yPosition);
    yPosition += lineHeight;
  });

  yPosition += lineHeight;

  // Separator
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += lineHeight;

  // Objetivo
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('🎯 Objetivo', margin, yPosition);
  yPosition += lineHeight;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const objetivoLines = doc.splitTextToSize(roteiro.objetivo, maxWidth);
  doc.text(objetivoLines, margin, yPosition);
  yPosition += (objetivoLines.length * lineHeight) + lineHeight;

  // Tom & Estilo
  if (roteiro.tom.length > 0 || roteiro.estilo.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('🎭 Tom & Estilo', margin, yPosition);
    yPosition += lineHeight;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (roteiro.tom.length > 0) {
      doc.text(`Tom: ${roteiro.tom.join(', ')}`, margin, yPosition);
      yPosition += lineHeight;
    }
    if (roteiro.estilo.length > 0) {
      doc.text(`Estilo: ${roteiro.estilo.join(', ')}`, margin, yPosition);
      yPosition += lineHeight;
    }
    yPosition += lineHeight / 2;
  }

  // Público-alvo
  if (roteiro.publico_alvo.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('👥 Público-alvo', margin, yPosition);
    yPosition += lineHeight;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(roteiro.publico_alvo.join(', '), margin, yPosition);
    yPosition += lineHeight * 2;
  }

  // Separator
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += lineHeight;

  // Roteiro (Markdown convertido)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('📝 Roteiro', margin, yPosition);
  yPosition += lineHeight;

  // Process markdown content
  const markdownLines = roteiro.roteiro_markdown.split('\n');
  doc.setFontSize(10);

  markdownLines.forEach(line => {
    // Check if we need a new page
    if (yPosition > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPosition = margin;
    }

    // Handle headers
    if (line.startsWith('# ')) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      const text = line.replace('# ', '');
      doc.text(text, margin, yPosition);
      yPosition += lineHeight * 1.5;
      doc.setFontSize(10);
    } else if (line.startsWith('## ')) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const text = line.replace('## ', '');
      doc.text(text, margin, yPosition);
      yPosition += lineHeight * 1.3;
      doc.setFontSize(10);
    } else if (line.startsWith('### ')) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const text = line.replace('### ', '');
      doc.text(text, margin, yPosition);
      yPosition += lineHeight;
      doc.setFontSize(10);
    } else if (line.startsWith('**') && line.endsWith('**')) {
      doc.setFont('helvetica', 'bold');
      const text = line.replace(/\*\*/g, '');
      const wrappedLines = doc.splitTextToSize(text, maxWidth);
      doc.text(wrappedLines, margin, yPosition);
      yPosition += wrappedLines.length * lineHeight;
    } else if (line.startsWith('- ')) {
      doc.setFont('helvetica', 'normal');
      const text = '• ' + line.replace('- ', '');
      const wrappedLines = doc.splitTextToSize(text, maxWidth);
      doc.text(wrappedLines, margin, yPosition);
      yPosition += wrappedLines.length * lineHeight;
    } else if (line.startsWith('---')) {
      yPosition += lineHeight / 2;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += lineHeight;
    } else if (line.trim() !== '') {
      doc.setFont('helvetica', 'normal');
      const wrappedLines = doc.splitTextToSize(line, maxWidth);
      doc.text(wrappedLines, margin, yPosition);
      yPosition += wrappedLines.length * lineHeight;
    } else {
      yPosition += lineHeight / 2;
    }
  });

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Página ${i} de ${pageCount} • Gerado em ${new Date().toLocaleString('pt-BR')}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}

export function downloadRoteiroAsPDF(roteiro: RoteiroData) {
  const pdfBlob = exportRoteiroToPDF(roteiro);
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `roteiro_${roteiro.titulo.toLowerCase().replace(/\s+/g, '_')}_v${roteiro.versao || 1}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

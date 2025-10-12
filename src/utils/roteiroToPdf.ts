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
  logo_url?: string;
  cliente_nome?: string;
  agencia?: string;
  produtora?: string;
}

export async function exportRoteiroToPDF(roteiro: RoteiroData): Promise<Blob> {
  const doc = new jsPDF();
  let yPosition = 20;
  const lineHeight = 7;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);

  // 🔵 Cabeçalho Azul com Logo
  doc.setFillColor(219, 234, 254); // blue-100
  doc.rect(0, 0, pageWidth, 55, 'F');

  // Logo (se existir)
  if (roteiro.logo_url) {
    try {
      const response = await fetch(roteiro.logo_url);
      const blob = await response.blob();
      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onload = () => {
          const imgData = reader.result as string;
          doc.addImage(imgData, 'PNG', margin, yPosition, 35, 15);
          resolve(true);
        };
        reader.readAsDataURL(blob);
      });
      yPosition += 20;
    } catch (error) {
      console.error('Erro ao carregar logo:', error);
      yPosition += 5;
    }
  }

  // Título Principal
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138); // blue-900
  doc.text(`🎬 ${roteiro.titulo}`, margin, yPosition);
  yPosition += lineHeight * 1.5;

  // Tabela de Informações Técnicas
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 64, 175); // blue-800
  
  const infoLines = [
    [`Cliente: ${roteiro.cliente_nome || 'N/A'}`, `Agência: ${roteiro.agencia || 'BEX Communication'}`],
    [`Peça: ${roteiro.duracao_prevista_seg}s`, `Produtora: ${roteiro.produtora || 'INSPIRE FILMES'}`],
    [`Versão: ${roteiro.versao || 1}`, `Data: ${new Date().toLocaleDateString('pt-BR')}`],
  ];

  infoLines.forEach(([left, right]) => {
    doc.text(left, margin, yPosition);
    doc.text(right, pageWidth / 2 + 10, yPosition);
    yPosition += lineHeight;
  });

  yPosition += lineHeight;

  // 🟢 Seção Verde - Contexto
  doc.setFillColor(220, 252, 231); // green-100
  doc.rect(margin, yPosition, maxWidth, 25, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52); // green-800
  yPosition += 7;
  doc.text('🎯 Objetivo:', margin + 2, yPosition);
  yPosition += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 83, 45); // green-900
  const objetivoLines = doc.splitTextToSize(roteiro.objetivo, maxWidth - 4);
  doc.text(objetivoLines, margin + 2, yPosition);
  yPosition += (objetivoLines.length * lineHeight) + 5;
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52);
  doc.text(`🎭 Tom: ${Array.isArray(roteiro.tom) ? roteiro.tom.join(', ') : roteiro.tom}`, margin + 2, yPosition);
  yPosition += lineHeight * 2;

  // Separator
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += lineHeight;

  // Roteiro com Cores
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('📝 Roteiro', margin, yPosition);
  yPosition += lineHeight * 1.5;

  const markdownLines = roteiro.roteiro_markdown.split('\n');
  doc.setFontSize(10);

  markdownLines.forEach(line => {
    if (yPosition > doc.internal.pageSize.getHeight() - margin - 10) {
      doc.addPage();
      yPosition = margin;
    }

    const trimmed = line.trim();
    
    // 🟣 Roxo - CENA X
    if (/^CENA\s+\d+/i.test(trimmed) || /^###\s+CENA/i.test(trimmed)) {
      doc.setFillColor(233, 213, 255); // purple-200
      doc.rect(margin - 2, yPosition - 5, maxWidth + 4, lineHeight + 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(88, 28, 135); // purple-900
      const text = trimmed.replace(/^###\s+/, '');
      doc.text(text, margin, yPosition);
      yPosition += lineHeight + 2;
      doc.setTextColor(0, 0, 0);
      return;
    }
    
    // 🟠 Laranja - ON
    if (/Locução em ON:|em plano|cenário/i.test(trimmed)) {
      doc.setFillColor(254, 215, 170); // orange-200
      doc.rect(margin - 2, yPosition - 5, maxWidth + 4, lineHeight + 2, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(154, 52, 18); // orange-900
      const wrappedLines = doc.splitTextToSize(trimmed, maxWidth - 2);
      doc.text(wrappedLines, margin, yPosition);
      yPosition += wrappedLines.length * lineHeight + 2;
      doc.setTextColor(0, 0, 0);
      return;
    }
    
    // 🟡 Amarelo - OFF
    if (/Locução em OFF:|Imagens de|Abertura com/i.test(trimmed)) {
      doc.setFillColor(254, 240, 138); // yellow-200
      doc.rect(margin - 2, yPosition - 5, maxWidth + 4, lineHeight + 2, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(133, 77, 14); // yellow-900
      const wrappedLines = doc.splitTextToSize(trimmed, maxWidth - 2);
      doc.text(wrappedLines, margin, yPosition);
      yPosition += wrappedLines.length * lineHeight + 2;
      doc.setTextColor(0, 0, 0);
      return;
    }
    
    // 🔴 Vermelho - CTA
    if (/Tela final|CTA:|hashtag|#\w+/i.test(trimmed)) {
      doc.setFillColor(254, 202, 202); // red-200
      doc.rect(margin - 2, yPosition - 5, maxWidth + 4, lineHeight + 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(127, 29, 29); // red-900
      const wrappedLines = doc.splitTextToSize(trimmed, maxWidth - 2);
      doc.text(wrappedLines, margin, yPosition);
      yPosition += wrappedLines.length * lineHeight + 2;
      doc.setTextColor(0, 0, 0);
      return;
    }
    
    // ⚫ Cinza - Observações técnicas
    if (/\(.*\)|plano:|câmera:|luz:|som:/i.test(trimmed)) {
      doc.setFillColor(229, 231, 235); // gray-200
      doc.rect(margin - 2, yPosition - 5, maxWidth + 4, lineHeight + 2, 'F');
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(75, 85, 99); // gray-600
      const wrappedLines = doc.splitTextToSize(trimmed, maxWidth - 2);
      doc.text(wrappedLines, margin, yPosition);
      yPosition += wrappedLines.length * lineHeight + 2;
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      return;
    }

    // Headers markdown
    if (trimmed.startsWith('# ')) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(trimmed.replace('# ', ''), margin, yPosition);
      yPosition += lineHeight * 1.5;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      return;
    }

    if (trimmed.startsWith('## ')) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(trimmed.replace('## ', ''), margin, yPosition);
      yPosition += lineHeight * 1.3;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      return;
    }

    if (trimmed.startsWith('---')) {
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += lineHeight;
      return;
    }

    if (trimmed) {
      doc.setFont('helvetica', 'normal');
      const wrappedLines = doc.splitTextToSize(trimmed, maxWidth);
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

export async function downloadRoteiroAsPDF(roteiro: RoteiroData) {
  const pdfBlob = await exportRoteiroToPDF(roteiro);
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `roteiro_${roteiro.titulo.toLowerCase().replace(/\s+/g, '_')}_v${roteiro.versao || 1}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

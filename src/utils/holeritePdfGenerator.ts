import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface HoleriteData {
  colaborador: {
    nome_completo: string;
    cpf_cnpj: string;
    cargo_atual?: string;
    regime: string;
  };
  competencia: string;
  base_calculo: number;
  proventos: Array<{ nome: string; valor: number; faixas?: any }>;
  descontos: Array<{ nome: string; valor: number; faixas?: any }>;
  encargos: Array<{ nome: string; valor: number }>;
  total_proventos: number;
  total_descontos: number;
  liquido: number;
}

export function gerarHoleritePDF(data: HoleriteData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cabeçalho da empresa
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BEX COMMUNICATION', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Recibo de Pagamento de Salário', pageWidth / 2, 28, { align: 'center' });

  // Linha divisória
  doc.setLineWidth(0.5);
  doc.line(15, 32, pageWidth - 15, 32);

  // Dados do colaborador
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO COLABORADOR', 15, 40);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Nome: ${data.colaborador.nome_completo}`, 15, 46);
  doc.text(`CPF/CNPJ: ${data.colaborador.cpf_cnpj}`, 15, 52);
  doc.text(`Cargo: ${data.colaborador.cargo_atual || 'N/A'}`, 15, 58);
  doc.text(`Regime: ${data.colaborador.regime.toUpperCase()}`, 15, 64);

  // Competência
  const [ano, mes] = data.competencia.split('-');
  const competenciaFormatada = `${mes}/${ano}`;
  doc.text(`Competência: ${competenciaFormatada}`, pageWidth - 15, 46, { align: 'right' });

  // Tabela de Proventos
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PROVENTOS', 15, 75);

  const proventosData = data.proventos.map((p) => [
    p.nome,
    `R$ ${p.valor.toFixed(2).replace('.', ',')}`,
  ]);

  autoTable(doc, {
    startY: 78,
    head: [['Descrição', 'Valor']],
    body: proventosData,
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 140 },
      1: { cellWidth: 40, halign: 'right' },
    },
  });

  // Tabela de Descontos
  let currentY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DESCONTOS', 15, currentY);

  const descontosData = data.descontos.map((d) => [
    d.nome,
    `R$ ${d.valor.toFixed(2).replace('.', ',')}`,
  ]);

  autoTable(doc, {
    startY: currentY + 3,
    head: [['Descrição', 'Valor']],
    body: descontosData,
    theme: 'grid',
    headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 140 },
      1: { cellWidth: 40, halign: 'right' },
    },
  });

  // Resumo
  currentY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');

  doc.text('Total de Proventos:', 15, currentY);
  doc.text(`R$ ${data.total_proventos.toFixed(2).replace('.', ',')}`, pageWidth - 15, currentY, { align: 'right' });

  currentY += 6;
  doc.text('Total de Descontos:', 15, currentY);
  doc.text(`R$ ${data.total_descontos.toFixed(2).replace('.', ',')}`, pageWidth - 15, currentY, { align: 'right' });

  currentY += 8;
  doc.setFontSize(12);
  doc.setTextColor(0, 128, 0);
  doc.text('VALOR LÍQUIDO:', 15, currentY);
  doc.text(`R$ ${data.liquido.toFixed(2).replace('.', ',')}`, pageWidth - 15, currentY, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  // Rodapé
  currentY += 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Este documento foi gerado eletronicamente e não possui valor legal sem assinatura digital.', pageWidth / 2, currentY, { align: 'center' });

  currentY += 15;
  doc.setFont('helvetica', 'normal');
  doc.line(15, currentY, 90, currentY);
  doc.text('Assinatura do Empregador', 15, currentY + 5);

  doc.line(pageWidth - 90, currentY, pageWidth - 15, currentY);
  doc.text('Assinatura do Empregado', pageWidth - 90, currentY + 5);

  // Data de emissão
  const dataEmissao = new Date().toLocaleDateString('pt-BR');
  doc.setFontSize(7);
  doc.text(`Emitido em: ${dataEmissao}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

  return doc;
}

export function downloadHolerite(data: HoleriteData) {
  const doc = gerarHoleritePDF(data);
  const [ano, mes] = data.competencia.split('-');
  const nomeArquivo = `holerite_${data.colaborador.nome_completo.replace(/\s+/g, '_')}_${mes}_${ano}.pdf`;
  doc.save(nomeArquivo);
}

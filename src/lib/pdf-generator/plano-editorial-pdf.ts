import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';

export async function generatePlanoEditorialPDF(planejamentoId: string) {
  // Buscar dados do planejamento
  const { data: planejamento, error: planError } = await supabase
    .from('planejamentos')
    .select(`
      *,
      clientes (nome),
      responsavel:pessoas!planejamentos_responsavel_id_fkey (nome)
    `)
    .eq('id', planejamentoId)
    .single();

  if (planError) throw planError;

  // Buscar posts
  const { data: posts, error: postsError } = await supabase
    .from('posts_planejamento')
    .select(`
      *,
      responsavel:pessoas!posts_planejamento_responsavel_id_fkey (nome)
    `)
    .eq('planejamento_id', planejamentoId)
    .order('data_postagem', { ascending: true });

  if (postsError) throw postsError;

  // Criar PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Header com logo BEX (texto simulado)
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 107, 255); // Azul BEX
  doc.text('BEX', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('PLANO EDITORIAL MENSAL', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  
  // Informações do Cabeçalho
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  const info = [
    `Cliente: ${planejamento.clientes?.nome || 'Sem cliente'}`,
    `Período: ${new Date(planejamento.mes_referencia).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
    `Responsável: ${planejamento.responsavel?.nome || 'Não atribuído'}`,
    `Status: ${planejamento.status_plano || 'Em andamento'}`,
    `Data de Criação: ${new Date(planejamento.created_at).toLocaleDateString('pt-BR')}`
  ];

  info.forEach(line => {
    doc.text(line, 20, yPosition);
    yPosition += 7;
  });

  yPosition += 10;

  // Sumário Visual - Estatísticas
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('📊 SUMÁRIO VISUAL', 20, yPosition);
  yPosition += 10;

  const tipoStats = posts?.reduce((acc: any, post: any) => {
    const tipo = post.tipo_criativo || 'outro';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {}) || {};

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Total de Posts Planejados: ${posts?.length || 0}`, 25, yPosition);
  yPosition += 6;
  doc.text(`• Reels: ${tipoStats.reels || 0} | Cards: ${tipoStats.card || 0} | Stories: ${tipoStats.story || 0} | Carrossel: ${tipoStats.carrossel || 0}`, 25, yPosition);
  
  yPosition += 15;

  // Tabela de Posts
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('📝 BLOCOS DE POSTAGENS', 20, yPosition);
  yPosition += 5;

  const tableData = posts?.map((post: any, index: number) => [
    `#${String(index + 1).padStart(2, '0')}`,
    new Date(post.data_postagem).toLocaleDateString('pt-BR'),
    post.tipo_criativo || '-',
    post.objetivo_postagem || '-',
    (post.legenda || 'Sem legenda').substring(0, 50) + '...',
    post.responsavel?.nome || '-'
  ]) || [];

  autoTable(doc, {
    startY: yPosition,
    head: [['#', 'Data', 'Criativo', 'Objetivo', 'Legenda', 'Responsável']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 107, 255], // Azul BEX
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 60 },
      5: { cellWidth: 30 }
    }
  });

  // Observações
  const finalY = (doc as any).lastAutoTable.finalY || yPosition;
  yPosition = finalY + 15;

  if (planejamento.observacoes_estrategista) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('💬 OBSERVAÇÕES FINAIS', 20, yPosition);
    yPosition += 7;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const observacoes = doc.splitTextToSize(planejamento.observacoes_estrategista, pageWidth - 40);
    doc.text(observacoes, 20, yPosition);
    yPosition += observacoes.length * 5 + 10;
  }

  // Assinatura
  if (yPosition > doc.internal.pageSize.getHeight() - 40) {
    doc.addPage();
    yPosition = 20;
  }

  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('✍️ AGÊNCIA BEX', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Documento gerado em ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });

  // Salvar PDF
  const fileName = `Plano_Editorial_${planejamento.clientes?.nome || 'Cliente'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

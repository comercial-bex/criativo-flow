import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function exportarParaPDF(posts: any[], clienteNome: string, mesReferencia: Date) {
  const doc = new jsPDF();
  
  // Cabeçalho
  doc.setFontSize(16);
  doc.text('Plano Editorial', 14, 20);
  doc.setFontSize(12);
  doc.text(`Cliente: ${clienteNome}`, 14, 28);
  doc.text(`Mês: ${format(mesReferencia, 'MMMM yyyy', { locale: ptBR })}`, 14, 34);
  
  // Tabela de posts
  const tableData = posts.map(post => [
    format(new Date(post.data_postagem), 'dd/MM', { locale: ptBR }),
    post.formato_postagem || '-',
    post.tipo_conteudo || '-',
    (post.texto_estruturado || post.texto_ia || '-').substring(0, 50) + '...',
    post.observacoes || '-'
  ]);

  autoTable(doc, {
    head: [['Data', 'Formato', 'Tipo', 'Texto', 'Observações']],
    body: tableData,
    startY: 40,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [79, 70, 229] },
  });

  doc.save(`plano-editorial-${clienteNome}-${format(mesReferencia, 'MM-yyyy')}.pdf`);
}

export function exportarParaCSV(posts: any[], clienteNome: string, mesReferencia: Date) {
  const headers = ['Data', 'Formato', 'Tipo', 'Texto', 'Objetivo', 'Responsável', 'Status', 'Observações'];
  
  const rows = posts.map(post => [
    format(new Date(post.data_postagem), 'dd/MM/yyyy', { locale: ptBR }),
    post.formato_postagem || '',
    post.tipo_conteudo || '',
    (post.texto_estruturado || post.texto_ia || '').replace(/"/g, '""'),
    post.objetivo_postagem || '',
    post.responsavel_nome || '',
    post.status_post || '',
    (post.observacoes || '').replace(/"/g, '""')
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `plano-editorial-${clienteNome}-${format(mesReferencia, 'MM-yyyy')}.csv`;
  link.click();
}

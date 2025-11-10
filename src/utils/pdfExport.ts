import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

// Função auxiliar para carregar logo
async function carregarLogoBEX(logoUrl: string): Promise<string | null> {
  try {
    if (!logoUrl) return null;
    
    // Se for uma URL completa, buscar diretamente
    if (logoUrl.startsWith('http')) {
      const response = await fetch(logoUrl);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    }
    
    // Se for um caminho local, buscar do public
    const response = await fetch(logoUrl);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Erro ao carregar logo:', error);
    return null;
  }
}

// Função auxiliar para buscar dados da empresa
async function buscarDadosEmpresa() {
  try {
    const { data, error } = await supabase
      .from('configuracoes_empresa')
      .select('*')
      .maybeSingle();
    
    if (error) throw error;
    
    return data || {
      razao_social: 'BEX Communication',
      nome_fantasia: 'BEX Communication',
      cnpj: 'N/A',
      endereco_completo: 'N/A',
      telefone: 'N/A',
      email: 'contato@bexcommunication.com.br',
      website: 'www.bexcommunication.com.br',
      banco_nome: 'N/A',
      agencia: 'N/A',
      conta: 'N/A',
      pix_chave: 'N/A',
      pix_tipo: 'email',
      logo_url: '/logo-bex-apk.svg'
    };
  } catch (error) {
    console.error('Erro ao buscar dados da empresa:', error);
    return {
      razao_social: 'BEX Communication',
      nome_fantasia: 'BEX Communication',
      cnpj: 'N/A',
      endereco_completo: 'N/A',
      telefone: 'N/A',
      email: 'contato@bexcommunication.com.br',
      website: 'www.bexcommunication.com.br',
      banco_nome: 'N/A',
      banco_codigo: 'N/A',
      agencia: 'N/A',
      conta: 'N/A',
      pix_chave: 'N/A',
      pix_tipo: 'email',
      logo_url: '/logo-bex-apk.svg'
    };
  }
}

export const gerarPDFOrcamento = async (orcamento: any, itens: any[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Buscar dados da empresa
  const empresa = await buscarDadosEmpresa();
  const logoBase64 = await carregarLogoBEX(empresa.logo_url || '/logo-bex-apk.svg');
  
  let yPos = 15;
  
  // ========== CABEÇALHO COM LOGO ==========
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 15, yPos, 30, 30);
    } catch (error) {
      console.error('Erro ao adicionar logo ao PDF:', error);
    }
  }
  
  // Título e número do orçamento
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(195, 240, 18); // Verde BEX
  doc.text('ORÇAMENTO', pageWidth - 15, yPos + 10, { align: 'right' });
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Nº ${orcamento.numero || 'N/A'}`, pageWidth - 15, yPos + 18, { align: 'right' });
  
  yPos += 35;
  
  // ========== DADOS DA EMPRESA ==========
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(empresa.razao_social || 'BEX Communication', 15, yPos);
  doc.text(`CNPJ: ${empresa.cnpj || 'N/A'}`, 15, yPos + 5);
  doc.text(`${empresa.telefone || 'N/A'} | ${empresa.email || 'N/A'}`, 15, yPos + 10);
  
  // Data e validade
  doc.text(`Emissão: ${format(new Date(orcamento.created_at), "dd/MM/yyyy")}`, pageWidth - 15, yPos, { align: 'right' });
  if (orcamento.data_validade) {
    doc.text(`Validade: ${format(new Date(orcamento.data_validade), "dd/MM/yyyy")}`, pageWidth - 15, yPos + 5, { align: 'right' });
  }
  
  yPos += 20;
  
  // ========== LINHA DIVISÓRIA ==========
  doc.setDrawColor(195, 240, 18);
  doc.setLineWidth(0.5);
  doc.line(15, yPos, pageWidth - 15, yPos);
  
  yPos += 8;
  
  // ========== DADOS DO CLIENTE ==========
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE', 15, yPos);
  
  yPos += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`Nome/Razão Social: ${orcamento.clientes?.nome || 'N/A'}`, 15, yPos);
  yPos += 5;
  
  if (orcamento.clientes?.cnpj_cpf) {
    doc.text(`CNPJ/CPF: ${orcamento.clientes.cnpj_cpf}`, 15, yPos);
    yPos += 5;
  }
  
  if (orcamento.clientes?.endereco) {
    doc.text(`Endereço: ${orcamento.clientes.endereco}`, 15, yPos);
    yPos += 5;
  }
  
  const contatoInfo = [];
  if (orcamento.contato_tel) contatoInfo.push(`Tel: ${orcamento.contato_tel}`);
  if (orcamento.contato_email) contatoInfo.push(`Email: ${orcamento.contato_email}`);
  
  if (contatoInfo.length > 0) {
    doc.text(contatoInfo.join('  |  '), 15, yPos);
    yPos += 5;
  }
  
  yPos += 5;
  
  // ========== LINHA DIVISÓRIA ==========
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(15, yPos, pageWidth - 15, yPos);
  
  yPos += 8;
  
  // ========== DESCRIÇÃO DOS SERVIÇOS ==========
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIÇÃO DOS SERVIÇOS', 15, yPos);
  
  yPos += 5;
  
  // Tabela melhorada de itens
  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Descrição', 'Qtd', 'Unid.', 'Valor Unit.', 'Desc.', 'Total']],
    body: itens.map((item, index) => [
      (index + 1).toString(),
      item.descricao || '',
      item.quantidade?.toString() || '0',
      item.unidade || 'un',
      `R$ ${(item.preco_unitario || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `${(item.desconto_percent || 0)}%`,
      `R$ ${(item.subtotal_item || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    ]),
    styles: { 
      fontSize: 8,
      cellPadding: 3
    },
    headStyles: { 
      fillColor: [195, 240, 18],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 70 },
      2: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 30, halign: 'right' }
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // ========== TOTAIS ==========
  const xTotal = pageWidth - 65;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  doc.text('Subtotal:', xTotal, yPos);
  doc.text(`R$ ${(orcamento.subtotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, pageWidth - 15, yPos, { align: 'right' });
  
  if (orcamento.descontos > 0) {
    yPos += 5;
    doc.text('Descontos:', xTotal, yPos);
    doc.text(`- R$ ${(orcamento.descontos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, pageWidth - 15, yPos, { align: 'right' });
  }
  
  if (orcamento.impostos > 0) {
    yPos += 5;
    doc.text('Impostos:', xTotal, yPos);
    doc.text(`R$ ${(orcamento.impostos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, pageWidth - 15, yPos, { align: 'right' });
  }
  
  yPos += 8;
  
  // Linha acima do total
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(xTotal, yPos - 2, pageWidth - 15, yPos - 2);
  
  // TOTAL em destaque
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(195, 240, 18);
  doc.text('VALOR TOTAL:', xTotal, yPos + 3);
  doc.text(`R$ ${(orcamento.valor_final || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, pageWidth - 15, yPos + 3, { align: 'right' });
  
  doc.setTextColor(0, 0, 0);
  yPos += 15;
  
  // Verificar se precisa de nova página
  if (yPos > pageHeight - 100) {
    doc.addPage();
    yPos = 20;
  }
  
  // ========== CONDIÇÕES DE PAGAMENTO ==========
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDIÇÕES DE PAGAMENTO', 15, yPos);
  
  yPos += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  if (orcamento.condicoes_pagamento) {
    const condicoesSplit = doc.splitTextToSize(orcamento.condicoes_pagamento, pageWidth - 30);
    doc.text(condicoesSplit, 15, yPos);
    yPos += condicoesSplit.length * 5 + 5;
  } else {
    doc.text('A combinar', 15, yPos);
    yPos += 10;
  }
  
  // ========== DADOS BANCÁRIOS ==========
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS BANCÁRIOS PARA PAGAMENTO', 15, yPos);
  
  yPos += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  if (empresa.banco_nome && empresa.banco_nome !== 'N/A') {
    doc.text(`Banco: ${empresa.banco_nome}${empresa.banco_codigo ? ` (${empresa.banco_codigo})` : ''}`, 15, yPos);
    yPos += 5;
    doc.text(`Agência: ${empresa.agencia || 'N/A'}  |  Conta: ${empresa.conta || 'N/A'}`, 15, yPos);
    yPos += 5;
  }
  
  if (empresa.pix_chave && empresa.pix_chave !== 'N/A') {
    doc.setFont('helvetica', 'bold');
    doc.text(`PIX (${empresa.pix_tipo || 'chave'}): ${empresa.pix_chave}`, 15, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 10;
  } else {
    yPos += 5;
  }
  
  // ========== OBSERVAÇÕES ==========
  if (orcamento.observacoes) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVAÇÕES', 15, yPos);
    
    yPos += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const obsSplit = doc.splitTextToSize(orcamento.observacoes, pageWidth - 30);
    doc.text(obsSplit, 15, yPos);
    yPos += obsSplit.length * 5 + 10;
  }
  
  // Verificar se precisa de nova página
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = 20;
  }
  
  // ========== VALIDADE EM DESTAQUE ==========
  if (orcamento.data_validade) {
    doc.setFillColor(255, 255, 200);
    doc.rect(15, yPos - 3, pageWidth - 30, 12, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(200, 0, 0);
    
    doc.text(
      `⚠ VALIDADE: Este orçamento é válido até ${format(new Date(orcamento.data_validade), "dd/MM/yyyy")}`,
      pageWidth / 2,
      yPos + 3,
      { align: 'center' }
    );
    
    doc.setTextColor(0, 0, 0);
    yPos += 20;
  }
  
  // ========== ÁREA DE ASSINATURA ==========
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ACEITE DO ORÇAMENTO', 15, yPos);
  
  yPos += 10;
  doc.setFont('helvetica', 'normal');
  
  // Linha para assinatura do cliente
  doc.line(15, yPos + 15, 90, yPos + 15);
  doc.setFontSize(8);
  doc.text('Assinatura do Cliente', 15, yPos + 20);
  doc.text('Data: ___/___/______', 15, yPos + 25);
  
  // Linha para assinatura da BEX
  doc.line(pageWidth - 90, yPos + 15, pageWidth - 15, yPos + 15);
  doc.text(empresa.razao_social || 'BEX Communication', pageWidth - 90, yPos + 20);
  doc.text('Representante Legal', pageWidth - 90, yPos + 25);
  
  // ========== RODAPÉ EM TODAS AS PÁGINAS ==========
  const totalPages = doc.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    
    // Linha superior do rodapé
    doc.setDrawColor(200, 200, 200);
    doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
    
    // Texto do rodapé
    doc.text(
      `${empresa.razao_social || 'BEX Communication'} | ${empresa.email || 'N/A'} | ${empresa.telefone || 'N/A'}`,
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    );
    
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth - 15,
      pageHeight - 10,
      { align: 'right' }
    );
    
    doc.text(
      `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`,
      15,
      pageHeight - 10
    );
  }
  
  // Salvar PDF
  doc.save(`Orcamento-${orcamento.numero || format(new Date(), "yyyyMMdd")}.pdf`);
};

export const gerarPDFProposta = (proposta: any, itens: any[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cabeçalho
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("PROPOSTA COMERCIAL", pageWidth / 2, 20, { align: "center" });

  // Informações do documento
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Proposta Nº: ${proposta.numero || "N/A"}`, 14, 35);
  doc.text(`Data: ${format(new Date(proposta.created_at), "dd/MM/yyyy")}`, 14, 42);
  if (proposta.data_validade) {
    doc.text(`Validade: ${format(new Date(proposta.data_validade), "dd/MM/yyyy")}`, 14, 49);
  }

  // Dados do cliente
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("CLIENTE:", 14, 60);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(proposta.clientes?.nome || "N/A", 14, 67);
  if (proposta.clientes?.cnpj_cpf) {
    doc.text(`CNPJ/CPF: ${proposta.clientes.cnpj_cpf}`, 14, 74);
  }

  // Tabela de itens
  autoTable(doc, {
    startY: 85,
    head: [["Item", "Descrição", "Qtd", "Valor Unit.", "Subtotal"]],
    body: itens.map((item, index) => [
      (index + 1).toString(),
      item.descricao || "",
      item.quantidade?.toString() || "0",
      `R$ ${(item.preco_unitario || 0).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      `R$ ${(item.subtotal_item || 0).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
    ]),
    styles: {
      fontSize: 9,
    },
    headStyles: {
      fillColor: [195, 240, 18],
      textColor: [0, 0, 0],
    },
  });

  // Totais
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(
    `Subtotal: R$ ${(proposta.subtotal || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}`,
    14,
    finalY
  );
  doc.text(
    `Descontos: R$ ${(proposta.descontos || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}`,
    14,
    finalY + 7
  );
  doc.text(
    `Impostos: R$ ${(proposta.impostos || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}`,
    14,
    finalY + 14
  );

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Valor Total: R$ ${(proposta.valor_final || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}`,
    14,
    finalY + 25
  );

  // Condições de pagamento
  if (proposta.condicoes_pagamento) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Condições de Pagamento:", 14, finalY + 40);
    doc.setFont("helvetica", "normal");
    doc.text(proposta.condicoes_pagamento, 14, finalY + 47);
  }

  doc.save(`Proposta-${proposta.numero || format(new Date(), "yyyyMMdd")}.pdf`);
};

export const gerarPDFContrato = (contrato: any, itens: any[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Cabeçalho
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS", pageWidth / 2, 20, {
    align: "center",
  });

  // Informações do documento
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Contrato Nº: ${contrato.numero || "N/A"}`, 14, 35);
  doc.text(`Data: ${format(new Date(contrato.created_at), "dd/MM/yyyy")}`, 14, 42);

  // Dados do cliente
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("CONTRATANTE:", 14, 55);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(contrato.clientes?.nome || "N/A", 14, 62);
  if (contrato.clientes?.cnpj_cpf) {
    doc.text(`CNPJ/CPF: ${contrato.clientes.cnpj_cpf}`, 14, 69);
  }

  // Escopo
  if (contrato.escopo_servicos) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("ESCOPO DOS SERVIÇOS:", 14, 80);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const scopeText = doc.splitTextToSize(contrato.escopo_servicos, pageWidth - 28);
    doc.text(scopeText, 14, 87);
  }

  // Tabela de itens
  autoTable(doc, {
    startY: 110,
    head: [["Item", "Descrição", "Qtd", "Valor Unit.", "Subtotal"]],
    body: itens.map((item, index) => [
      (index + 1).toString(),
      item.descricao || "",
      item.quantidade?.toString() || "0",
      `R$ ${(item.preco_unitario || 0).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
      `R$ ${(item.subtotal_item || 0).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
      })}`,
    ]),
    styles: {
      fontSize: 9,
    },
    headStyles: {
      fillColor: [195, 240, 18],
      textColor: [0, 0, 0],
    },
  });

  // Total e pagamento
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Valor Total: R$ ${(contrato.valor_total || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}`,
    14,
    finalY
  );

  if (contrato.forma_pagamento) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Forma de Pagamento:", 14, finalY + 15);
    doc.setFont("helvetica", "normal");
    doc.text(contrato.forma_pagamento, 14, finalY + 22);
  }

  doc.save(`Contrato-${contrato.numero || format(new Date(), "yyyyMMdd")}.pdf`);
};

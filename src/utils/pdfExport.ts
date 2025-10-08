import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const gerarPDFOrcamento = (orcamento: any, itens: any[]) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text("ORÇAMENTO", 105, 20, { align: "center" });

  // Informações do documento
  doc.setFontSize(10);
  doc.text(`Número: ${orcamento.numero || "N/A"}`, 20, 35);
  doc.text(`Data: ${format(new Date(orcamento.created_at), "dd/MM/yyyy", { locale: ptBR })}`, 20, 42);
  if (orcamento.data_validade) {
    doc.text(`Validade: ${format(new Date(orcamento.data_validade), "dd/MM/yyyy", { locale: ptBR })}`, 20, 49);
  }

  // Cliente
  doc.setFontSize(12);
  doc.text("Cliente:", 20, 60);
  doc.setFontSize(10);
  doc.text(orcamento.clientes?.nome || "N/A", 20, 67);
  if (orcamento.clientes?.cnpj_cpf) {
    doc.text(`CNPJ/CPF: ${orcamento.clientes.cnpj_cpf}`, 20, 74);
  }

  // Tabela de itens
  autoTable(doc, {
    startY: 85,
    head: [["Item", "Qtd", "Un.", "Preço Unit.", "Desc%", "Total"]],
    body: itens.map((item) => [
      item.descricao || "",
      item.quantidade?.toString() || "0",
      item.unidade || "un",
      `R$ ${(item.preco_unitario || 0).toFixed(2)}`,
      `${(item.desconto_percent || 0)}%`,
      `R$ ${(item.subtotal_item || 0).toFixed(2)}`,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  // Totais
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Subtotal: R$ ${(orcamento.subtotal || 0).toFixed(2)}`, 140, finalY);
  if (orcamento.descontos > 0) {
    doc.text(`Descontos: R$ ${(orcamento.descontos || 0).toFixed(2)}`, 140, finalY + 7);
  }
  if (orcamento.impostos > 0) {
    doc.text(`Impostos: R$ ${(orcamento.impostos || 0).toFixed(2)}`, 140, finalY + 14);
  }
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text(`TOTAL: R$ ${(orcamento.total || 0).toFixed(2)}`, 140, finalY + 24);

  // Observações
  if (orcamento.observacoes) {
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text("Observações:", 20, finalY + 40);
    const splitText = doc.splitTextToSize(orcamento.observacoes, 170);
    doc.text(splitText, 20, finalY + 47);
  }

  doc.save(`orcamento-${orcamento.numero || "documento"}.pdf`);
};

export const gerarPDFProposta = (proposta: any, itens: any[]) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text("PROPOSTA COMERCIAL", 105, 20, { align: "center" });

  // Informações do documento
  doc.setFontSize(10);
  doc.text(`Número: ${proposta.numero || "N/A"}`, 20, 35);
  doc.text(`Data: ${format(new Date(proposta.created_at), "dd/MM/yyyy", { locale: ptBR })}`, 20, 42);
  if (proposta.validade) {
    doc.text(`Validade: ${format(new Date(proposta.validade), "dd/MM/yyyy", { locale: ptBR })}`, 20, 49);
  }

  // Cliente
  doc.setFontSize(12);
  doc.text("Cliente:", 20, 60);
  doc.setFontSize(10);
  doc.text(proposta.clientes?.nome || "N/A", 20, 67);
  if (proposta.clientes?.cnpj_cpf) {
    doc.text(`CNPJ/CPF: ${proposta.clientes.cnpj_cpf}`, 20, 74);
  }

  // Tabela de itens
  autoTable(doc, {
    startY: 85,
    head: [["Item", "Qtd", "Un.", "Preço Unit.", "Desc%", "Total"]],
    body: itens.map((item) => [
      item.descricao || "",
      item.quantidade?.toString() || "0",
      item.unidade || "un",
      `R$ ${(item.preco_unitario || 0).toFixed(2)}`,
      `${(item.desconto_percent || 0)}%`,
      `R$ ${(item.subtotal_item || 0).toFixed(2)}`,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [52, 152, 219] },
  });

  // Totais
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Subtotal: R$ ${(proposta.subtotal || 0).toFixed(2)}`, 140, finalY);
  if (proposta.descontos > 0) {
    doc.text(`Descontos: R$ ${(proposta.descontos || 0).toFixed(2)}`, 140, finalY + 7);
  }
  if (proposta.impostos > 0) {
    doc.text(`Impostos: R$ ${(proposta.impostos || 0).toFixed(2)}`, 140, finalY + 14);
  }
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text(`TOTAL: R$ ${(proposta.total || 0).toFixed(2)}`, 140, finalY + 24);

  // Condições de Pagamento
  if (proposta.condicoes_pagamento) {
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("Condições de Pagamento:", 20, finalY + 40);
    doc.setFont(undefined, "normal");
    const splitText = doc.splitTextToSize(proposta.condicoes_pagamento, 170);
    doc.text(splitText, 20, finalY + 47);
  }

  doc.save(`proposta-${proposta.numero || "documento"}.pdf`);
};

export const gerarPDFContrato = (contrato: any, itens: any[]) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS", 105, 20, { align: "center" });

  // Informações do documento
  doc.setFontSize(10);
  doc.text(`Contrato: ${contrato.numero || "N/A"}`, 20, 35);
  doc.text(`Data: ${format(new Date(contrato.created_at), "dd/MM/yyyy", { locale: ptBR })}`, 20, 42);
  if (contrato.vigencia_inicio && contrato.vigencia_fim) {
    doc.text(
      `Vigência: ${format(new Date(contrato.vigencia_inicio), "dd/MM/yyyy")} a ${format(
        new Date(contrato.vigencia_fim),
        "dd/MM/yyyy"
      )}`,
      20,
      49
    );
  }

  // Cliente
  doc.setFontSize(12);
  doc.text("CONTRATANTE:", 20, 60);
  doc.setFontSize(10);
  doc.text(contrato.clientes?.nome || "N/A", 20, 67);
  if (contrato.clientes?.cnpj_cpf) {
    doc.text(`CNPJ/CPF: ${contrato.clientes.cnpj_cpf}`, 20, 74);
  }

  // Escopo
  if (contrato.escopo_servicos) {
    doc.setFontSize(12);
    doc.text("ESCOPO DOS SERVIÇOS:", 20, 85);
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(contrato.escopo_servicos, 170);
    doc.text(splitText, 20, 92);
  }

  // Tabela de itens
  autoTable(doc, {
    startY: 120,
    head: [["Item", "Qtd", "Un.", "Valor"]],
    body: itens.map((item) => [
      item.descricao || "",
      item.quantidade?.toString() || "0",
      item.unidade || "un",
      `R$ ${(item.subtotal_item || 0).toFixed(2)}`,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [46, 125, 50] },
  });

  // Valor Total
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text(`VALOR TOTAL DO CONTRATO: R$ ${(contrato.valor_total || 0).toFixed(2)}`, 20, finalY);

  // Forma de Pagamento
  if (contrato.forma_pagamento) {
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.text("FORMA DE PAGAMENTO:", 20, finalY + 15);
    doc.setFont(undefined, "normal");
    const splitText = doc.splitTextToSize(contrato.forma_pagamento, 170);
    doc.text(splitText, 20, finalY + 22);
  }

  doc.save(`contrato-${contrato.numero || "documento"}.pdf`);
};

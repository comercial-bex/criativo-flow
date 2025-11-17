import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PropostaPDFData {
  proposta: any;
  itens: any[];
  empresa?: any;
  cliente?: any;
}

export async function gerarPropostaPDF(data: PropostaPDFData): Promise<jsPDF> {
  const { proposta, itens, empresa, cliente } = data;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Cores da marca BEX
  const primaryColor: [number, number, number] = [195, 240, 18]; // #C3F012
  const darkColor: [number, number, number] = [0, 0, 0];
  const grayColor: [number, number, number] = [128, 128, 128];

  // ============ CABEÇALHO COM LOGO ============
  if (empresa?.logo_url) {
    try {
      const logoImg = await loadImage(empresa.logo_url);
      doc.addImage(logoImg, "PNG", 14, yPosition, 40, 15);
    } catch (error) {
      console.error("Erro ao carregar logo:", error);
    }
  }

  // Informações da empresa no canto direito
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  const empresaInfo = [
    empresa?.nome || "BEX Communication",
    empresa?.telefone || "",
    empresa?.email || "",
    empresa?.site || "",
  ].filter(Boolean);
  
  empresaInfo.forEach((info, index) => {
    doc.text(info, pageWidth - 14, yPosition + (index * 4), { align: "right" });
  });

  yPosition += 30;

  // ============ TÍTULO PRINCIPAL ============
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkColor);
  doc.text("PROPOSTA COMERCIAL", pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 10;
  
  // Número da proposta em destaque
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text(`Nº ${proposta.numero || "---"}`, pageWidth / 2, yPosition, { align: "center" });
  
  if (proposta.versao && proposta.versao > 1) {
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.text(`Versão ${proposta.versao}`, pageWidth / 2, yPosition + 5, { align: "center" });
    yPosition += 5;
  }

  yPosition += 15;

  // ============ INFORMAÇÕES GERAIS ============
  const infoData = [
    ["Data de Emissão", format(new Date(proposta.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })],
    ["Validade", proposta.validade ? format(new Date(proposta.validade), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "30 dias"],
    ["Status", getStatusText(proposta.assinatura_status)],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [["Informação", "Detalhes"]],
    body: infoData,
    theme: "grid",
    headStyles: { 
      fillColor: primaryColor,
      textColor: darkColor,
      fontSize: 10,
      fontStyle: "bold"
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { cellWidth: 120 }
    },
    margin: { left: 14, right: 14 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // ============ DADOS DO CLIENTE ============
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkColor);
  doc.text("CLIENTE", 14, yPosition);
  
  yPosition += 7;

  const clienteData = [
    ["Razão Social / Nome", cliente?.nome || proposta.contato_nome || "---"],
    ["CNPJ/CPF", cliente?.cnpj_cpf || "---"],
    ["E-mail", cliente?.email || proposta.contato_email || "---"],
    ["Telefone", cliente?.telefone || proposta.contato_telefone || "---"],
    ["Endereço", cliente?.endereco || "---"],
  ];

  autoTable(doc, {
    startY: yPosition,
    body: clienteData,
    theme: "plain",
    bodyStyles: {
      fontSize: 9,
      cellPadding: 2
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50, textColor: grayColor },
      1: { cellWidth: 130 }
    },
    margin: { left: 14, right: 14 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 12;

  // ============ ESCOPO DOS SERVIÇOS ============
  if (proposta.descricao) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkColor);
    doc.text("ESCOPO DOS SERVIÇOS", 14, yPosition);
    
    yPosition += 7;
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayColor);
    const splitDesc = doc.splitTextToSize(proposta.descricao, pageWidth - 28);
    doc.text(splitDesc, 14, yPosition);
    yPosition += splitDesc.length * 5 + 8;
  }

  // Verificar se precisa de nova página
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = 20;
  }

  // ============ ITENS/SERVIÇOS ============
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkColor);
  doc.text("SERVIÇOS E PRODUTOS", 14, yPosition);
  
  yPosition += 7;

  const itensTableData = itens.map((item) => [
    item.descricao || item.produto_nome || "---",
    item.quantidade?.toString() || "1",
    formatCurrency(item.valor_unitario || 0),
    formatCurrency((item.quantidade || 1) * (item.valor_unitario || 0))
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Descrição", "Qtd", "Valor Unit.", "Subtotal"]],
    body: itensTableData,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: darkColor,
      fontSize: 10,
      fontStyle: "bold"
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 30, halign: "right" },
      3: { cellWidth: 32, halign: "right", fontStyle: "bold" }
    },
    margin: { left: 14, right: 14 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // ============ RESUMO FINANCEIRO ============
  const subtotal = Number(proposta.subtotal || 0);
  const descontos = Number(proposta.descontos || 0);
  const impostos = Number(proposta.impostos || 0);
  const total = Number(proposta.total || 0);

  const financeiroData = [
    ["Subtotal", formatCurrency(subtotal)],
    ...(descontos > 0 ? [["Descontos", `- ${formatCurrency(descontos)}`]] : []),
    ...(impostos > 0 ? [["Impostos", formatCurrency(impostos)]] : []),
  ];

  autoTable(doc, {
    startY: yPosition,
    body: financeiroData,
    theme: "plain",
    bodyStyles: {
      fontSize: 10,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 150, halign: "right", fontStyle: "bold" },
      1: { cellWidth: 32, halign: "right" }
    },
    margin: { left: 14, right: 14 }
  });

  yPosition = (doc as any).lastAutoTable.finalY + 3;

  // Total em destaque
  doc.setFillColor(...primaryColor);
  doc.rect(14, yPosition - 2, pageWidth - 28, 12, "F");
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkColor);
  doc.text("VALOR TOTAL", pageWidth - 60, yPosition + 6);
  doc.setFontSize(16);
  doc.text(formatCurrency(total), pageWidth - 14, yPosition + 6, { align: "right" });

  yPosition += 20;

  // ============ CONDIÇÕES DE PAGAMENTO ============
  if (proposta.condicoes_pagamento) {
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkColor);
    doc.text("CONDIÇÕES DE PAGAMENTO", 14, yPosition);
    
    yPosition += 7;
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayColor);
    const splitCond = doc.splitTextToSize(proposta.condicoes_pagamento, pageWidth - 28);
    doc.text(splitCond, 14, yPosition);
    yPosition += splitCond.length * 5 + 8;
  }

  // ============ OBSERVAÇÕES ============
  if (proposta.observacoes) {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkColor);
    doc.text("OBSERVAÇÕES", 14, yPosition);
    
    yPosition += 6;
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayColor);
    const splitObs = doc.splitTextToSize(proposta.observacoes, pageWidth - 28);
    doc.text(splitObs, 14, yPosition);
    yPosition += splitObs.length * 4 + 8;
  }

  // ============ ASSINATURA DIGITAL ============
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  yPosition = pageHeight - 50;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkColor);
  doc.text("ASSINATURA DIGITAL", pageWidth / 2, yPosition, { align: "center" });
  
  yPosition += 8;

  if (proposta.assinatura_status === "assinado" && proposta.assinatura_data) {
    // Assinatura válida
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayColor);
    doc.text(
      `Assinado digitalmente via GOV.br em ${format(new Date(proposta.assinatura_data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );
    
    if (proposta.assinante_nome) {
      yPosition += 5;
      doc.text(`Por: ${proposta.assinante_nome}`, pageWidth / 2, yPosition, { align: "center" });
    }

    if (proposta.assinante_cpf) {
      yPosition += 5;
      doc.text(`CPF: ${proposta.assinante_cpf}`, pageWidth / 2, yPosition, { align: "center" });
    }
  } else {
    // Aguardando assinatura
    doc.setDrawColor(...grayColor);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 40, yPosition, pageWidth / 2 + 40, yPosition);
    
    yPosition += 5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayColor);
    doc.text("Aguardando assinatura digital via GOV.br", pageWidth / 2, yPosition, { align: "center" });
  }

  // ============ RODAPÉ ============
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayColor);
    
    const footerText = `${empresa?.nome || "BEX Communication"} © ${new Date().getFullYear()} - Proposta Nº ${proposta.numero || "---"}`;
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" });
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 14, pageHeight - 10, { align: "right" });
  }

  return doc;
}

export async function downloadPropostaPDF(data: PropostaPDFData): Promise<void> {
  const pdf = await gerarPropostaPDF(data);
  const fileName = `proposta-${data.proposta.numero || "sem-numero"}-${format(new Date(), "yyyyMMdd")}.pdf`;
  pdf.save(fileName);
}

// Helpers
function loadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pendente: "Aguardando Envio",
    enviado: "Enviado ao Cliente",
    assinado: "✓ Assinado Digitalmente",
    recusado: "Recusado",
    expirado: "Expirado",
  };
  return statusMap[status] || status;
}

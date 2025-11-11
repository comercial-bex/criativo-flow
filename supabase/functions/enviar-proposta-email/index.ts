import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { proposta, itens, destinatario, assunto, mensagem } = await req.json();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY não configurada");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: empresa } = await supabase
      .from("configuracoes_empresa")
      .select("*")
      .single();

    const resend = new Resend(resendApiKey);

    const emailHtml = gerarHtmlEmail(proposta, itens, empresa, mensagem);

    const emailData = await resend.emails.send({
      from: empresa?.email_remetente || "BEX Communication <onboarding@resend.dev>",
      to: [destinatario],
      subject: assunto,
      html: emailHtml,
    });

    return new Response(JSON.stringify(emailData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Erro ao enviar e-mail:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function gerarHtmlEmail(proposta: any, itens: any[], empresa: any, mensagem: string): string {
  const subtotal = Number(proposta.subtotal || 0);
  const impostos = Number(proposta.impostos || 0);
  const descontos = Number(proposta.descontos || 0);
  const total = Number(proposta.total || 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
    .section { margin-bottom: 30px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .table th { background-color: #f4f4f4; padding: 12px; text-align: left; border-bottom: 2px solid #667eea; }
    .table td { padding: 12px; border-bottom: 1px solid #ddd; }
    .total { background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px; }
    .footer { background-color: #f4f4f4; padding: 20px; border-radius: 8px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PROPOSTA COMERCIAL</h1>
      <p style="font-size: 18px; margin: 10px 0;">${proposta.titulo}</p>
      <p style="font-size: 14px; margin: 5px 0;">Proposta Nº ${proposta.numero || "---"}</p>
      ${proposta.versao && proposta.versao > 1 ? `<p style="font-size: 14px;">Versão ${proposta.versao}</p>` : ""}
    </div>

    <div class="section">
      <p style="white-space: pre-wrap;">${mensagem}</p>
    </div>

    <div class="section">
      <h2 style="color: #667eea;">📋 Detalhes da Proposta</h2>
      <p><strong>Data de Emissão:</strong> ${formatDate(proposta.created_at)}</p>
      ${proposta.validade ? `<p><strong>Validade:</strong> ${formatDate(proposta.validade)}</p>` : ""}
      ${proposta.clientes?.nome ? `<p><strong>Cliente:</strong> ${proposta.clientes.nome}</p>` : ""}
    </div>

    <div class="section">
      <h2 style="color: #667eea;">📦 Serviços e Produtos</h2>
      <table class="table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th style="text-align: center;">Qtd</th>
            <th style="text-align: right;">Valor Unit.</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itens.map(item => `
            <tr>
              <td>${item.descricao}</td>
              <td style="text-align: center;">${item.quantidade}</td>
              <td style="text-align: right;">${formatCurrency(Number(item.preco_unitario))}</td>
              <td style="text-align: right;"><strong>${formatCurrency(Number(item.subtotal_item))}</strong></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>

    <div class="total">
      <table style="width: 100%;">
        <tr>
          <td><strong>Subtotal:</strong></td>
          <td style="text-align: right;">${formatCurrency(subtotal)}</td>
        </tr>
        ${descontos > 0 ? `
        <tr>
          <td><strong>Descontos:</strong></td>
          <td style="text-align: right; color: #f59e0b;">- ${formatCurrency(descontos)}</td>
        </tr>
        ` : ""}
        ${impostos > 0 ? `
        <tr>
          <td><strong>Impostos:</strong></td>
          <td style="text-align: right;">${formatCurrency(impostos)}</td>
        </tr>
        ` : ""}
        <tr>
          <td><h2 style="color: #667eea; margin: 10px 0;">VALOR TOTAL</h2></td>
          <td style="text-align: right;"><h2 style="color: #667eea; margin: 10px 0;">${formatCurrency(total)}</h2></td>
        </tr>
      </table>
    </div>

    ${proposta.condicoes_pagamento ? `
    <div class="section">
      <h2 style="color: #667eea;">💳 Condições de Pagamento</h2>
      <p style="white-space: pre-wrap;">${proposta.condicoes_pagamento}</p>
    </div>
    ` : ""}

    ${empresa ? `
    <div class="footer">
      <h3>${empresa.nome}</h3>
      ${empresa.cnpj ? `<p>CNPJ: ${empresa.cnpj}</p>` : ""}
      ${empresa.telefone ? `<p>Tel: ${empresa.telefone}</p>` : ""}
      ${empresa.email ? `<p>E-mail: ${empresa.email}</p>` : ""}
      ${empresa.endereco ? `<p>${empresa.endereco}</p>` : ""}
    </div>
    ` : ""}
  </div>
</body>
</html>
  `;
}

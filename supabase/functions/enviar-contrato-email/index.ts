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
    const { contrato, destinatario, assunto, mensagem } = await req.json();

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

    const emailHtml = gerarHtmlEmail(contrato, empresa, mensagem);

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

function gerarHtmlEmail(contrato: any, empresa: any, mensagem: string): string {
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

  const statusLabels: Record<string, string> = {
    rascunho: "Rascunho",
    aprovacao_interna: "Aprovação Interna",
    enviado_assinatura: "Enviado p/ Assinatura",
    assinado: "Assinado",
    vigente: "Vigente",
    encerrado: "Encerrado",
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
    .info-box { background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .valores { background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px; }
    .footer { background-color: #f4f4f4; padding: 20px; border-radius: 8px; margin-top: 30px; }
    .badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>
      <p style="font-size: 18px; margin: 10px 0;">${contrato.titulo}</p>
      ${contrato.numero ? `<p style="font-size: 14px; margin: 5px 0;">Contrato Nº ${contrato.numero}</p>` : ""}
      <span class="badge" style="background-color: rgba(255,255,255,0.2);">${statusLabels[contrato.status]}</span>
    </div>

    <div class="section">
      <p style="white-space: pre-wrap;">${mensagem}</p>
    </div>

    <div class="section">
      <h2 style="color: #667eea;">📄 Informações do Contrato</h2>
      <div class="info-box">
        <p><strong>Tipo:</strong> ${contrato.tipo === "recorrente" ? "Recorrente" : "Avulso"}</p>
        ${contrato.data_inicio ? `<p><strong>Data de Início:</strong> ${formatDate(contrato.data_inicio)}</p>` : ""}
        ${contrato.data_fim ? `<p><strong>Data de Término:</strong> ${formatDate(contrato.data_fim)}</p>` : ""}
        ${contrato.assinado_em ? `<p><strong>Data de Assinatura:</strong> ${formatDate(contrato.assinado_em)}</p>` : ""}
      </div>
    </div>

    ${contrato.clientes?.nome ? `
    <div class="section">
      <h2 style="color: #667eea;">🏢 Contratante</h2>
      <div class="info-box">
        <p><strong>Razão Social:</strong> ${contrato.clientes.nome}</p>
        ${contrato.clientes.cnpj_cpf ? `<p><strong>CNPJ/CPF:</strong> ${contrato.clientes.cnpj_cpf}</p>` : ""}
        ${contrato.clientes.email ? `<p><strong>E-mail:</strong> ${contrato.clientes.email}</p>` : ""}
        ${contrato.clientes.telefone ? `<p><strong>Telefone:</strong> ${contrato.clientes.telefone}</p>` : ""}
      </div>
    </div>
    ` : ""}

    ${contrato.descricao ? `
    <div class="section">
      <h2 style="color: #667eea;">📋 Objeto do Contrato</h2>
      <p style="white-space: pre-wrap;">${contrato.descricao}</p>
    </div>
    ` : ""}

    <div class="valores">
      <h2 style="color: #667eea;">💰 Valores</h2>
      ${contrato.valor_mensal ? `<p><strong>Valor Mensal:</strong> <span style="font-size: 20px; color: #667eea;">${formatCurrency(Number(contrato.valor_mensal))}</span></p>` : ""}
      ${contrato.valor_recorrente ? `<p><strong>Valor Recorrente:</strong> <span style="font-size: 20px; color: #10b981;">${formatCurrency(Number(contrato.valor_recorrente))}</span></p>` : ""}
      ${contrato.valor_avulso ? `<p><strong>Valor Avulso:</strong> <span style="font-size: 20px; color: #3b82f6;">${formatCurrency(Number(contrato.valor_avulso))}</span></p>` : ""}
    </div>

    ${contrato.condicoes_pagamento ? `
    <div class="section">
      <h2 style="color: #667eea;">💳 Condições de Pagamento</h2>
      <p style="white-space: pre-wrap;">${contrato.condicoes_pagamento}</p>
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

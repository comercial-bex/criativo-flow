import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orcamento, itens, destinatario, assunto, mensagem } = await req.json();

    console.log('Enviando orçamento por email:', {
      orcamento_id: orcamento.id,
      destinatario,
      assunto
    });

    // Verificar se a chave API do Resend está configurada
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY não configurado. Configure em Secrets.');
    }

    // Criar cliente Supabase para buscar dados da empresa
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados da empresa
    const { data: empresa } = await supabase
      .from('configuracoes_empresa')
      .select('*')
      .single();

    // Gerar HTML do email
    const emailHtml = gerarHtmlEmail(orcamento, itens, empresa, mensagem);

    // Enviar email usando Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${empresa?.razao_social || 'BEX Communication'} <onboarding@resend.dev>`,
        to: [destinatario],
        subject: assunto,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error('Erro ao enviar email via Resend:', errorText);
      throw new Error(`Falha ao enviar email: ${errorText}`);
    }

    const result = await resendResponse.json();
    console.log('Email enviado com sucesso:', result);

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Erro no envio de email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function gerarHtmlEmail(orcamento: any, itens: any[], empresa: any, mensagem: string): string {
  const total = orcamento.valor_final || 0;
  
  const itensHtml = itens.map((item, index) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px;">${index + 1}</td>
      <td style="padding: 12px 8px;">${item.descricao || 'N/A'}</td>
      <td style="padding: 12px 8px; text-align: center;">${item.quantidade || 0}</td>
      <td style="padding: 12px 8px; text-align: right;">R$ ${(item.preco_unitario || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
      <td style="padding: 12px 8px; text-align: right; font-weight: 600;">R$ ${(item.subtotal_item || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Orçamento #${orcamento.numero}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #C3F012 0%, #3B82F6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #000; margin: 0; font-size: 28px;">ORÇAMENTO</h1>
        <p style="color: #000; margin: 5px 0 0 0; font-size: 18px;">Nº ${orcamento.numero || 'N/A'}</p>
      </div>

      <div style="background: #f9fafb; padding: 20px; border-left: 4px solid #C3F012;">
        <p style="margin: 0; white-space: pre-wrap;">${mensagem}</p>
      </div>

      <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb;">
        <h2 style="color: #1f2937; border-bottom: 2px solid #C3F012; padding-bottom: 10px;">Detalhes do Orçamento</h2>
        
        <div style="margin: 20px 0;">
          <p><strong>Cliente:</strong> ${orcamento.clientes?.nome || 'N/A'}</p>
          <p><strong>Data de Emissão:</strong> ${new Date(orcamento.created_at).toLocaleDateString('pt-BR')}</p>
          ${orcamento.data_validade ? `<p><strong>Validade:</strong> ${new Date(orcamento.data_validade).toLocaleDateString('pt-BR')}</p>` : ''}
        </div>

        <h3 style="color: #1f2937; margin-top: 30px;">Serviços</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f3f4f6; border-bottom: 2px solid #C3F012;">
              <th style="padding: 12px 8px; text-align: left;">#</th>
              <th style="padding: 12px 8px; text-align: left;">Descrição</th>
              <th style="padding: 12px 8px; text-align: center;">Qtd</th>
              <th style="padding: 12px 8px; text-align: right;">Valor Unit.</th>
              <th style="padding: 12px 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itensHtml}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <p style="font-size: 24px; color: #C3F012; font-weight: bold; margin: 0;">
            TOTAL: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        ${empresa?.pix_chave ? `
          <div style="background: #fef3c7; padding: 20px; margin-top: 30px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0;">Dados para Pagamento - PIX</h3>
            <p style="margin: 5px 0;"><strong>Tipo:</strong> ${empresa.pix_tipo || 'Chave'}</p>
            <p style="margin: 5px 0; font-family: monospace; font-size: 16px;"><strong>Chave:</strong> ${empresa.pix_chave}</p>
          </div>
        ` : ''}

        ${orcamento.observacoes ? `
          <div style="margin-top: 30px;">
            <h3 style="color: #1f2937;">Observações</h3>
            <p style="white-space: pre-wrap;">${orcamento.observacoes}</p>
          </div>
        ` : ''}
      </div>

      <div style="background: #1f2937; color: #fff; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
        <p style="margin: 5px 0;">${empresa?.razao_social || 'BEX Communication'}</p>
        <p style="margin: 5px 0; font-size: 14px;">${empresa?.email || 'contato@bexcommunication.com.br'} | ${empresa?.telefone || ''}</p>
        ${empresa?.website ? `<p style="margin: 5px 0; font-size: 14px;">${empresa.website}</p>` : ''}
      </div>
    </body>
    </html>
  `;
}

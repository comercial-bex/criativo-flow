import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Iniciando processamento de emails agendados");

    // Criar client do Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar emails pendentes para enviar
    const now = new Date().toISOString();
    const { data: emailsPendentes, error: fetchError } = await supabase
      .from("emails_agendados")
      .select("*")
      .eq("status", "pendente")
      .lte("agendar_para", now)
      .limit(10); // Processar no máximo 10 por execução

    if (fetchError) {
      console.error("❌ Erro ao buscar emails:", fetchError);
      throw fetchError;
    }

    if (!emailsPendentes || emailsPendentes.length === 0) {
      console.log("✅ Nenhum email pendente para enviar");
      return new Response(
        JSON.stringify({ message: "Nenhum email pendente", processados: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📧 ${emailsPendentes.length} email(s) pendente(s) encontrado(s)`);

    let enviados = 0;
    let erros = 0;

    // Processar cada email
    for (const email of emailsPendentes) {
      try {
        console.log(`📨 Processando email ${email.id} (tipo: ${email.tipo})`);

        // Preparar destinatários
        const destinatarios = Array.isArray(email.destinatarios) 
          ? email.destinatarios 
          : [email.destinatarios];

        const toEmails = destinatarios
          .filter((d: any) => !d.tipo || d.tipo === 'to')
          .map((d: any) => d.email || d);

        const ccEmails = destinatarios
          .filter((d: any) => d.tipo === 'cc')
          .map((d: any) => d.email);

        const bccEmails = destinatarios
          .filter((d: any) => d.tipo === 'bcc')
          .map((d: any) => d.email);

        // Preparar anexos
        const attachments = [];
        if (email.anexo_url) {
          try {
            const anexoResponse = await fetch(email.anexo_url);
            const anexoBuffer = await anexoResponse.arrayBuffer();
            const anexoBase64 = btoa(
              String.fromCharCode(...new Uint8Array(anexoBuffer))
            );

            const fileName = email.tipo === 'orcamento' 
              ? 'orcamento.pdf' 
              : email.tipo === 'contrato' 
                ? 'contrato.pdf' 
                : 'proposta.pdf';

            attachments.push({
              filename: fileName,
              content: anexoBase64,
            });
          } catch (anexoError) {
            console.error("⚠️ Erro ao processar anexo, continuando sem anexo:", anexoError);
          }
        }

        // Enviar email via Resend
        const emailData: any = {
          from: "Sistema <onboarding@resend.dev>",
          to: toEmails,
          subject: email.assunto,
          html: email.template_html || email.mensagem.replace(/\n/g, '<br>'),
        };

        if (ccEmails.length > 0) emailData.cc = ccEmails;
        if (bccEmails.length > 0) emailData.bcc = bccEmails;
        if (attachments.length > 0) emailData.attachments = attachments;

        const { data: resendData, error: resendError } = await resend.emails.send(emailData);

        if (resendError) {
          throw new Error(`Resend error: ${resendError.message}`);
        }

        console.log(`✅ Email ${email.id} enviado com sucesso (Resend ID: ${resendData.id})`);

        // Atualizar status para enviado
        const { error: updateError } = await supabase
          .from("emails_agendados")
          .update({
            status: "enviado",
            enviado_em: new Date().toISOString(),
            erro_mensagem: null,
          })
          .eq("id", email.id);

        if (updateError) {
          console.error(`⚠️ Erro ao atualizar status do email ${email.id}:`, updateError);
        }

        enviados++;

        // Criar log de atividade
        try {
          await supabase.rpc("criar_log_atividade", {
            p_cliente_id: null,
            p_usuario_id: email.criado_por,
            p_acao: "enviar_email_agendado",
            p_entidade_tipo: email.tipo,
            p_entidade_id: email.entidade_id,
            p_descricao: `Email ${email.tipo} enviado para ${toEmails.join(', ')}`,
            p_metadata: { email_id: email.id, resend_id: resendData.id },
          });
        } catch (logError) {
          console.error("⚠️ Erro ao criar log:", logError);
        }

      } catch (emailError: any) {
        console.error(`❌ Erro ao enviar email ${email.id}:`, emailError);

        // Atualizar status para erro
        const { error: errorUpdateError } = await supabase
          .from("emails_agendados")
          .update({
            status: "erro",
            erro_mensagem: emailError.message || "Erro desconhecido",
          })
          .eq("id", email.id);

        if (errorUpdateError) {
          console.error(`⚠️ Erro ao atualizar status de erro:`, errorUpdateError);
        }

        erros++;
      }
    }

    console.log(`🎯 Processamento concluído: ${enviados} enviados, ${erros} erros`);

    return new Response(
      JSON.stringify({
        message: "Processamento concluído",
        total: emailsPendentes.length,
        enviados,
        erros,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("❌ Erro geral:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

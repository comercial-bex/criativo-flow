import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { propostaId } = await req.json();

    if (!propostaId) {
      throw new Error("ID da proposta é obrigatório");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Buscar dados da proposta
    const { data: proposta, error: propostaError } = await supabaseClient
      .from("propostas")
      .select(`
        *,
        clientes (nome, email, cnpj_cpf)
      `)
      .eq("id", propostaId)
      .single();

    if (propostaError) throw propostaError;

    // TODO: Integração real com GOV.br
    // Por enquanto, retornamos uma URL de mock
    // A integração completa requer:
    // 1. Registro no portal GOV.br
    // 2. Obtenção de credenciais OAuth2
    // 3. Implementação do fluxo de autenticação
    // 4. Geração de hash do documento
    // 5. Solicitação de assinatura digital

    console.log("Iniciando processo de assinatura para proposta:", propostaId);
    console.log("Cliente:", proposta.clientes?.nome);

    // Gerar hash único para o processo de assinatura
    const assinaturaHash = crypto.randomUUID();

    // Atualizar proposta com hash de assinatura
    await supabaseClient
      .from("propostas")
      .update({
        assinatura_hash: assinaturaHash,
        assinatura_status: "processando",
        updated_at: new Date().toISOString(),
      })
      .eq("id", propostaId);

    // Criar log de assinatura
    await supabaseClient.from("assinatura_logs").insert({
      proposta_id: propostaId,
      evento: "iniciado",
      ip_usuario: req.headers.get("x-forwarded-for") || "unknown",
      user_agent: req.headers.get("user-agent") || null,
    });

    // URL de callback após autenticação GOV.br
    const callbackUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/callback-assinatura-govbr?hash=${assinaturaHash}`;

    // Mock URL - substituir pela URL real do GOV.br OAuth2
    const mockAuthUrl = `https://sso.staging.acesso.gov.br/authorize?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(
      callbackUrl
    )}&scope=openid+email+phone+profile+govbr_empresa`;

    return new Response(
      JSON.stringify({
        success: true,
        authUrl: mockAuthUrl,
        assinaturaHash,
        message: "Processo de assinatura iniciado. Aguarde redirecionamento para GOV.br",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro ao iniciar assinatura:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: "Erro ao iniciar processo de assinatura digital",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

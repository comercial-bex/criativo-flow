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
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const assinaturaHash = url.searchParams.get("hash");

    if (!code || !assinaturaHash) {
      throw new Error("Parâmetros inválidos no callback");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Buscar proposta pelo hash
    const { data: proposta, error: propostaError } = await supabaseClient
      .from("propostas")
      .select("*")
      .eq("assinatura_hash", assinaturaHash)
      .single();

    if (propostaError) throw propostaError;

    // TODO: Trocar o código por token de acesso GOV.br
    // const tokenResponse = await fetch('https://sso.staging.acesso.gov.br/token', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //   body: new URLSearchParams({
    //     grant_type: 'authorization_code',
    //     code,
    //     redirect_uri: callbackUrl,
    //     client_id: YOUR_CLIENT_ID,
    //     client_secret: YOUR_CLIENT_SECRET
    //   })
    // });

    // TODO: Buscar dados do usuário autenticado
    // const userDataResponse = await fetch('https://sso.staging.acesso.gov.br/userinfo', {
    //   headers: { 'Authorization': `Bearer ${accessToken}` }
    // });

    // Mock de dados do assinante (substituir por dados reais do GOV.br)
    const mockAssinanteData = {
      nome: "Usuário GOV.br",
      cpf: "000.000.000-00",
      email: "usuario@gov.br",
    };

    // Atualizar proposta como assinada
    await supabaseClient
      .from("propostas")
      .update({
        assinatura_status: "assinado",
        assinatura_data: new Date().toISOString(),
        assinante_nome: mockAssinanteData.nome,
        assinante_cpf: mockAssinanteData.cpf,
        assinante_email: mockAssinanteData.email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", proposta.id);

    // Registrar log de assinatura
    await supabaseClient.from("assinatura_logs").insert({
      proposta_id: proposta.id,
      evento: "assinado",
      dados_gov_br: mockAssinanteData,
      ip_usuario: req.headers.get("x-forwarded-for") || "unknown",
      user_agent: req.headers.get("user-agent") || null,
    });

    console.log("Assinatura concluída com sucesso:", proposta.id);

    // Redirecionar para página de sucesso
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${Deno.env.get("FRONTEND_URL") || "http://localhost:5173"}/proposta/${proposta.id}?assinado=true`,
      },
    });
  } catch (error) {
    console.error("Erro no callback de assinatura:", error);
    
    // Redirecionar para página de erro
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${Deno.env.get("FRONTEND_URL") || "http://localhost:5173"}/erro-assinatura`,
      },
    });
  }
});

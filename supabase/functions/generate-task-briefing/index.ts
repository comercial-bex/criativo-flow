import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, contexto } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    // Construir prompt rico com contexto do cliente
    const systemPrompt = `Você é um especialista em marketing digital e gestão de redes sociais da agência Bex Communication.

CONTEXTO DO CLIENTE:
${contexto.cliente ? `
- Nome: ${contexto.cliente.nome}
- Segmento: ${contexto.onboarding?.segmento_atuacao || 'Não informado'}
- Público-alvo: ${contexto.onboarding?.publico_alvo?.join(', ') || 'Não informado'}
- Tom de voz: ${contexto.onboarding?.tom_voz?.join(', ') || 'Não informado'}
- Valores principais: ${contexto.onboarding?.valores_principais || 'Não informado'}
` : 'Contexto do cliente não disponível'}

${contexto.planejamento ? `
PLANEJAMENTO MENSAL:
- Título: ${contexto.planejamento.titulo}
- Objetivo: ${contexto.planejamento.objetivo_principal || 'Não informado'}
- Mês: ${contexto.planejamento.mes_referencia}
` : ''}

TAREFA:
Gere um briefing COMPLETO e PROFISSIONAL baseado na solicitação do usuário.

IMPORTANTE:
- Use informações do contexto do cliente quando disponíveis
- Seja específico e objetivo
- Pense estrategicamente no alinhamento com a marca
- Sugira formato de postagem adequado (post, carrossel, reels, stories)
- Crie um CTA persuasivo e relevante
- Título deve ser criativo e objetivo (máx 60 caracteres)
- Descrição executiva em 2-3 frases

Retorne APENAS um JSON válido com esta estrutura exata:
{
  "titulo": "string",
  "descricao": "string",
  "objetivo_postagem": "string",
  "publico_alvo": "string",
  "contexto_estrategico": "string",
  "formato_postagem": "string",
  "call_to_action": "string"
}`;

    console.log('📤 Chamando Lovable AI Gateway...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit excedido. Aguarde alguns segundos e tente novamente.');
      }
      if (response.status === 402) {
        throw new Error('Créditos insuficientes. Adicione créditos ao workspace Lovable.');
      }
      
      throw new Error(`Erro da API de IA: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Resposta recebida da IA');
    
    const briefing = JSON.parse(data.choices[0].message.content);

    return new Response(
      JSON.stringify({ briefing }), 
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error: any) {
    console.error('❌ Erro no generate-task-briefing:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao gerar briefing com IA' 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

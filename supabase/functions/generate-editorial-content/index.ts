import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clienteId, step, previousData } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados do onboarding e objetivos
    const { data: onboarding } = await supabase
      .from('cliente_onboarding')
      .select('*')
      .eq('cliente_id', clienteId)
      .single();

    const { data: objetivos } = await supabase
      .from('cliente_objetivos')
      .select('*')
      .eq('cliente_id', clienteId)
      .single();

    const { data: cliente } = await supabase
      .from('clientes')
      .select('nome, segmento_atuacao')
      .eq('id', clienteId)
      .single();

    // Prompts para cada passo BEX
    const prompts: Record<string, string> = {
      especialista: `Você é um especialista renomado em criação de conteúdo para redes sociais com foco em alta performance e ROI.`,
      
      missao: `Com base nos dados da marca ${cliente?.nome}, crie uma MISSÃO clara e inspiradora.
      
Dados da marca:
- Nome: ${cliente?.nome}
- Segmento: ${onboarding?.segmento_atuacao || 'Não informado'}
- Produtos/Serviços: ${onboarding?.produtos_servicos || 'Não informado'}
- Valores: ${onboarding?.valores_principais || 'Não informado'}
- História: ${onboarding?.historia_marca || 'Não informado'}
- Diferenciais: ${onboarding?.diferenciais || 'Não informado'}

Retorne APENAS um objeto JSON no formato:
{
  "missao": "A missão da marca em 2-3 linhas, focada em gerar valor e propósito"
}`,

      posicionamento: `Com base na missão criada e nos dados da marca ${cliente?.nome}, defina o POSICIONAMENTO para redes sociais.

Missão: ${previousData?.missao || ''}

Dados adicionais:
- Tom de voz: ${onboarding?.tom_voz?.join(', ') || 'Não informado'}
- Como quer ser lembrada: ${onboarding?.como_lembrada || 'Não informado'}
- Público-alvo: ${onboarding?.publico_alvo?.join(', ') || 'Não informado'}
- Objetivos digitais: ${onboarding?.objetivos_digitais || 'Não informado'}

Retorne APENAS um objeto JSON no formato:
{
  "posicionamento": "Descrição clara do posicionamento em redes sociais, como a marca deve se comunicar e se diferenciar (3-4 linhas)"
}`,

      personas: `Com base nos dados da marca ${cliente?.nome}, crie 3 PERSONAS DETALHADAS que representem o público-alvo.

Dados do público:
- Público-alvo: ${onboarding?.publico_alvo?.join(', ') || 'Não informado'}
- Como encontram a marca: ${onboarding?.como_encontram?.join(', ') || 'Não informado'}
- O que valorizam: ${onboarding?.valorizado || 'Não informado'}
- Dores/Problemas: ${onboarding?.dores_problemas || 'Não informado'}
- Tipos de clientes: ${onboarding?.tipos_clientes || 'Não informado'}

Retorne APENAS um objeto JSON no formato:
{
  "personas": [
    {
      "nome": "Nome da Persona",
      "idade": "Faixa etária",
      "ocupacao": "Profissão",
      "caracteristicas": "Características comportamentais",
      "necessidades": "Principais necessidades",
      "dores": "Principais dores e desafios",
      "objetivos": "O que busca alcançar"
    }
  ]
}`,

      conteudos: `Com base na estratégia definida, gere 12 PEÇAS DE CONTEÚDO para redes sociais:
- 4 POSTS (imagem estática)
- 4 VÍDEOS/REELS (conteúdo audiovisual curto)
- 4 CARROSSÉIS (múltiplas imagens)

Estratégia:
- Missão: ${previousData?.missao || ''}
- Posicionamento: ${previousData?.posicionamento || ''}
- Personas: ${JSON.stringify(previousData?.personas || [])}
- Frameworks selecionados: ${previousData?.frameworks?.join(', ') || 'HESEC, HERO, PEACE'}

Objetivos disponíveis: engajamento, educacao, conversao, awareness, relacionamento

Retorne APENAS um objeto JSON no formato:
{
  "conteudos": [
    {
      "tipo": "post" | "video" | "carrossel",
      "titulo": "Título chamativo e objetivo",
      "legenda": "Legenda completa com storytelling e CTA",
      "objetivo": "engajamento" | "educacao" | "conversao" | "awareness" | "relacionamento",
      "framework": "HESEC" | "HERO" | "PEACE",
      "componente": "componente específico do framework usado",
      "persona_alvo": "nome da persona que esse conteúdo visa",
      "hashtags": ["tag1", "tag2", "tag3"],
      "call_to_action": "CTA específico",
      "conceito_visual": "Descrição do que a arte/vídeo deve mostrar"
    }
  ]
}`,

      datas_comemorativas: `Liste 8-10 DATAS COMEMORATIVAS relevantes para ${cliente?.nome} no segmento ${onboarding?.segmento_atuacao || ''}.

Considere:
- Datas nacionais e internacionais
- Datas do setor/nicho
- Datas que conectam com os valores da marca

Retorne APENAS um objeto JSON no formato:
{
  "datas": [
    {
      "nome": "Nome da data comemorativa",
      "data": "DD/MM",
      "relevancia": "Por que é relevante para a marca",
      "sugestao_conteudo": "Ideia de conteúdo para essa data"
    }
  ]
}`,

      trafego_pago: `Crie 4 CRIATIVOS PARA TRÁFEGO PAGO (2 para conversão + 2 scripts de vídeo).

Objetivo: Conversão (agendamento ou venda)
Dados da marca:
- Diferenciais: ${onboarding?.diferenciais || ''}
- Objetivos: ${onboarding?.objetivos_digitais || ''}

Retorne APENAS um objeto JSON no formato:
{
  "criativos": [
    {
      "tipo": "imagem" | "video",
      "titulo": "Headline impactante",
      "corpo": "Texto do anúncio focado em conversão",
      "cta": "Call-to-action específico",
      "publico_alvo": "Descrição do público a segmentar",
      "conceito_visual": "Descrição da arte/vídeo",
      "duracao_video": "15s" (apenas para vídeos)
    }
  ]
}`
    };

    const systemPrompt = prompts.especialista;
    const userPrompt = prompts[step] || prompts.missao;

    console.log(`🎯 Gerando conteúdo BEX - Step: ${step}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit excedido. Aguarde alguns instantes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos no workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Extrair JSON do conteúdo
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Resposta da IA não contém JSON válido');
    }

    const result = JSON.parse(jsonMatch[0]);

    console.log(`✅ Conteúdo gerado com sucesso para step: ${step}`);

    return new Response(
      JSON.stringify({
        success: true,
        step,
        data: result,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ Erro:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Erro ao gerar conteúdo',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

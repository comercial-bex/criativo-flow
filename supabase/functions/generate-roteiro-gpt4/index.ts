import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada nas secrets do Supabase');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const {
      cliente_id,
      projeto_id,
      titulo,
      objetivo,
      plataforma,
      duracao_prevista_seg,
      publico_alvo,
      pilares_mensagem,
      tom,
      estilo,
      persona_voz,
      tom_criativo,
      agentes_ia_ids,
      frameworks_ids,
      cta,
      referencias
    } = await req.json();

    console.log('📥 Gerando roteiro com GPT-4.1:', { cliente_id, projeto_id, titulo });

    // 1️⃣ BUSCAR DADOS DO CLIENTE
    const { data: clienteData, error: clienteError } = await supabaseAdmin
      .from('clientes')
      .select('id, nome, nome_fantasia, razao_social, logo_url')
      .eq('id', cliente_id)
      .single();

    if (clienteError) {
      console.error('⚠️ Erro ao buscar cliente:', clienteError);
    }

    // 2️⃣ BUSCAR ONBOARDING DO CLIENTE
    const { data: onboardingData, error: onboardingError } = await supabaseAdmin
      .from('cliente_onboarding')
      .select('*')
      .eq('cliente_id', cliente_id)
      .single();

    if (onboardingError) {
      console.warn('⚠️ Onboarding não encontrado:', onboardingError.message);
    }

    // 3️⃣ BUSCAR AGENTES IA SELECIONADOS
    let agentesPrompts = [];
    if (agentes_ia_ids && agentes_ia_ids.length > 0) {
      const { data: agentesData, error: agentesError } = await supabaseAdmin
        .from('roteiro_agentes_ia')
        .select('nome, especialidade, prompt_sistema')
        .in('id', agentes_ia_ids)
        .eq('ativo', true);

      if (agentesError) {
        console.error('⚠️ Erro ao buscar agentes:', agentesError);
      } else {
        agentesPrompts = agentesData || [];
      }
    }

    // 4️⃣ BUSCAR FRAMEWORKS SELECIONADOS
    let frameworksDescricoes = [];
    if (frameworks_ids && frameworks_ids.length > 0) {
      const { data: frameworksData, error: frameworksError } = await supabaseAdmin
        .from('roteiro_frameworks')
        .select('nome, descricao, estrutura')
        .in('id', frameworks_ids)
        .eq('ativo', true);

      if (frameworksError) {
        console.error('⚠️ Erro ao buscar frameworks:', frameworksError);
      } else {
        frameworksDescricoes = frameworksData || [];
      }
    }

    console.log('✅ Dados carregados:', {
      cliente: clienteData?.nome,
      onboarding: !!onboardingData,
      agentes: agentesPrompts.length,
      frameworks: frameworksDescricoes.length
    });

    // 5️⃣ MONTAR SYSTEM PROMPT (GPT-4.1)
    const agentesTexto = agentesPrompts.length > 0
      ? agentesPrompts.map(a => `**${a.nome}** (${a.especialidade}): ${a.prompt_sistema}`).join('\n\n')
      : 'Você é um roteirista criativo e experiente da BEX Communication.';

    const frameworksTexto = frameworksDescricoes.length > 0
      ? frameworksDescricoes.map(f => {
          const estruturaTexto = f.estrutura ? `\nEstrutura: ${JSON.stringify(f.estrutura, null, 2)}` : '';
          return `**${f.nome}**: ${f.descricao}${estruturaTexto}`;
        }).join('\n\n')
      : 'Use estrutura narrativa clássica com abertura, desenvolvimento e encerramento impactante.';

    const tomTexto = Array.isArray(tom) ? tom.join(', ') : (tom || 'profissional');
    const estiloTexto = Array.isArray(estilo) ? estilo.join(', ') : (estilo || 'narrativo');
    const tomCriativoTexto = Array.isArray(tom_criativo) ? tom_criativo.join(', ') : (tom_criativo || 'criativo');

    const systemMessage = `Você é um roteirista audiovisual profissional especializado em criar roteiros impactantes para vídeos institucionais, publicitários e de marketing.

**🎯 ESPECIALISTAS ENVOLVIDOS:**
${agentesTexto}

**📐 FRAMEWORKS DE CONTEÚDO A SEGUIR:**
${frameworksTexto}

**🎨 TOM E ESTILO:**
- Tom de voz: ${tomTexto}
- Estilo narrativo: ${estiloTexto}
- Tons criativos: ${tomCriativoTexto}
- Persona: ${persona_voz || 'Profissional e confiável'}

**📋 INSTRUÇÕES OBRIGATÓRIAS:**
1. Crie um roteiro audiovisual COMPLETO em formato Markdown
2. Use linguagem ${tomTexto} e estilo ${estiloTexto}
3. Divida claramente em: IDENTIFICAÇÃO, OBJETIVO E TOM, ROTEIRO (com ABERTURA, DESENVOLVIMENTO e ENCERRAMENTO), e REFERÊNCIAS TÉCNICAS
4. Para cada bloco do roteiro, descreva:
   - **Imagem de apoio**: cenas detalhadas, pessoas, ações, locais, enquadramentos
   - **Locução em OFF**: texto narrado exatamente como será falado
   - **Falas/Depoimentos**: diálogos ou entrevistas (quando aplicável)
5. Inclua sugestões técnicas: cores (com códigos hex), trilha musical, ritmo, efeitos visuais
6. Seja específico, detalhado e profissional
7. O roteiro deve ter duração compatível com ${duracao_prevista_seg} segundos
8. Retorne SEMPRE em formato Markdown estruturado e formatado`;

    // 6️⃣ MONTAR USER PROMPT COM CONTEXTO
    const contextoProjeto = onboardingData ? `

**📊 CONTEXTO ESTRATÉGICO DO CLIENTE:**
- **Segmento de atuação**: ${onboardingData.segmento_atuacao || 'Não informado'}
- **Produtos/Serviços**: ${onboardingData.produtos_servicos || 'Não informado'}
- **Diferenciais da marca**: ${onboardingData.diferenciais || 'Não informado'}
- **Público-alvo principal**: ${Array.isArray(onboardingData.publico_alvo) ? onboardingData.publico_alvo.join(', ') : onboardingData.publico_alvo || 'Não informado'}
- **Tom de voz da marca**: ${Array.isArray(onboardingData.tom_voz) ? onboardingData.tom_voz.join(', ') : onboardingData.tom_voz || 'Não informado'}
- **Como quer ser lembrada**: ${onboardingData.como_lembrada || 'Não informado'}
- **Valores principais**: ${onboardingData.valores_principais || 'Não informado'}
- **História da marca**: ${onboardingData.historia_marca || 'Não informado'}
` : '';

    const formatoPeca = plataforma === 'reels' ? 'Reels 30"' 
                      : plataforma === 'youtube' ? 'Vídeo YouTube' 
                      : plataforma === 'tiktok' ? 'TikTok'
                      : `Vídeo ${duracao_prevista_seg}"`;

    const userPrompt = `Crie um roteiro audiovisual seguindo EXATAMENTE a estrutura Markdown abaixo. O objetivo é ${objetivo}.

---

# IDENTIFICAÇÃO
- **Cliente**: ${clienteData?.nome || clienteData?.razao_social || 'Cliente BEX'}
- **Agência**: BEX Communication
- **Produtora**: INSPIRE FILMES
- **Peça**: ${formatoPeca}
- **Título**: ${titulo}
- **Duração**: ${duracao_prevista_seg}s
- **Veiculação**: ${plataforma}
- **Data**: ${new Date().toLocaleDateString('pt-BR')}
- **Criação**: BEX Communication
${contextoProjeto}

---

# OBJETIVO E TOM
- **Objetivo**: ${objetivo}
- **Tom**: ${tomTexto}
- **Estilo**: ${estiloTexto}
- **Público-alvo**: ${Array.isArray(publico_alvo) ? publico_alvo.join(', ') : publico_alvo || 'Público geral'}

**💡 PILARES DA MENSAGEM:**
${Array.isArray(pilares_mensagem) && pilares_mensagem.length > 0 
  ? pilares_mensagem.map((p, i) => `${i + 1}. ${p}`).join('\n') 
  : '1. Valor\n2. Confiança\n3. Inovação'}

${referencias ? `**📎 REFERÊNCIAS VISUAIS/CONCEITUAIS:**\n${referencias}\n` : ''}

---

# ROTEIRO

## 🎬 ABERTURA
**Imagem de apoio:**
[Descreva aqui as primeiras imagens/cenas com detalhes: enquadramento, pessoas, ações, ambientes]

**Locução em OFF:**
"[Texto narrado exatamente como será falado - impactante e direto]"

---

## 📽️ DESENVOLVIMENTO
**Imagem de apoio:**
[Descreva cenas intermediárias: ações, personagens, transições, locais - seja específico]

**Locução em OFF:**
"[Texto narrado que acompanha as cenas - conecte os pilares da mensagem]"

**Falas/Depoimentos (se aplicável):**
> "[Fala de personagem, cliente ou especialista - apenas se fizer sentido no contexto]"

---

## 🎯 ENCERRAMENTO
**Imagem de apoio:**
[Tela final: logo, slogan, composição visual - seja criativo e impactante]

**Locução em OFF:**
"[Frase curta e memorável de fechamento - reforce o objetivo]"

**Call-to-Action:**
> "${cta || 'Saiba mais! Entre em contato.'}"

---

# REFERÊNCIAS TÉCNICAS
- **Cores sugeridas**: [Liste 3-5 cores com códigos hexadecimais baseadas no tom ${tomTexto}]
- **Música**: [Tipo de trilha musical específica - gênero, BPM, referências]
- **Ritmo**: [Descreva o ritmo: dinâmico/suave/épico/crescente - conforme o objetivo]
- **Efeitos visuais**: [Transições, textos animados, motion graphics - seja criativo]

---

**IMPORTANTE**: Crie um roteiro COMPLETO, DETALHADO e PROFISSIONAL. Preencha TODAS as seções com conteúdo específico e impactante.`;

    console.log('🚀 Enviando prompt para GPT-4.1...');
    console.log('📊 Contexto:', {
      caracteres_system: systemMessage.length,
      caracteres_user: userPrompt.length,
      total: systemMessage.length + userPrompt.length
    });

    // 7️⃣ CHAMAR GPT-4.1
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 4000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro OpenAI:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const roteiroGerado = result.choices[0].message.content;

    console.log('✅ Roteiro gerado com sucesso!', {
      tokens_usados: result.usage?.total_tokens,
      caracteres_gerados: roteiroGerado.length
    });

    return new Response(
      JSON.stringify({
        success: true,
        roteiro: roteiroGerado,
        metadata: {
          cliente: clienteData?.nome || clienteData?.razao_social,
          modelo: 'gpt-4.1-2025-04-14',
          agentes_utilizados: agentesPrompts.map(a => a.nome),
          frameworks_utilizados: frameworksDescricoes.map(f => f.nome),
          tokens_usados: result.usage?.total_tokens,
          contexto_onboarding: !!onboardingData,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

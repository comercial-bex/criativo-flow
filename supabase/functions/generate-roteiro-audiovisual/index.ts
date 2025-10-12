import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BriefingData {
  cliente_nome: string;
  titulo: string;
  objetivo: string;
  tom: string;
  estilo?: string;
  veiculacao: string[];
  mensagem_chave: string;
  beneficios: string[];
  cta: string;
  ambiente: string;
  duracao_prevista_seg?: number;
  formato?: string;
  agente_ia_id?: string;
  framework_id?: string;
  agentes_ia_ids?: string[];
  frameworks_ids?: string[];
  tom_criativo?: string[];
  publico_alvo_descricao?: string;
  persona_voz?: string;
  referencias?: string;
}

interface SugestoesTecnicas {
  lente: string;
  filtro: string;
  hora: string;
  movimento: string;
  cor: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const briefingData = await req.json() as BriefingData;

    if (!briefingData || !briefingData.titulo) {
      throw new Error('Dados do briefing são obrigatórios');
    }

    // Criar cliente Supabase para buscar agente e framework
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar múltiplos agentes de IA
    let agentes: any[] = [];
    const agentesIds = briefingData.agentes_ia_ids?.length 
      ? briefingData.agentes_ia_ids 
      : (briefingData.agente_ia_id ? [briefingData.agente_ia_id] : []);
      
    if (agentesIds.length > 0) {
      const { data } = await supabaseAdmin
        .from('roteiro_agentes_ia')
        .select('*')
        .in('id', agentesIds);
      agentes = data || [];
      console.log('✅ Agentes carregados:', agentes.map(a => a.nome).join(', '));
    }

    // Buscar múltiplos frameworks
    let frameworks: any[] = [];
    const frameworksIds = briefingData.frameworks_ids?.length
      ? briefingData.frameworks_ids
      : (briefingData.framework_id ? [briefingData.framework_id] : []);
      
    if (frameworksIds.length > 0) {
      const { data } = await supabaseAdmin
        .from('roteiro_frameworks')
        .select('*')
        .in('id', frameworksIds);
      frameworks = data || [];
      console.log('✅ Frameworks carregados:', frameworks.map(f => f.nome).join(', '));
    }

    // Verificar se temos Lovable AI disponível
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    let roteiroGerado = '';

    if (LOVABLE_API_KEY) {
      // Construir system prompt profissional
      const systemPrompt = `
Você é um roteirista profissional especializado em roteiros audiovisuais técnicos para agências de publicidade.

FORMATO OBRIGATÓRIO:
Gere o roteiro seguindo EXATAMENTE esta estrutura:

---
IDENTIFICAÇÃO

Cliente: ${briefingData.cliente_nome}
Agência: BEX Communication
Produtora: INSPIRE FILMES
Peça: ${briefingData.formato || 'Vídeo institucional'} (duração: ${briefingData.duracao_prevista_seg || 30}s)
Título: ${briefingData.titulo}
Duração: ${briefingData.duracao_prevista_seg || 30} segundos
Veiculação: ${briefingData.veiculacao?.join(', ') || 'Redes sociais'}
Data: ${new Date().toLocaleDateString('pt-BR')}
Criação: ${agentes.length > 0 ? agentes.map(a => a.nome).join(' + ') : 'BEX Creative Team'}

---
OBJETIVO E TOM

Objetivo: ${briefingData.objetivo}
Tom: ${briefingData.tom}
${briefingData.tom_criativo?.length ? `Tons Criativos: ${briefingData.tom_criativo.join(', ')}` : ''}

---
ROTEIRO

[Gere de 3 a 6 cenas seguindo EXATAMENTE este formato:]

CENA 1 (Duração: 4s)
📸 IMAGEM DE APOIO: [descreva detalhadamente a cena visual - exemplo: "Porta-voz em plano médio, fundo institucional neutro, iluminação suave"]
🎤 FALA (ON): [fala direta do personagem - exemplo: "Você sabe quem fiscaliza o mercado imobiliário no Amapá?"]
📢 NARRAÇÃO (OFF): [deixe vazio se houver fala ON, ou inclua locução]
🎬 EFEITOS VISUAIS/ÁUDIO: [trilha sonora, cortes, transições - exemplo: "Trilha institucional suave, fade-in, áudio direto com lapela"]
⏱️ DURAÇÃO ESTIMADA: 4s

CENA 2 (Duração: 6s)
📸 IMAGEM DE APOIO: [próxima cena - exemplo: "Tela com texto da Lei 6.530/78 em destaque, logo do CRECI-AP ao fundo"]
🎤 FALA (ON): [fala do personagem - exemplo: "O CRECI-AP é uma autarquia federal criada pela Lei 6.530/78"]
📢 NARRAÇÃO (OFF): [locução se não houver fala ON]
🎬 EFEITOS VISUAIS/ÁUDIO: [exemplo: "Corte seco, zoom no texto da lei, trilha mantém volume"]
⏱️ DURAÇÃO ESTIMADA: 6s

CENA 3 (Duração: 5s)
📸 IMAGEM DE APOIO: [desenvolvimento - exemplo: "Sequência rápida de profissionais imobiliários trabalhando"]
🎤 FALA (ON): [se houver]
📢 NARRAÇÃO (OFF): [exemplo: "Garantindo ética, segurança e profissionalismo no mercado"]
🎬 EFEITOS VISUAIS/ÁUDIO: [exemplo: "Montagem dinâmica 2s por cena, trilha aumenta intensidade"]
⏱️ DURAÇÃO ESTIMADA: 5s

[Continue com mais 2-3 cenas]

CENA FINAL - ENCERRAMENTO (Duração: 5s)
📸 IMAGEM DE APOIO: [tela final - exemplo: "Logo CRECI-AP centralizado, slogan abaixo, informações de contato"]
📢 NARRAÇÃO (OFF): [frase de impacto - exemplo: "CRECI-AP. Fiscalização que protege você."]
🎬 EFEITOS VISUAIS/ÁUDIO: [exemplo: "Fade-out gradual, trilha finaliza suavemente, logo animado"]
⏱️ DURAÇÃO ESTIMADA: 5s

---
REFERÊNCIAS TÉCNICAS

| Aspecto | Especificação |
|---------|---------------|
| **Lente recomendada** | ${briefingData.ambiente === 'externo' ? '24-70mm zoom' : '50mm fixa'} |
| **Iluminação** | ${briefingData.ambiente === 'externo' ? 'Luz natural difusa' : 'Softbox 3 pontos'} |
| **Horário ideal** | ${briefingData.ambiente === 'externo' ? 'Golden hour' : 'Controlado'} |
| **Movimento de câmera** | Plano fixo + cortes dinâmicos |
| **Tratamento de cor** | Gradação profissional ${briefingData.tom === 'emotivo' ? 'quente' : 'neutra'} |

---
OBSERVAÇÕES FINAIS

Mensagem-chave: ${briefingData.mensagem_chave || briefingData.objetivo}
Call to Action (CTA): ${briefingData.cta || 'Saiba mais!'}
${briefingData.veiculacao?.includes('Instagram') || briefingData.veiculacao?.includes('TikTok') ? 'Hashtags: [gerar 3-5 hashtags relevantes]' : ''}

---

INSTRUÇÕES CRÍTICAS:
1. SEMPRE separe FALA (ON) de NARRAÇÃO (OFF)
2. Descreva IMAGENS DE APOIO de forma cinematográfica e detalhada
3. Inclua EFEITOS VISUAIS/ÁUDIO em cada cena
4. Mantenha timing realista (máx. 30-60s total)
5. Finalize com logo + slogan + CTA
6. Use linguagem humanizada e natural
7. Adapte ao tom: ${briefingData.tom}

${framework ? `
FRAMEWORK: ${framework.nome}
Estrutura: ${JSON.stringify(framework.estrutura)}
Adapte as cenas seguindo esta narrativa.
` : ''}

${agente ? `
AGENTE: ${agente.nome}
Estilo: ${agente.especialidade}
${agente.descricao}
` : ''}

${briefingData.publico_alvo_descricao ? `
📊 PÚBLICO-ALVO DETALHADO: ${briefingData.publico_alvo_descricao}
Adapte linguagem, exemplos e referências para ressoar com este perfil específico.
` : ''}

${briefingData.persona_voz ? `
🗣️ PERSONA E VOZ: ${briefingData.persona_voz}
Mantenha esta voz consistente em todas as narrações e falas.
` : ''}

${briefingData.referencias ? `
📎 REFERÊNCIAS FORNECIDAS: ${briefingData.referencias}
Use como inspiração de estilo visual e narrativo (não copie conteúdo literal).
` : ''}

🚨 DIRETRIZES CRÍTICAS DE CONTEÚDO:
- NUNCA use placeholders genéricos como "mensagem principal", "benefício aqui", "[inserir texto]"
- Escreva TODAS as falas e narrações COMPLETAS e ESPECÍFICAS baseadas no briefing
- Cada cena deve ter texto SUBSTANTIVO e CONTEXTUALIZADO para o objetivo
- Adapte terminologia ao contexto regional (Amapá, Norte) quando relevante
- Se o briefing tiver poucos detalhes, CRIE conteúdo coerente baseado no objetivo principal
- EVITE repetições - varie a abordagem em cada cena
- Use números, dados e exemplos concretos quando possível
- Seja criativo mas mantenha o profissionalismo
- ${briefingData.estilo ? `Aplique o estilo narrativo: ${briefingData.estilo}` : 'Use storytelling envolvente'}
`;

      try {
        console.log('🤖 Chamando Lovable AI Gateway...');
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: systemPrompt },
              { 
                role: 'user', 
                content: `Mensagem-chave: ${briefingData.mensagem_chave}\nBenefícios: ${briefingData.beneficios.join(', ')}\nCTA: ${briefingData.cta}`
              }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          roteiroGerado = aiData.choices[0].message.content;
          console.log('✅ Roteiro gerado com IA');
        }
      } catch (aiError) {
        console.error('❌ Erro na IA, usando fallback:', aiError);
      }
    }

    // Fallback: gerar roteiro estruturado
    if (!roteiroGerado) {
      const sugestoesTecnicas = getSugestoesAmbiente(briefingData.ambiente);
      const blocos = gerarBlocos(briefingData, sugestoesTecnicas, agente, framework);
      
      const roteiro = {
        identificacao: {
          cliente: briefingData.cliente_nome,
          peca: briefingData.formato || 'Vídeo institucional',
          titulo: briefingData.titulo,
          duracao: `${briefingData.duracao_prevista_seg || 30}s`,
          veiculacao: briefingData.veiculacao,
          data: new Date().toLocaleDateString('pt-BR'),
        },
        objetivo: briefingData.objetivo,
        tom: briefingData.tom,
        agente_usado: agentes.length > 0 ? agentes.map(a => a.nome).join(' + ') : 'BEX Creative Team',
        framework_usado: frameworks.length > 0 ? frameworks.map(f => f.nome).join(' + ') : 'Storytelling tradicional',
        tons_criativos: briefingData.tom_criativo || [],
        blocos: blocos,
        referencias_tecnicas: sugestoesTecnicas,
        observacoes_finais: {
          mensagem_chave: briefingData.mensagem_chave,
          cta: briefingData.cta || 'Saiba mais!',
        },
      };

      roteiroGerado = gerarMarkdown(roteiro);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        roteiro: roteiroGerado,
        agentes_usados: agentes.map(a => a.nome),
        frameworks_usados: frameworks.map(f => f.nome),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Erro ao gerar roteiro:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function getSugestoesAmbiente(ambiente: string): SugestoesTecnicas {
  const sugestoes: Record<string, SugestoesTecnicas> = {
    praia: {
      lente: '24mm f/2.8',
      filtro: 'Polarizador circular',
      hora: 'Golden hour (1h antes do pôr do sol)',
      movimento: 'Panorâmico suave com gimbal',
      cor: 'Tons quentes saturados, realçar azul do mar',
    },
    floresta: {
      lente: '35mm f/1.8',
      filtro: 'ND variável (2-5 stops)',
      hora: 'Luz difusa (nublado ou sombreado)',
      movimento: 'Travelling suave entre árvores',
      cor: 'Textura orgânica, verdes naturais',
    },
    cidade: {
      lente: '35mm f/1.4',
      filtro: 'Neutro ou UV',
      hora: 'Luz mista (dia ou blue hour)',
      movimento: 'Handheld dinâmico ou gimbal urbano',
      cor: 'Ritmo dinâmico, contrastes urbanos',
    },
    escritorio: {
      lente: '50mm f/1.4',
      filtro: 'LED 5600K difuso (softbox)',
      hora: 'Qualquer (iluminação controlada)',
      movimento: 'Plano médio fixo ou slider sutil',
      cor: 'Profissional, iluminação suave',
    },
    interno: {
      lente: '50mm f/1.4',
      filtro: 'Softbox 3 pontos',
      hora: 'Iluminação controlada',
      movimento: 'Plano fixo ou slider',
      cor: 'Gradação profissional neutra',
    },
    externo: {
      lente: '24-70mm f/2.8',
      filtro: 'Luz natural difusa',
      hora: 'Golden hour',
      movimento: 'Gimbal estabilizado',
      cor: 'Tons quentes saturados',
    },
  };

  return sugestoes[ambiente] || sugestoes.interno;
}

function gerarBlocos(briefingData: BriefingData, sugestoes: SugestoesTecnicas, agente: any, framework: any) {
  // Se houver framework com estrutura customizada
  if (framework?.estrutura && Array.isArray(framework.estrutura)) {
    return framework.estrutura.map((item: any, idx: number) => ({
      cena: idx + 1,
      take: item.tipo || `Cena ${idx + 1}`,
      duracao: item.duracao || '5s',
      imagem_apoio: item.descricao || `${briefingData.ambiente} - Cena ${idx + 1}`,
      fala_on: item.fala_on || '',
      narracao_off: item.conteudo || item.texto || '',
      efeitos: item.efeitos || sugestoes.movimento,
      sugestao_tecnica: item.observacao || sugestoes.lente,
    }));
  }

  // Estrutura padrão profissional
  return [
    {
      cena: 1,
      take: 'Abertura institucional',
      duracao: '4s',
      imagem_apoio: `${briefingData.ambiente} - abertura com identidade visual, ${sugestoes.filtro}`,
      fala_on: '',
      narracao_off: `${briefingData.mensagem_chave || briefingData.objetivo}`,
      efeitos: `Trilha suave, fade-in, ${sugestoes.movimento}`,
      sugestao_tecnica: `Lente: ${sugestoes.lente}, ${sugestoes.filtro}`,
    },
    {
      cena: 2,
      take: 'Apresentação do conceito',
      duracao: '6s',
      imagem_apoio: 'Porta-voz em plano médio ou produto em destaque',
      fala_on: briefingData.mensagem_chave || 'Fala principal do apresentador',
      narracao_off: '',
      efeitos: 'Áudio direto com lapela, ambiente natural',
      sugestao_tecnica: 'Plano médio, iluminação suave 3 pontos',
    },
    {
      cena: 3,
      take: 'Desenvolvimento - Benefícios',
      duracao: '8s',
      imagem_apoio: 'Sequência visual de benefícios ou produto em uso',
      fala_on: '',
      narracao_off: briefingData.beneficios?.join('. ') || 'Apresentação dos benefícios principais',
      efeitos: `Montagem rápida 2s por cena, ${sugestoes.cor}`,
      sugestao_tecnica: `${sugestoes.movimento}, cortes dinâmicos`,
    },
    {
      cena: 4,
      take: 'Prova social ou depoimento',
      duracao: '6s',
      imagem_apoio: 'Cliente satisfeito ou case de sucesso',
      fala_on: 'Depoimento espontâneo do cliente',
      narracao_off: '',
      efeitos: 'Cortes naturais, trilha emocional sutil',
      sugestao_tecnica: 'Close-up, luz natural difusa',
    },
    {
      cena: 5,
      take: 'Encerramento com CTA',
      duracao: '6s',
      imagem_apoio: 'Logo institucional centralizado + slogan + informações de contato',
      fala_on: '',
      narracao_off: briefingData.cta || 'Saiba mais! Acesse nosso site.',
      efeitos: 'Fade-out gradual, trilha finaliza suavemente, logo animado',
      sugestao_tecnica: 'Tela final estática, branding profissional',
    },
  ];
}

function gerarMarkdown(roteiro: any): string {
  let md = `# 🎬 ROTEIRO AUDIOVISUAL\n\n`;
  md += `## IDENTIFICAÇÃO\n\n`;
  md += `| Campo | Valor |\n|-------|-------|\n`;
  md += `| **Cliente** | ${roteiro.identificacao.cliente} |\n`;
  md += `| **Agência** | BEX Communication |\n`;
  md += `| **Produtora** | INSPIRE FILMES |\n`;
  md += `| **Peça** | ${roteiro.identificacao.peca || 'Vídeo institucional'} |\n`;
  md += `| **Título** | ${roteiro.identificacao.titulo} |\n`;
  md += `| **Duração** | ${roteiro.identificacao.duracao} |\n`;
  md += `| **Veiculação** | ${roteiro.identificacao.veiculacao.join(', ')} |\n`;
  md += `| **Data** | ${roteiro.identificacao.data} |\n`;
  md += `| **Criação** | ${roteiro.agente_usado || 'BEX Creative Team'} |\n\n`;
  
  md += `---\n\n`;
  md += `## 🎯 OBJETIVO E TOM\n\n`;
  md += `**Objetivo:** ${roteiro.objetivo}\n\n`;
  md += `**Tom:** ${roteiro.tom}\n\n`;
  
  if (roteiro.tons_criativos?.length) {
    md += `**Tons Criativos:** ${roteiro.tons_criativos.join(', ')}\n\n`;
  }
  
  md += `---\n\n`;
  md += `## 📝 ROTEIRO TÉCNICO\n\n`;
  
  roteiro.blocos.forEach((bloco: any, index: number) => {
    md += `### CENA ${bloco.cena || index + 1} - ${bloco.take || bloco.tipo} (${bloco.duracao || bloco.tempo})\n\n`;
    
    if (bloco.imagem_apoio || bloco.descricao) {
      md += `📸 **IMAGEM DE APOIO:**\n`;
      md += `> ${bloco.imagem_apoio || bloco.descricao}\n\n`;
    }
    
    if (bloco.fala_on && bloco.fala_on.trim()) {
      md += `🎤 **FALA (ON):**\n`;
      md += `> "${bloco.fala_on}"\n\n`;
    }
    
    if (bloco.narracao_off || (!bloco.fala_on && bloco.texto)) {
      md += `📢 **NARRAÇÃO (OFF):**\n`;
      md += `> "${bloco.narracao_off || bloco.texto}"\n\n`;
    }
    
    if (bloco.efeitos || bloco.tecnica) {
      md += `🎬 **EFEITOS VISUAIS/ÁUDIO:**\n`;
      md += `> ${bloco.efeitos || bloco.tecnica}\n\n`;
    }
    
    if (bloco.sugestao_tecnica || bloco.observacao) {
      md += `🎥 **SUGESTÃO TÉCNICA:**\n`;
      md += `> ${bloco.sugestao_tecnica || bloco.observacao}\n\n`;
    }
    
    md += `⏱️ **DURAÇÃO ESTIMADA:** ${bloco.duracao || bloco.tempo}\n\n`;
    md += `---\n\n`;
  });
  
  md += `## 🎬 REFERÊNCIAS TÉCNICAS\n\n`;
  md += `| Aspecto | Especificação |\n|---------|---------------|\n`;
  md += `| **Lente recomendada** | ${roteiro.referencias_tecnicas.lente} |\n`;
  md += `| **Filtro/Iluminação** | ${roteiro.referencias_tecnicas.filtro} |\n`;
  md += `| **Horário ideal** | ${roteiro.referencias_tecnicas.hora} |\n`;
  md += `| **Movimento de câmera** | ${roteiro.referencias_tecnicas.movimento} |\n`;
  md += `| **Tratamento de cor** | ${roteiro.referencias_tecnicas.cor} |\n\n`;
  
  md += `---\n\n`;
  md += `## 📌 OBSERVAÇÕES FINAIS\n\n`;
  md += `**Mensagem-chave:** ${roteiro.observacoes_finais.mensagem_chave || roteiro.observacoes_finais}\n\n`;
  
  if (roteiro.observacoes_finais.cta) {
    md += `**Call to Action (CTA):** ${roteiro.observacoes_finais.cta}\n\n`;
  }
  
  if (roteiro.framework_usado && roteiro.framework_usado !== 'Storytelling tradicional') {
    md += `**Framework aplicado:** ${roteiro.framework_usado}\n\n`;
  }
  
  md += `---\n\n`;
  md += `*Roteiro gerado por ${roteiro.agente_usado || 'BEX AI'} - ${roteiro.identificacao.data}*\n`;
  
  return md;
}

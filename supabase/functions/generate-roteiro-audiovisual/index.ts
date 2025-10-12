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
  veiculacao: string[];
  mensagem_chave: string;
  beneficios: string[];
  cta: string;
  ambiente: string;
  agente_ia_id?: string;
  framework_id?: string;
  tom_criativo?: string[];
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

    // Buscar agente de IA se fornecido
    let agente: any = null;
    if (briefingData.agente_ia_id) {
      const { data } = await supabaseAdmin
        .from('roteiro_agentes_ia')
        .select('*')
        .eq('id', briefingData.agente_ia_id)
        .single();
      agente = data;
      console.log('✅ Agente carregado:', agente?.nome);
    }

    // Buscar framework se fornecido
    let framework: any = null;
    if (briefingData.framework_id) {
      const { data } = await supabaseAdmin
        .from('roteiro_frameworks')
        .select('*')
        .eq('id', briefingData.framework_id)
        .single();
      framework = data;
      console.log('✅ Framework carregado:', framework?.nome);
    }

    // Verificar se temos Lovable AI disponível
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    let roteiroGerado = '';

    if (LOVABLE_API_KEY && (agente || framework)) {
      // Construir system prompt dinâmico
      const systemPrompt = `
${agente?.prompt_instrucoes || 'Você é um roteirista experiente especializado em conteúdo audiovisual.'}

${framework ? `
FRAMEWORK: ${framework.nome}
${framework.descricao}

ESTRUTURA DO FRAMEWORK:
${JSON.stringify(framework.estrutura, null, 2)}

Siga esta estrutura para organizar o roteiro.
` : ''}

${briefingData.tom_criativo && briefingData.tom_criativo.length > 0 ? `
TOM CRIATIVO: ${briefingData.tom_criativo.join(', ')}
Aplique estes tons de forma equilibrada ao longo do roteiro.
` : ''}

ESPECIFICAÇÕES DO VÍDEO:
- Cliente: ${briefingData.cliente_nome}
- Título: ${briefingData.titulo}
- Duração: 30s
- Veiculação: ${briefingData.veiculacao.join(', ')}
- Objetivo: ${briefingData.objetivo}
- Tom: ${briefingData.tom}
- Ambiente: ${briefingData.ambiente}

INSTRUÇÕES DE FORMATAÇÃO:
1. Use marcadores Markdown para estruturar o roteiro
2. Divida em blocos claros (IMAGEM, OFF, ON, MONTAGEM, CTA)
3. Seja específico nas descrições visuais
4. ${framework ? `Siga a estrutura do framework ${framework.nome}` : 'Use estrutura narrativa clara'}
5. Mantenha o timing adequado para 30s
6. Inclua sugestões técnicas (lente, iluminação, movimento)

Gere um roteiro profissional em Markdown.
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
          peca: briefingData.titulo,
          duracao: '30s',
          veiculacao: briefingData.veiculacao,
          data: new Date().toLocaleDateString('pt-BR'),
        },
        objetivo: briefingData.objetivo,
        tom: briefingData.tom,
        agente_usado: agente?.nome || 'Padrão',
        framework_usado: framework?.nome || 'Storytelling tradicional',
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
        agente_usado: agente?.nome,
        framework_usado: framework?.nome,
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
    noturno: {
      lente: '24-35mm f/1.4',
      filtro: 'LED RGB para acentos coloridos',
      hora: 'Noite (após crepúsculo)',
      movimento: 'Tripé ou gimbal estabilizado (ISO alto)',
      cor: 'Contraste forte, neons, bokeh urbano',
    },
    evento: {
      lente: '24-70mm f/2.8 (zoom versátil)',
      filtro: 'Mix de luz ambiente + LED portátil',
      hora: 'Variável (adaptar)',
      movimento: 'Handheld rápido + momentos fixos',
      cor: 'Energia, cores vibrantes',
    },
  };

  return sugestoes[ambiente] || sugestoes.cidade;
}

function gerarBlocos(briefingData: BriefingData, sugestoes: SugestoesTecnicas, agente: any, framework: any) {
  // Se temos framework, usar sua estrutura
  const estruturaFramework = framework?.estrutura?.blocos || [];
  
  if (estruturaFramework.length > 0) {
    return estruturaFramework.map((descBloco: string, index: number) => ({
      bloco: index + 1,
      tipo: index === 0 ? 'HOOK' : (index === estruturaFramework.length - 1 ? 'CTA' : 'DESENVOLVIMENTO'),
      tempo: `${index * 6}-${(index + 1) * 6}s`,
      descricao: descBloco,
      texto: descBloco,
      tecnica: sugestoes.lente,
      observacao: `Estilo ${agente?.nome || 'padrão'}`,
    }));
  }

  // Estrutura padrão
  return [
    {
      bloco: 1,
      tipo: 'IMAGEM',
      tempo: '0-3s',
      descricao: `Abertura com ${briefingData.ambiente}`,
      tecnica: sugestoes.lente,
      observacao: `Usar ${sugestoes.filtro}`,
    },
    {
      bloco: 2,
      tipo: 'OFF',
      tempo: '3-10s',
      texto: briefingData.mensagem_chave,
      tecnica: 'Locução em estúdio com reverb suave',
      observacao: 'Sincronia com imagens do ambiente',
    },
    {
      bloco: 3,
      tipo: 'ON',
      tempo: '10-20s',
      texto: briefingData.beneficios[0] || 'Benefício principal',
      tecnica: 'Plano médio do cliente/produto',
      observacao: 'Áudio direto + ambiente natural',
    },
    {
      bloco: 4,
      tipo: 'MONTAGEM',
      tempo: '20-27s',
      descricao: 'Sequência rápida de benefícios visuais',
      tecnica: sugestoes.movimento,
      observacao: `Cores: ${sugestoes.cor}`,
    },
    {
      bloco: 5,
      tipo: 'CTA',
      tempo: '27-30s',
      texto: briefingData.cta || 'Saiba mais!',
      tecnica: 'Plano fechado logo/produto',
      observacao: 'Fade out com branding',
    },
  ];
}

function gerarMarkdown(roteiro: any): string {
  let md = `# ${roteiro.identificacao.peca}\n\n`;
  md += `**Cliente:** ${roteiro.identificacao.cliente}\n`;
  md += `**Duração:** ${roteiro.identificacao.duracao}\n`;
  md += `**Veiculação:** ${roteiro.identificacao.veiculacao.join(', ')}\n`;
  md += `**Data:** ${roteiro.identificacao.data}\n\n`;
  
  if (roteiro.agente_usado) {
    md += `**🎬 Agente IA:** ${roteiro.agente_usado}\n`;
  }
  if (roteiro.framework_usado) {
    md += `**📚 Framework:** ${roteiro.framework_usado}\n`;
  }
  if (roteiro.tons_criativos && roteiro.tons_criativos.length > 0) {
    md += `**🎭 Tons:** ${roteiro.tons_criativos.join(', ')}\n`;
  }
  
  md += `\n---\n\n`;
  md += `## 🎯 Objetivo\n${roteiro.objetivo}\n\n`;
  md += `## 🎭 Tom\n${roteiro.tom}\n\n`;
  md += `---\n\n`;
  md += `## 📝 Roteiro\n\n`;
  
  roteiro.blocos.forEach((bloco: any) => {
    md += `### Bloco ${bloco.bloco} - ${bloco.tipo} (${bloco.tempo})\n`;
    if (bloco.descricao) md += `**Descrição:** ${bloco.descricao}\n`;
    if (bloco.texto) md += `**Texto:** "${bloco.texto}"\n`;
    md += `**Técnica:** ${bloco.tecnica}\n`;
    md += `**Observação:** ${bloco.observacao}\n\n`;
  });
  
  md += `---\n\n`;
  md += `## 🎬 Referências Técnicas\n\n`;
  md += `- **Lente:** ${roteiro.referencias_tecnicas.lente}\n`;
  md += `- **Filtro:** ${roteiro.referencias_tecnicas.filtro}\n`;
  md += `- **Horário:** ${roteiro.referencias_tecnicas.hora}\n`;
  md += `- **Movimento:** ${roteiro.referencias_tecnicas.movimento}\n`;
  md += `- **Cor:** ${roteiro.referencias_tecnicas.cor}\n\n`;
  
  md += `---\n\n`;
  md += `## 📌 Observações Finais\n\n`;
  md += `**Mensagem-chave:** ${roteiro.observacoes_finais.mensagem_chave}\n\n`;
  md += `**CTA:** ${roteiro.observacoes_finais.cta}\n`;
  
  return md;
}

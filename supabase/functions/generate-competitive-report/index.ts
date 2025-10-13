import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clienteNome, clienteAnalise, concorrentesAnalises } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const systemPrompt = `Você é um consultor sênior de marketing digital especializado em análise competitiva e benchmarking.

MISSÃO:
Gere um relatório de benchmark digital COMPLETO, VISUAL e ACIONÁVEL em Markdown.

ESTRUTURA OBRIGATÓRIA:
# 📊 Relatório de Benchmark Digital - {Nome Cliente}

## 🎯 Resumo Executivo
[3-4 linhas sobre posição competitiva geral]

## 📈 Posição Competitiva Atual

### Audiência
- **Classificação:** Forte | Neutra | Vulnerável
- **Análise:** [Comparação de seguidores totais]

### Engajamento
- **Classificação:** Forte | Neutra | Vulnerável
- **Análise:** [Comparação de taxa de engajamento %]

### Frequência de Publicação
- **Classificação:** Forte | Neutra | Vulnerável
- **Análise:** [Comparação posts/semana]

### Qualidade Visual
- **Classificação:** Forte | Neutra | Vulnerável
- **Análise:** [Percepção de marca]

## 💡 Oportunidades de Melhoria

### 1. [Área de Oportunidade]
**Gap:** [Descrição]
**Recomendação:** [Ação específica]

[4-6 oportunidades principais]

## 🚀 Ações Recomendadas (Top 10)

1. **[Ação]:** [Descrição e impacto]
2. **[Ação]:** [Descrição e impacto]
...
10. **[Ação]:** [Descrição e impacto]

## 🎨 Formatos Vencedores no Nicho

- **[Formato]:** [Análise baseada em top posts]
- **[Formato]:** [Análise baseada em top posts]

## 🔑 Diferenciais Estratégicos Sugeridos

[3-4 formas de se destacar]

## 📝 Próximos Passos

1. [Passo imediato - 24-48h]
2. [Passo curto prazo - 1-2 semanas]
3. [Passo médio prazo - 1 mês]

---
*Relatório gerado automaticamente em ${new Date().toLocaleDateString('pt-BR')} pela BEX Intelligence*

DIRETRIZES:
- Use dados CONCRETOS dos JSONs fornecidos
- Seja ESPECÍFICO e ACIONÁVEL
- Use emojis para visual
- Tom consultivo profissional
- Cite números sempre que possível`;

    const userPrompt = `Cliente: ${clienteNome}

**Análise do Cliente:**
\`\`\`json
${JSON.stringify(clienteAnalise, null, 2)}
\`\`\`

**Análises dos Concorrentes:**
\`\`\`json
${JSON.stringify(concorrentesAnalises, null, 2)}
\`\`\`

Gere o relatório completo seguindo a estrutura especificada.`;

    console.log('📤 Gerando relatório para:', clienteNome);
    
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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 3000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da IA:', errorText);
      throw new Error(`Erro da IA: ${response.status}`);
    }

    const data = await response.json();
    const relatorioMarkdown = data.choices[0].message.content;

    console.log('✅ Relatório gerado');

    return new Response(
      JSON.stringify({ 
        success: true, 
        relatorio: relatorioMarkdown,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('❌ Erro em generate-competitive-report:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro desconhecido'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
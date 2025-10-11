import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    console.log('📊 Iniciando análise de clientes...');

    // Buscar todos os clientes ativos
    const { data: clientes, error: clientesError } = await supabaseClient
      .from('clientes')
      .select('id, nome')
      .eq('status', 'ativo');

    if (clientesError) throw clientesError;

    const periodo = new Date();
    periodo.setDate(1); // Primeiro dia do mês
    const dataInicio = new Date(periodo);
    dataInicio.setMonth(dataInicio.getMonth() - 1); // Mês passado

    let analisados = 0;

    for (const cliente of clientes || []) {
      // Buscar histórico do cliente no último mês
      const { data: historico, error: historicoError } = await supabaseClient
        .from('historico_tarefas')
        .select('*')
        .eq('cliente_id', cliente.id)
        .gte('data_fim', dataInicio.toISOString())
        .lte('data_fim', periodo.toISOString());

      if (historicoError) {
        console.error(`Erro ao buscar histórico do cliente ${cliente.id}:`, historicoError);
        continue;
      }

      const total = historico?.length || 0;
      if (total === 0) continue;

      const noPrazo = historico?.filter(h => h.atraso_horas === 0).length || 0;
      const percentualPrazo = Math.round((noPrazo / total) * 100);
      const mediaProducao = historico?.reduce((sum, h) => sum + (h.duracao_horas || 0), 0) / total;
      const mediaRevisoes = historico?.reduce((sum, h) => sum + (h.num_revisoes || 0), 0) / total;

      // Estimar satisfação
      let satisfacao: 'baixa' | 'media' | 'alta' = 'media';
      if (percentualPrazo >= 90 && mediaRevisoes < 1.5) satisfacao = 'alta';
      else if (percentualPrazo < 70 || mediaRevisoes > 2) satisfacao = 'baixa';

      // Gerar resumo com IA
      const prompt = `Analise o desempenho do cliente "${cliente.nome}" no último mês:
- ${total} entregas realizadas
- ${percentualPrazo}% concluídas no prazo
- Tempo médio de produção: ${mediaProducao.toFixed(1)}h
- Média de revisões: ${mediaRevisoes.toFixed(1)}x
- Satisfação estimada: ${satisfacao}

Gere um resumo executivo em 2-3 frases destacando pontos fortes e áreas de atenção.`;

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'Você é um analista de performance de projetos.' },
            { role: 'user', content: prompt }
          ],
        }),
      });

      if (!aiResponse.ok) {
        console.error('Erro na API de IA:', await aiResponse.text());
        continue;
      }

      const aiData = await aiResponse.json();
      const resumoIA = aiData.choices[0]?.message?.content || 'Resumo indisponível.';

      // Salvar análise
      await supabaseClient
        .from('inteligencia_cliente')
        .upsert({
          cliente_id: cliente.id,
          periodo: periodo.toISOString().split('T')[0],
          resumo_ia: resumoIA,
          kpis: {
            total_entregas: total,
            entregas_no_prazo: noPrazo,
            percentual_prazo: percentualPrazo,
            media_tempo_producao: mediaProducao,
            indice_revisao: mediaRevisoes
          },
          satisfacao_estimada: satisfacao,
          total_entregas: total,
          entregas_no_prazo: noPrazo,
          media_tempo_producao: mediaProducao,
          indice_revisao: mediaRevisoes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'cliente_id,periodo'
        });

      analisados++;
      console.log(`✅ Análise criada para cliente ${cliente.nome}`);
    }

    return new Response(
      JSON.stringify({ success: true, clientes_analisados: analisados }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na análise de clientes:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

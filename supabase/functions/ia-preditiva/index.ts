import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

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

    console.log('🔮 Iniciando análise preditiva...');

    // 1. Buscar desempenho de cada responsável
    const { data: desempenho, error: desempenhoError } = await supabaseClient
      .from('desempenho_responsavel')
      .select('*');

    if (desempenhoError) throw desempenhoError;

    const riscos = [];

    // 2. Para cada responsável, calcular risco
    for (const r of desempenho || []) {
      // Buscar tarefas pendentes
      const { data: pendentes, error: pendentesError } = await supabaseClient
        .from('tarefa')
        .select('id, prazo_executor, prioridade')
        .eq('responsavel_id', r.responsavel_id)
        .not('status', 'in', '(publicado,aprovado,cancelado)');

      if (pendentesError) {
        console.error('Erro ao buscar pendentes:', pendentesError);
        continue;
      }

      const numPendentes = pendentes?.length || 0;

      // Calcular score usando função do banco
      const { data: scoreData } = await supabaseClient.rpc('calcular_score_risco', {
        p_media_execucao: r.media_execucao || 8,
        p_media_atraso: r.media_atraso || 0,
        p_total_entregas: r.total_entregas || 1,
        p_tarefas_pendentes: numPendentes
      });

      const score = scoreData || 0;

      // Classificar status
      const status = score >= 80 ? 'critico' : score >= 50 ? 'alerta' : 'normal';

      // Gerar sugestão
      let sugestao = 'Fluxo dentro do normal.';
      if (status === 'critico') {
        sugestao = `⚠️ Sobrecarga detectada! ${numPendentes} tarefas pendentes. Sugestão: Redistribuir 2-3 tarefas ou revisar prazos.`;
      } else if (status === 'alerta') {
        sugestao = `⚡ Atenção necessária. ${numPendentes} tarefas pendentes. Sugestão: Acompanhar de perto e priorizar entregas.`;
      }

      // Encontrar prazo mais próximo
      const prazoProximo = pendentes
        ?.filter(t => t.prazo_executor)
        .sort((a, b) => new Date(a.prazo_executor).getTime() - new Date(b.prazo_executor).getTime())[0]
        ?.prazo_executor;

      // Inserir ou atualizar risco
      const { error: riscoError } = await supabaseClient
        .from('risco_producao')
        .upsert({
          referencia: new Date().toISOString().split('T')[0],
          responsavel_id: r.responsavel_id,
          score_risco: score,
          status,
          carga_atual: Math.round((numPendentes * (r.media_execucao || 8))),
          tarefas_pendentes: numPendentes,
          prazo_mais_proximo: prazoProximo,
          sugestao,
          metadata: {
            media_execucao: r.media_execucao,
            media_atraso: r.media_atraso,
            total_entregas: r.total_entregas
          },
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'referencia,responsavel_id',
          ignoreDuplicates: false
        });

      if (riscoError) {
        console.error('Erro ao inserir risco:', riscoError);
      } else {
        riscos.push({ responsavel_id: r.responsavel_id, score, status });
      }

      // 3. Gerar notificação se crítico
      if (status === 'critico') {
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('nome, especialidade')
          .eq('id', r.responsavel_id)
          .single();

        // Notificar admins
        const { data: admins } = await supabaseClient
          .from('user_roles')
          .select('user_id')
          .in('role', ['admin', 'gestor']);

        for (const admin of admins || []) {
          await supabaseClient.from('notificacoes').insert({
            user_id: admin.user_id,
            titulo: '🚨 Sobrecarga Crítica Detectada',
            mensagem: `${profile?.nome || 'Responsável'} (${profile?.especialidade}) está com risco crítico (score ${Math.round(score)}). ${numPendentes} tarefas pendentes.`,
            tipo: 'warning',
            data_evento: new Date().toISOString()
          });
        }
      }
    }

    console.log(`✅ Análise concluída. ${riscos.length} riscos calculados.`);

    return new Response(
      JSON.stringify({
        success: true,
        riscos_calculados: riscos.length,
        criticos: riscos.filter(r => r.status === 'critico').length,
        alertas: riscos.filter(r => r.status === 'alerta').length,
        normais: riscos.filter(r => r.status === 'normal').length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na análise preditiva:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

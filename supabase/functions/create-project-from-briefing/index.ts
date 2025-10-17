import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { briefingId } = await req.json();

    if (!briefingId) {
      throw new Error('briefingId é obrigatório');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Buscar briefing completo
    const { data: briefing, error: briefingError } = await supabaseClient
      .from('briefings')
      .select(`
        *,
        pacotes:pacote_id (
          id,
          nome,
          tipo
        ),
        clientes:cliente_id (
          id,
          nome
        )
      `)
      .eq('id', briefingId)
      .single();

    if (briefingError) throw briefingError;

    // Criar projeto
    const projetoData = {
      cliente_id: briefing.cliente_id,
      titulo: briefing.titulo,
      descricao: `Projeto criado automaticamente a partir do briefing: ${briefing.titulo}`,
      tipo: 'campanha', // Sempre campanha para jobs não-recorrentes
      status: 'ativo',
      data_inicio: new Date().toISOString().split('T')[0],
      prazo_final: briefing.data_entrega,
      mes_referencia: briefing.data_entrega,
    };

    const { data: projeto, error: projetoError } = await supabaseClient
      .from('projetos')
      .insert(projetoData)
      .select()
      .single();

    if (projetoError) throw projetoError;

    // Buscar itens do pacote e seus templates
    const { data: pacoteItens, error: itensError } = await supabaseClient
      .from('pacote_itens')
      .select(`
        *,
        pacote_task_templates (*)
      `)
      .eq('pacote_id', briefing.pacote_id)
      .order('ordem', { ascending: true });

    if (itensError) throw itensError;

    // Gerar tarefas
    const tarefas: any[] = [];
    const tarefasMap: Record<string, string> = {}; // titulo -> tarefa_id

    for (const item of pacoteItens) {
      if (item.pacote_task_templates && item.pacote_task_templates.length > 0) {
        for (const template of item.pacote_task_templates) {
          const prazo = new Date(briefing.data_entrega);
          prazo.setDate(prazo.getDate() - template.prazo_offset_dias);

          const tarefaData = {
            projeto_id: projeto.id,
            cliente_id: briefing.cliente_id,
            titulo: template.titulo,
            descricao: template.descricao || `${template.titulo} - ${item.nome}`,
            tipo: 'outro', // Usar 'outro' para todas as tarefas
            status: 'aberta',
            prioridade: 'alta',
            data_prazo: prazo.toISOString().split('T')[0],
            setor_responsavel: template.skill === 'design' ? 'design' :
                              template.skill === 'filmmaker' || template.skill === 'editor' || template.skill === 'motion' ? 'audiovisual' :
                              template.skill === 'social' ? 'grs' : 'grs',
            metadata: {
              briefing_id: briefingId,
              pacote_item_id: item.id,
              template_id: template.id,
              checklist: template.checklist_items || [],
              anexos_obrigatorios: template.anexos_obrigatorios || [],
              dependencias: template.depende_de || [],
            },
          };

          tarefas.push(tarefaData);
        }
      }
    }

    // Inserir todas as tarefas
    const { data: tarefasCriadas, error: tarefasError } = await supabaseClient
      .from('tarefa')
      .insert(tarefas)
      .select();

    if (tarefasError) throw tarefasError;

    // Atualizar briefing com projeto criado
    await supabaseClient
      .from('briefings')
      .update({
        projeto_gerado_id: projeto.id,
        status_briefing: 'aprovado',
      })
      .eq('id', briefingId);

    // Log do evento (Event Bus será implementado via migration)
    try {
      await supabaseClient.from('event_logs').insert({
        event_type: 'project.created',
        payload: {
          projeto_id: projeto.id,
          briefing_id: briefingId,
          cliente_id: briefing.cliente_id,
          tarefas_criadas: tarefasCriadas.length,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'create-project-from-briefing',
        },
      });
    } catch (eventError) {
      console.warn('Erro ao registrar evento:', eventError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        projeto_id: projeto.id,
        tarefas_criadas: tarefasCriadas.length,
        tarefas: tarefasCriadas,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

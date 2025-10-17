import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DisparoProducaoParams {
  planejamentoId: string;
  projetoId: string;
  clienteId: string;
  posts: any[];
}

export async function dispararProducao({
  planejamentoId,
  projetoId,
  clienteId,
  posts
}: DisparoProducaoParams) {
  try {
    console.log('🚀 Disparando produção automática...');

    // Agrupar posts por especialidade
    const postsDesign = posts.filter(p => ['post', 'carrossel'].includes(p.formato_postagem));
    const postsVideo = posts.filter(p => ['video', 'reels', 'story'].includes(p.formato_postagem));

    // Buscar especialistas do projeto
    const { data: especialistas } = await supabase
      .from('projeto_especialistas')
      .select('especialista_id, especialidade, profiles(*)')
      .eq('projeto_id', projetoId);

    const designer = especialistas?.find(e => e.especialidade === 'design');
    const filmmaker = especialistas?.find(e => e.especialidade === 'audiovisual');
    const grs = especialistas?.find(e => e.especialidade === 'grs');

    const tarefasCriadas = [];

    // Criar tarefa para Designer
    if (postsDesign.length > 0 && designer) {
      const { data: tarefaDesign, error: errorDesign } = await supabase
        .from('tarefa')
        .insert({
          cliente_id: clienteId,
          responsavel_id: grs?.especialista_id || null,
          executor_id: designer.especialista_id,
          titulo: `Criar Artes - Planejamento ${new Date().toLocaleDateString('pt-BR', { month: 'long' })}`,
          descricao: `Criar ${postsDesign.length} peças de design conforme planejamento editorial aprovado.\n\nFormatos: ${postsDesign.map(p => p.formato_postagem).join(', ')}`,
          status: 'pendente',
          prioridade: 'alta',
          setor: 'design',
          data_prazo: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        })
        .select()
        .single();

      if (!errorDesign && tarefaDesign) {
        tarefasCriadas.push({ tipo: 'Design', id: tarefaDesign.id });

        // Notificar designer
        await supabase.from('notificacoes').insert({
          user_id: designer.especialista_id,
          titulo: 'Nova Tarefa de Design',
          mensagem: `Você foi designado para criar ${postsDesign.length} peças de arte.`,
          tipo: 'info',
        });
      }
    }

    // Criar tarefa para Filmmaker
    if (postsVideo.length > 0 && filmmaker) {
      const { data: tarefaVideo, error: errorVideo } = await supabase
        .from('tarefa')
        .insert({
          cliente_id: clienteId,
          responsavel_id: grs?.especialista_id || null,
          executor_id: filmmaker.especialista_id,
          titulo: `Produzir Vídeos - Planejamento ${new Date().toLocaleDateString('pt-BR', { month: 'long' })}`,
          descricao: `Produzir ${postsVideo.length} vídeos conforme planejamento editorial aprovado.\n\nFormatos: ${postsVideo.map(p => p.formato_postagem).join(', ')}`,
          status: 'pendente',
          prioridade: 'alta',
          setor: 'audiovisual',
          data_prazo: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        })
        .select()
        .single();

      if (!errorVideo && tarefaVideo) {
        tarefasCriadas.push({ tipo: 'Audiovisual', id: tarefaVideo.id });

        // Notificar filmmaker
        await supabase.from('notificacoes').insert({
          user_id: filmmaker.especialista_id,
          titulo: 'Nova Tarefa de Vídeo',
          mensagem: `Você foi designado para produzir ${postsVideo.length} vídeos.`,
          tipo: 'info',
        });
      }
    }

    // Criar tarefa de revisão para GRS
    if (grs) {
      const { data: tarefaGRS, error: errorGRS } = await supabase
        .from('tarefa')
        .insert({
          cliente_id: clienteId,
          responsavel_id: grs.especialista_id,
          executor_id: grs.especialista_id,
          titulo: `Revisar Conteúdo - Planejamento ${new Date().toLocaleDateString('pt-BR', { month: 'long' })}`,
          descricao: `Revisar e ajustar ${posts.length} posts do planejamento editorial aprovado.`,
          status: 'pendente',
          prioridade: 'alta',
          setor: 'grs',
          data_prazo: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        })
        .select()
        .single();

      if (!errorGRS && tarefaGRS) {
        tarefasCriadas.push({ tipo: 'GRS', id: tarefaGRS.id });
      }
    }

    console.log(`✅ ${tarefasCriadas.length} tarefas criadas:`, tarefasCriadas);
    
    toast.success(`${tarefasCriadas.length} tarefas criadas para especialistas!`);

    return { success: true, tarefas: tarefasCriadas };

  } catch (error: any) {
    console.error('❌ Erro ao disparar produção:', error);
    toast.error('Erro ao criar tarefas de produção');
    return { success: false, error: error.message };
  }
}

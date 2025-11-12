import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast-compat';

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

    console.log(`📊 Posts Design: ${postsDesign.length}, Posts Vídeo: ${postsVideo.length}`);

    // Atualizar status do planejamento para "em_producao"
    const { error: updateError } = await supabase
      .from('planejamentos')
      .update({ status: 'em_producao' })
      .eq('id', planejamentoId);

    if (updateError) {
      console.error('Erro ao atualizar planejamento:', updateError);
    }

    // Notificar que o planejamento entrou em produção
    toast.success(`Planejamento enviado para produção!`);
    toast.info(`${postsDesign.length} peças de design e ${postsVideo.length} vídeos programados`);

    console.log('✅ Planejamento marcado para produção');

    return { 
      success: true, 
      stats: {
        totalPosts: posts.length,
        postsDesign: postsDesign.length,
        postsVideo: postsVideo.length
      }
    };

  } catch (error: any) {
    console.error('❌ Erro ao disparar produção:', error);
    toast.error('Erro ao enviar para produção');
    return { success: false, error: error.message };
  }
}

import { supabase } from '@/integrations/supabase/client';
import { addDays, startOfMonth, format } from 'date-fns';

interface PlanoEstrategico {
  missao?: string;
  visao?: string;
  valores?: string[];
}

interface Objetivo {
  id: string;
  titulo: string;
  descricao?: string;
}

/**
 * Gera posts automaticamente baseado na assinatura do cliente
 * Distribui posts ao longo do mês (seg/qua/sex)
 * Alinha conteúdo com objetivos estratégicos e valores da marca
 */
export async function gerarPostsAutomaticos(
  planejamentoId: string,
  quantidadePosts: number,
  planoEstrategico?: PlanoEstrategico,
  clienteId?: string
) {
  try {
    console.log('📅 Gerando', quantidadePosts, 'posts automáticos para planejamento', planejamentoId);

    // 1. Buscar planejamento para pegar mes_referencia
    const { data: planejamento } = await supabase
      .from('planejamentos')
      .select('mes_referencia, cliente_id')
      .eq('id', planejamentoId)
      .single();

    if (!planejamento) {
      throw new Error('Planejamento não encontrado');
    }

    const clienteFinal = clienteId || planejamento.cliente_id;

    // 2. Buscar objetivos do cliente
    const { data: objetivosData } = await supabase
      .from('cliente_objetivos')
      .select('objetivos')
      .eq('cliente_id', clienteFinal)
      .single();

    const objetivosJson = objetivosData?.objetivos as any;
    const objetivos: Objetivo[] = objetivosJson?.objetivos || [];

    // 3. Buscar onboarding para contexto
    const { data: onboarding } = await supabase
      .from('cliente_onboarding')
      .select('*')
      .eq('cliente_id', clienteFinal)
      .single();

    // 4. Gerar cronograma (seg/qua/sex)
    const cronograma = gerarCronogramaPosts(
      new Date(planejamento.mes_referencia),
      quantidadePosts
    );

    // 5. Distribuir posts por objetivos (round-robin)
    const distribuicao = distribuirPostsPorObjetivos(objetivos, quantidadePosts);

    // 6. Gerar estrutura de posts
    const posts = [];
    const tiposCreativos = ['post', 'carrossel', 'video', 'stories'];

    for (let i = 0; i < quantidadePosts; i++) {
      const objetivo = distribuicao[i];
      const tipoCreativo = tiposCreativos[i % tiposCreativos.length];
      
      // Criar post com dados básicos
      // A geração de conteúdo com IA será feita depois (opcional)
      posts.push({
        planejamento_id: planejamentoId,
        data_postagem: cronograma[i],
        titulo: objetivo 
          ? `Post sobre: ${objetivo.titulo}` 
          : `Post ${i + 1} - ${format(cronograma[i], 'dd/MM')}`,
        objetivo_postagem: objetivo?.titulo || 'Engajamento geral',
        legenda: '', // Será preenchido manualmente ou via IA depois
        hashtags: onboarding?.publico_alvo || [],
        tipo_criativo: tipoCreativo,
        formato_postagem: tipoCreativo === 'stories' ? 'stories' : 'post',
        rede_social: 'instagram',
        contexto_estrategico: JSON.stringify({
          objetivo_id: objetivo?.id || null,
          valor_alinhado: planoEstrategico?.valores?.[i % (planoEstrategico?.valores?.length || 5)],
          missao_referencia: planoEstrategico?.missao,
          gerado_automaticamente: true,
          data_geracao: new Date().toISOString()
        }),
        status: 'pendente'
      });
    }

    // 7. Inserir posts no banco
    const { data: postsInseridos, error } = await supabase
      .from('posts_planejamento')
      .insert(posts)
      .select();

    if (error) {
      console.error('Erro ao inserir posts:', error);
      throw error;
    }

    console.log('✅', postsInseridos?.length, 'posts gerados automaticamente');

    return {
      success: true,
      posts: postsInseridos,
      quantidade: postsInseridos?.length || 0
    };

  } catch (error) {
    console.error('❌ Erro ao gerar posts automáticos:', error);
    throw error;
  }
}

/**
 * Gera cronograma de posts (seg/qua/sex) ao longo do mês
 */
function gerarCronogramaPosts(mesReferencia: Date, quantidade: number): Date[] {
  const cronograma: Date[] = [];
  const inicioDia = startOfMonth(mesReferencia);
  let diaAtual = new Date(inicioDia);

  // Dias da semana para posts: 1 (seg), 3 (qua), 5 (sex)
  const diasPostagem = [1, 3, 5];
  let indiceDay = 0;

  while (cronograma.length < quantidade) {
    const diaSemana = diaAtual.getDay();
    
    // Se for seg/qua/sex, adicionar ao cronograma
    if (diasPostagem.includes(diaSemana)) {
      cronograma.push(new Date(diaAtual));
    }

    diaAtual = addDays(diaAtual, 1);

    // Segurança: se passar de 60 dias, parar
    if (cronograma.length === 0 && diaAtual > addDays(inicioDia, 60)) {
      break;
    }
  }

  // Se não conseguiu gerar quantidade suficiente, preencher com dias consecutivos
  while (cronograma.length < quantidade) {
    cronograma.push(addDays(cronograma[cronograma.length - 1] || inicioDia, 2));
  }

  return cronograma.slice(0, quantidade);
}

/**
 * Distribui posts entre objetivos de forma equilibrada (round-robin)
 */
function distribuirPostsPorObjetivos(
  objetivos: Objetivo[],
  quantidadePosts: number
): (Objetivo | null)[] {
  if (!objetivos || objetivos.length === 0) {
    // Se não há objetivos, retornar array de nulls
    return Array(quantidadePosts).fill(null);
  }

  const distribuicao: (Objetivo | null)[] = [];
  
  for (let i = 0; i < quantidadePosts; i++) {
    distribuicao.push(objetivos[i % objetivos.length]);
  }

  return distribuicao;
}

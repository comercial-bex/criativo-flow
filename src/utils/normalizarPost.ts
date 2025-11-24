/**
 * Normaliza dados de posts vindos de diferentes fontes (IA, manual, DB)
 * para um formato unificado compatível com todos os componentes
 */

export interface PostNormalizado {
  id: string;
  titulo: string;
  data_postagem: string;
  formato_postagem: string;
  tipo_conteudo: string;
  texto_estruturado: string;
  legenda?: string;
  hashtags?: string[];
  call_to_action?: string;
  objetivo_postagem?: string;
  arquivo_visual_url?: string;
  arquivo_visual_tipo?: string;
  arquivo_visual_nome?: string;
  responsavel_id?: string;
  contexto_estrategico?: string;
  rede_social?: string;
  status_post?: string;
  status_aprovacao_cliente?: string;
  tarefa_vinculada_id?: string;
  planejamento_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Normaliza um post de qualquer fonte para o formato padrão
 */
export function normalizarPost(post: any): PostNormalizado {
  if (!post) {
    throw new Error('Post inválido: dados vazios');
  }

  // Mapeamento de campos antigos para novos
  const formatoPostagem = post.formato_postagem || post.formato_criativo || post.tipo_criativo || 'post';
  const tipoConteudo = post.tipo_conteudo || post.objetivo_postagem || 'informar';
  const textoEstruturado = post.texto_estruturado || post.legenda || post.descricao || '';
  const statusPost = post.status_post || post.status || 'rascunho';
  const arquivoUrl = post.arquivo_visual_url || post.anexo_url || post.imagem_url || '';
  const arquivoTipo = post.arquivo_visual_tipo || post.tipo_criativo || '';

  // Normalizar data_postagem (garantir formato YYYY-MM-DD)
  let dataPostagem = post.data_postagem || '';
  if (dataPostagem && dataPostagem.includes('T')) {
    dataPostagem = dataPostagem.split('T')[0];
  }

  // Normalizar hashtags
  let hashtags = post.hashtags || [];
  if (typeof hashtags === 'string') {
    hashtags = hashtags.split(/\s+/).filter(h => h.trim());
  }

  const postNormalizado: PostNormalizado = {
    id: post.id || `temp-${Date.now()}`,
    titulo: post.titulo || 'Sem título',
    data_postagem: dataPostagem,
    formato_postagem: formatoPostagem,
    tipo_conteudo: tipoConteudo,
    texto_estruturado: textoEstruturado,
    legenda: post.legenda,
    hashtags,
    call_to_action: post.call_to_action || post.cta || '',
    objetivo_postagem: post.objetivo_postagem || tipoConteudo,
    arquivo_visual_url: arquivoUrl,
    arquivo_visual_tipo: arquivoTipo,
    arquivo_visual_nome: post.arquivo_visual_nome,
    responsavel_id: post.responsavel_id,
    contexto_estrategico: post.contexto_estrategico || post.observacoes || '',
    rede_social: post.rede_social || 'instagram',
    status_post: statusPost,
    status_aprovacao_cliente: post.status_aprovacao_cliente,
    tarefa_vinculada_id: post.tarefa_vinculada_id,
    planejamento_id: post.planejamento_id,
    created_at: post.created_at,
    updated_at: post.updated_at,
  };

  console.log('📋 Post normalizado:', {
    original: post,
    normalizado: postNormalizado
  });

  return postNormalizado;
}

/**
 * Normaliza um array de posts
 */
export function normalizarPosts(posts: any[]): PostNormalizado[] {
  if (!Array.isArray(posts)) {
    console.warn('⚠️ normalizarPosts: entrada não é um array', posts);
    return [];
  }
  
  return posts.map(post => {
    try {
      return normalizarPost(post);
    } catch (error) {
      console.error('❌ Erro ao normalizar post:', error, post);
      return null;
    }
  }).filter(Boolean) as PostNormalizado[];
}

/**
 * Valida se um post tem os campos obrigatórios
 */
export function validarPost(post: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!post.titulo || post.titulo.trim() === '') {
    errors.push('Título é obrigatório');
  }

  if (!post.data_postagem) {
    errors.push('Data de postagem é obrigatória');
  }

  if (!post.formato_postagem) {
    errors.push('Formato de postagem é obrigatório');
  }

  if (!post.tipo_conteudo) {
    errors.push('Tipo de conteúdo é obrigatório');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

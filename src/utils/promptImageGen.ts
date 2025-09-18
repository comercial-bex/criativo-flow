interface OnboardingData {
  segmentoAtuacao?: string;
  produtosServicos?: string;
  publicoAlvo?: string[];
  tiposClientes?: string;
  valoresPrincipais?: string;
  tomVoz?: string[];
  historiaMarca?: string;
  comoLembrada?: string;
  diferenciais?: string;
  localizacao?: string;
  areaAtendimento?: string;
}

interface PostData {
  titulo: string;
  legenda?: string;
  objetivo_postagem: string;
  tipo_criativo: string;
  formato_postagem: string;
  persona_alvo?: string;
  contexto_estrategico?: string;
}

export function criarPromptImagem(post: PostData, onboarding?: OnboardingData): string {
  // Análise do contexto da empresa
  const segmento = onboarding?.segmentoAtuacao || '';
  const publico = onboarding?.publicoAlvo || [];
  const valores = onboarding?.valoresPrincipais || '';
  const tom = onboarding?.tomVoz || [];
  const diferenciais = onboarding?.diferenciais || '';
  
  // Determinação do perfil demográfico
  const demografico = determinarDemografico(publico, onboarding?.tiposClientes || '');
  
  // Análise do tipo de conteúdo
  const tipoConteudo = analisarTipoConteudo(post.objetivo_postagem, post.legenda || '');
  
  // Templates base por categoria
  let promptBase = '';
  
  if (tipoConteudo === 'pessoas') {
    promptBase = criarPromptPessoas(demografico, segmento, valores);
  } else if (tipoConteudo === 'produto') {
    promptBase = criarPromptProduto(onboarding?.produtosServicos || '', segmento, diferenciais);
  } else if (tipoConteudo === 'lifestyle') {
    promptBase = criarPromptLifestyle(valores, tom, segmento);
  } else {
    promptBase = criarPromptEducativo(segmento, valores);
  }
  
  // Elementos técnicos baseados no formato
  const elementosTecnicos = getElementosTecnicos(post.formato_postagem);
  
  // Contexto geográfico/cultural
  const contextoLocal = onboarding?.localizacao || onboarding?.areaAtendimento || 'Brasil';
  const contextoGeografico = contextoLocal.includes('Brasil') || contextoLocal.includes('brasileir') 
    ? 'ambiente brasileiro, diversidade cultural brasileira' 
    : `ambiente de ${contextoLocal}`;
  
  // Construção do prompt final
  const promptFinal = `${promptBase}

  Elementos técnicos: ${elementosTecnicos}
  Contexto geográfico: ${contextoGeografico}
  Segmento: ${segmento}
  
  Estilo fotográfico: ${getEstiloFotografico(tipoConteudo, segmento)}
  Qualidade: Ultra alta resolução, profissional, pronto para redes sociais
  Composição: Regra dos terços, boa iluminação, cores vibrantes mas harmoniosas
  
  Evitar: Textos visíveis, logos, marcas específicas, elementos genéricos ou clichês`;

  return promptFinal;
}

function determinarDemografico(publicoAlvo: string[], tiposClientes: string): string {
  const texto = `${publicoAlvo.join(' ')} ${tiposClientes}`.toLowerCase();
  
  if (texto.includes('jovem') || texto.includes('18-30') || texto.includes('geração z')) {
    return 'jovem brasileiro entre 20-30 anos, moderno, conectado';
  } else if (texto.includes('executiv') || texto.includes('profissional') || texto.includes('corporativ')) {
    return 'profissional brasileiro entre 30-45 anos, executivo, confiante';
  } else if (texto.includes('família') || texto.includes('mãe') || texto.includes('pai')) {
    return 'pessoa brasileira entre 35-50 anos, perfil familiar, caloroso';
  } else if (texto.includes('idoso') || texto.includes('terceira idade') || texto.includes('50+')) {
    return 'pessoa brasileira madura, entre 50-65 anos, experiente, sábia';
  } else if (texto.includes('mulher') || texto.includes('feminino')) {
    return 'mulher brasileira entre 25-40 anos, elegante, determinada';
  } else if (texto.includes('homem') || texto.includes('masculino')) {
    return 'homem brasileiro entre 30-45 anos, profissional, seguro';
  }
  
  return 'pessoa brasileira entre 25-45 anos, moderna, autêntica';
}

function analisarTipoConteudo(objetivo: string, legenda: string): string {
  const texto = `${objetivo} ${legenda}`.toLowerCase();
  
  if (texto.includes('pessoa') || texto.includes('cliente') || texto.includes('depoimento') || 
      texto.includes('equipe') || texto.includes('profissional') || texto.includes('humano')) {
    return 'pessoas';
  } else if (texto.includes('produto') || texto.includes('serviço') || texto.includes('oferta') || 
             texto.includes('venda') || texto.includes('demonstr')) {
    return 'produto';
  } else if (texto.includes('estilo') || texto.includes('vida') || texto.includes('inspiração') || 
             texto.includes('valor') || texto.includes('cultura')) {
    return 'lifestyle';
  } else {
    return 'educativo';
  }
}

function criarPromptPessoas(demografico: string, segmento: string, valores: string): string {
  return `Fotografia profissional de ${demografico}, 
  expressão natural e confiante, sorriso genuíno,
  ${getAmbientePorSegmento(segmento)},
  representando ${valores || 'profissionalismo e confiança'},
  luz natural suave, cores harmoniosas`;
}

function criarPromptProduto(produtos: string, segmento: string, diferenciais: string): string {
  return `Fotografia comercial profissional de ${produtos || 'produto/serviço'},
  ${getAmbientePorSegmento(segmento)},
  destacando ${diferenciais || 'qualidade e inovação'},
  composição elegante, lighting profissional,
  cores que transmitem qualidade premium`;
}

function criarPromptLifestyle(valores: string, tom: string[], segmento: string): string {
  const estiloVida = tom.includes('descontraído') || tom.includes('jovem') ? 'descontraído e moderno' : 'elegante e sofisticado';
  
  return `Fotografia lifestyle ${estiloVida},
  representando ${valores || 'qualidade de vida e bem-estar'},
  ${getAmbientePorSegmento(segmento)},
  atmosfera inspiradora, cores vibrantes mas equilibradas,
  composição que transmite aspiração e realizações`;
}

function criarPromptEducativo(segmento: string, valores: string): string {
  return `Composição visual educativa e informativa,
  ${getAmbientePorSegmento(segmento)},
  elementos que transmitem conhecimento e ${valores || 'credibilidade'},
  estilo clean e profissional, cores que facilitam a leitura,
  layout organizado e visualmente atrativo`;
}

function getAmbientePorSegmento(segmento: string): string {
  const seg = segmento.toLowerCase();
  
  if (seg.includes('saúde') || seg.includes('médic') || seg.includes('clínic')) {
    return 'ambiente médico moderno e clean, cores brancas e azuis suaves';
  } else if (seg.includes('educação') || seg.includes('escola') || seg.includes('curso')) {
    return 'ambiente educacional inspirador, biblioteca ou sala moderna';
  } else if (seg.includes('tecnologia') || seg.includes('software') || seg.includes('digital')) {
    return 'ambiente tecnológico moderno, escritório inovador, elementos digitais';
  } else if (seg.includes('food') || seg.includes('restaurante') || seg.includes('alimentação')) {
    return 'ambiente gastronômico acolhedor, cozinha moderna ou restaurante elegante';
  } else if (seg.includes('beleza') || seg.includes('estética') || seg.includes('cosmético')) {
    return 'ambiente spa elegante, cores suaves e naturais, lighting premium';
  } else if (seg.includes('construção') || seg.includes('arquitetura') || seg.includes('imobiliário')) {
    return 'ambiente arquitetônico moderno, canteiro organizado ou escritório elegante';
  } else if (seg.includes('jurídico') || seg.includes('advocacia') || seg.includes('consultoria')) {
    return 'escritório profissional elegante, biblioteca jurídica, ambiente corporativo';
  } else {
    return 'ambiente profissional moderno e acolhedor, iluminação natural';
  }
}

function getElementosTecnicos(formato: string): string {
  switch (formato) {
    case 'story':
      return 'formato vertical 9:16, foco central, elementos na parte superior e inferior para texto';
    case 'reel':
      return 'formato vertical 9:16, composição dinâmica, elementos em movimento visual';
    case 'carrossel':
      return 'formato quadrado 1:1, composição balanceada, elementos que sugerem continuidade';
    default:
      return 'formato quadrado 1:1, composição centrada, boa distribuição de elementos';
  }
}

function getEstiloFotografico(tipoConteudo: string, segmento: string): string {
  if (tipoConteudo === 'pessoas') {
    return 'retrato profissional, fotojornalismo corporativo, luz natural';
  } else if (tipoConteudo === 'produto') {
    return 'fotografia comercial, product photography, iluminação controlada';
  } else if (tipoConteudo === 'lifestyle') {
    return 'fotografia lifestyle, editorial, cores vibrantes, composição aspiracional';
  } else {
    return 'fotografia institucional, clean, minimalista, cores profissionais';
  }
}
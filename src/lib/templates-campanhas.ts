export interface TemplateCampanha {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  dataFixa: string | null; // formato DD/MM ou null para datas móveis
  mesReferencia: number;
  tipo: 'nacional' | 'regional' | 'segmento';
  potencialEngajamento: 'alto' | 'medio' | 'baixo';
  
  // Configurações sugeridas
  diasPreCampanha: number;
  diasPosCampanha: number;
  objetivosSugeridos: string[];
  orcamentoSugerido: number;
  
  // Estrutura de posts sugerida
  estruturaPosts: {
    preCampanha: {
      quantidade: number;
      tiposSugeridos: string[];
      temasPrincipais: string[];
    };
    duranteCampanha: {
      quantidade: number;
      tiposSugeridos: string[];
      temasPrincipais: string[];
    };
    posCampanha: {
      quantidade: number;
      tiposSugeridos: string[];
      temasPrincipais: string[];
    };
  };
  
  sugestaoCampanha: string;
  dicasConteudo: string[];
}

export const TEMPLATES_CAMPANHAS: TemplateCampanha[] = [
  {
    id: 'natal',
    nome: 'Natal',
    descricao: 'Campanha completa para o período natalino com estratégia de vendas e engajamento',
    icone: '🎄',
    dataFixa: '25/12',
    mesReferencia: 12,
    tipo: 'nacional',
    potencialEngajamento: 'alto',
    diasPreCampanha: 30,
    diasPosCampanha: 5,
    objetivosSugeridos: ['conversao', 'awareness', 'engajamento'],
    orcamentoSugerido: 5000,
    estruturaPosts: {
      preCampanha: {
        quantidade: 12,
        tiposSugeridos: ['carrossel', 'video', 'stories'],
        temasPrincipais: [
          'Contagem regressiva para o Natal',
          'Dicas de presentes',
          'Promoções antecipadas',
          'Clima natalino e decoração'
        ]
      },
      duranteCampanha: {
        quantidade: 8,
        tiposSugeridos: ['feed', 'reels', 'stories'],
        temasPrincipais: [
          'Ofertas especiais de Natal',
          'Última chance para compras',
          'Entrega expressa disponível',
          'Depoimentos de clientes satisfeitos'
        ]
      },
      posCampanha: {
        quantidade: 3,
        tiposSugeridos: ['feed', 'stories'],
        temasPrincipais: [
          'Agradecimento aos clientes',
          'Promoção de troca e devolução',
          'Preparação para Ano Novo'
        ]
      }
    },
    sugestaoCampanha: 'Campanha completa de Natal com foco em vendas e engajamento através de conteúdo temático, ofertas progressivas e criação de senso de urgência',
    dicasConteudo: [
      'Usar cores natalinas (vermelho, verde, dourado)',
      'Incluir música de Natal nos vídeos',
      'Criar senso de urgência com contagem regressiva',
      'Mostrar produtos como sugestões de presentes',
      'Destacar política de trocas e devoluções'
    ]
  },
  {
    id: 'black-friday',
    nome: 'Black Friday',
    descricao: 'Maior campanha de vendas do ano com ofertas agressivas e alto volume',
    icone: '🛍️',
    dataFixa: null, // Última sexta-feira de novembro
    mesReferencia: 11,
    tipo: 'nacional',
    potencialEngajamento: 'alto',
    diasPreCampanha: 14,
    diasPosCampanha: 3,
    objetivosSugeridos: ['conversao', 'awareness'],
    orcamentoSugerido: 8000,
    estruturaPosts: {
      preCampanha: {
        quantidade: 10,
        tiposSugeridos: ['teaser', 'video', 'stories'],
        temasPrincipais: [
          'Preparação e aquecimento',
          'Preview de ofertas',
          'Cadastro antecipado',
          'Expectativa e contagem regressiva'
        ]
      },
      duranteCampanha: {
        quantidade: 15,
        tiposSugeridos: ['feed', 'reels', 'stories', 'anuncios'],
        temasPrincipais: [
          'Ofertas relâmpago',
          'Descontos progressivos',
          'Estoque limitado',
          'Prova social e depoimentos',
          'Live de vendas'
        ]
      },
      posCampanha: {
        quantidade: 2,
        tiposSugeridos: ['feed', 'stories'],
        temasPrincipais: [
          'Últimas unidades',
          'Preparação para Cyber Monday'
        ]
      }
    },
    sugestaoCampanha: 'Campanha agressiva de vendas com ofertas progressivas, senso de urgência máximo e múltiplos pontos de contato',
    dicasConteudo: [
      'Usar cores preta, amarela e vermelha',
      'Criar urgência com timers e countdown',
      'Mostrar economia em reais e percentual',
      'Destacar frete grátis e entrega rápida',
      'Usar depoimentos de clientes anteriores'
    ]
  },
  {
    id: 'dia-das-maes',
    nome: 'Dia das Mães',
    descricao: 'Segunda maior data comercial do ano com foco emocional',
    icone: '💐',
    dataFixa: null, // 2º domingo de maio
    mesReferencia: 5,
    tipo: 'nacional',
    potencialEngajamento: 'alto',
    diasPreCampanha: 21,
    diasPosCampanha: 2,
    objetivosSugeridos: ['conversao', 'engajamento', 'awareness'],
    orcamentoSugerido: 4000,
    estruturaPosts: {
      preCampanha: {
        quantidade: 10,
        tiposSugeridos: ['carrossel', 'video', 'stories'],
        temasPrincipais: [
          'Homenagem e celebração das mães',
          'Guia de presentes perfeitos',
          'Histórias inspiradoras',
          'Ofertas antecipadas'
        ]
      },
      duranteCampanha: {
        quantidade: 6,
        tiposSugeridos: ['feed', 'reels', 'stories'],
        temasPrincipais: [
          'Última chance para presentear',
          'Entrega garantida no prazo',
          'Kits especiais',
          'Mensagens personalizadas'
        ]
      },
      posCampanha: {
        quantidade: 2,
        tiposSugeridos: ['stories', 'feed'],
        temasPrincipais: [
          'Agradecimento',
          'Compartilhamento de momentos especiais'
        ]
      }
    },
    sugestaoCampanha: 'Campanha emocional focada em homenagem e presenteação, com sugestões personalizadas e garantia de entrega',
    dicasConteudo: [
      'Usar tom emocional e afetivo',
      'Mostrar produtos como presentes especiais',
      'Incluir mensagens de homenagem',
      'Destacar embalagens bonitas e cartões',
      'Garantir e evidenciar entrega no prazo'
    ]
  },
  {
    id: 'dia-dos-pais',
    nome: 'Dia dos Pais',
    descricao: 'Homenagem aos pais com foco em presentes práticos e emocionais',
    icone: '👔',
    dataFixa: null, // 2º domingo de agosto
    mesReferencia: 8,
    tipo: 'nacional',
    potencialEngajamento: 'alto',
    diasPreCampanha: 14,
    diasPosCampanha: 2,
    objetivosSugeridos: ['conversao', 'engajamento'],
    orcamentoSugerido: 3500,
    estruturaPosts: {
      preCampanha: {
        quantidade: 8,
        tiposSugeridos: ['carrossel', 'video'],
        temasPrincipais: [
          'Guia de presentes masculinos',
          'Histórias e homenagens a pais',
          'Promoções exclusivas'
        ]
      },
      duranteCampanha: {
        quantidade: 5,
        tiposSugeridos: ['feed', 'stories'],
        temasPrincipais: [
          'Ofertas finais',
          'Entrega expressa',
          'Kits de presentes prontos'
        ]
      },
      posCampanha: {
        quantidade: 2,
        tiposSugeridos: ['stories'],
        temasPrincipais: [
          'Agradecimento',
          'Compartilhamento de momentos'
        ]
      }
    },
    sugestaoCampanha: 'Campanha focada em presentes práticos e emocionais para pais, com sugestões segmentadas por perfil',
    dicasConteudo: [
      'Focar em produtos e experiências masculinas',
      'Mostrar praticidade e utilidade dos produtos',
      'Incluir histórias reais de pais',
      'Destacar qualidade e durabilidade'
    ]
  },
  {
    id: 'dia-dos-namorados',
    nome: 'Dia dos Namorados',
    descricao: 'Celebração do amor e relacionamentos',
    icone: '❤️',
    dataFixa: '12/06',
    mesReferencia: 6,
    tipo: 'nacional',
    potencialEngajamento: 'alto',
    diasPreCampanha: 10,
    diasPosCampanha: 1,
    objetivosSugeridos: ['conversao', 'engajamento'],
    orcamentoSugerido: 3000,
    estruturaPosts: {
      preCampanha: {
        quantidade: 7,
        tiposSugeridos: ['carrossel', 'reels'],
        temasPrincipais: [
          'Ideias românticas e criativas',
          'Presentes para casais',
          'Experiências a dois'
        ]
      },
      duranteCampanha: {
        quantidade: 4,
        tiposSugeridos: ['feed', 'stories'],
        temasPrincipais: [
          'Última chance para surpreender',
          'Kits românticos',
          'Mensagens personalizadas'
        ]
      },
      posCampanha: {
        quantidade: 1,
        tiposSugeridos: ['stories'],
        temasPrincipais: [
          'Compartilhamento de momentos especiais'
        ]
      }
    },
    sugestaoCampanha: 'Campanha romântica com foco em experiências e presentes significativos para casais',
    dicasConteudo: [
      'Usar cores românticas (rosa, vermelho, branco)',
      'Focar em experiências compartilhadas',
      'Sugerir presentes em dupla ou kits',
      'Criar senso de exclusividade e cuidado'
    ]
  },
  {
    id: 'ano-novo',
    nome: 'Ano Novo',
    descricao: 'Celebração de fim de ano e novos começos',
    icone: '🎆',
    dataFixa: '01/01',
    mesReferencia: 1,
    tipo: 'nacional',
    potencialEngajamento: 'alto',
    diasPreCampanha: 7,
    diasPosCampanha: 7,
    objetivosSugeridos: ['engajamento', 'awareness'],
    orcamentoSugerido: 2500,
    estruturaPosts: {
      preCampanha: {
        quantidade: 5,
        tiposSugeridos: ['stories', 'feed'],
        temasPrincipais: [
          'Retrospectiva do ano',
          'Preparação para Réveillon',
          'Promoções de fim de ano'
        ]
      },
      duranteCampanha: {
        quantidade: 3,
        tiposSugeridos: ['feed', 'reels'],
        temasPrincipais: [
          'Feliz Ano Novo',
          'Metas e resoluções',
          'Novidades para o novo ano'
        ]
      },
      posCampanha: {
        quantidade: 5,
        tiposSugeridos: ['stories', 'feed'],
        temasPrincipais: [
          'Motivação para novos começos',
          'Lançamentos do ano',
          'Promoções de Janeiro'
        ]
      }
    },
    sugestaoCampanha: 'Campanha de celebração e renovação, conectando retrospectiva com expectativas futuras',
    dicasConteudo: [
      'Usar cores festivas (dourado, prata, branco)',
      'Incluir mensagens motivacionais',
      'Conectar marca com metas e objetivos',
      'Destacar novidades e lançamentos'
    ]
  },
  {
    id: 'carnaval',
    nome: 'Carnaval',
    descricao: 'Maior festa popular do Brasil',
    icone: '🎭',
    dataFixa: null, // Móvel (47 dias antes da Páscoa)
    mesReferencia: 2,
    tipo: 'nacional',
    potencialEngajamento: 'alto',
    diasPreCampanha: 10,
    diasPosCampanha: 3,
    objetivosSugeridos: ['engajamento', 'awareness'],
    orcamentoSugerido: 3000,
    estruturaPosts: {
      preCampanha: {
        quantidade: 8,
        tiposSugeridos: ['reels', 'stories'],
        temasPrincipais: [
          'Preparação para o Carnaval',
          'Fantasias e acessórios',
          'Promoções temáticas'
        ]
      },
      duranteCampanha: {
        quantidade: 6,
        tiposSugeridos: ['stories', 'reels'],
        temasPrincipais: [
          'Festa e celebração',
          'Behind the scenes',
          'Interação com público'
        ]
      },
      posCampanha: {
        quantidade: 2,
        tiposSugeridos: ['feed'],
        temasPrincipais: [
          'Agradecimento',
          'Melhores momentos'
        ]
      }
    },
    sugestaoCampanha: 'Campanha festiva com conteúdo leve, descontraído e altamente visual',
    dicasConteudo: [
      'Usar cores vibrantes e alegres',
      'Incluir música e dança',
      'Criar conteúdo interativo',
      'Mostrar diversão e celebração'
    ]
  },
  {
    id: 'pascoa',
    nome: 'Páscoa',
    descricao: 'Celebração da Páscoa com foco em família e presentes',
    icone: '🐰',
    dataFixa: null, // Móvel (primeiro domingo após primeira lua cheia depois de 21/03)
    mesReferencia: 4,
    tipo: 'nacional',
    potencialEngajamento: 'alto',
    diasPreCampanha: 14,
    diasPosCampanha: 2,
    objetivosSugeridos: ['conversao', 'engajamento'],
    orcamentoSugerido: 3500,
    estruturaPosts: {
      preCampanha: {
        quantidade: 9,
        tiposSugeridos: ['carrossel', 'video'],
        temasPrincipais: [
          'Guia de presentes de Páscoa',
          'Receitas e tradições',
          'Promoções de chocolate'
        ]
      },
      duranteCampanha: {
        quantidade: 4,
        tiposSugeridos: ['feed', 'stories'],
        temasPrincipais: [
          'Última chance',
          'Kits de Páscoa',
          'Celebração em família'
        ]
      },
      posCampanha: {
        quantidade: 2,
        tiposSugeridos: ['stories'],
        temasPrincipais: [
          'Agradecimento',
          'Compartilhamento de momentos'
        ]
      }
    },
    sugestaoCampanha: 'Campanha familiar com foco em tradição, presentes e celebração',
    dicasConteudo: [
      'Usar cores pastel (rosa, azul, amarelo)',
      'Destacar chocolates e presentes',
      'Incluir elementos de família',
      'Mostrar tradições e celebração'
    ]
  }
];

// Funções auxiliares
export function getTemplateById(id: string): TemplateCampanha | undefined {
  return TEMPLATES_CAMPANHAS.find(t => t.id === id);
}

export function getTemplatesPorMes(mes: number): TemplateCampanha[] {
  return TEMPLATES_CAMPANHAS.filter(t => t.mesReferencia === mes);
}

export function calcularTotalPosts(template: TemplateCampanha): number {
  const { preCampanha, duranteCampanha, posCampanha } = template.estruturaPosts;
  return preCampanha.quantidade + duranteCampanha.quantidade + posCampanha.quantidade;
}

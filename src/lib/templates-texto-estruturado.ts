// Templates de Texto Estruturado para Plano Editorial

export interface TemplateTextoEstruturado {
  id: string;
  nome: string;
  framework: 'aida' | 'cta' | 'storytelling' | 'ppp' | 'hero';
  tipo_conteudo: 'informar' | 'inspirar' | 'entreter' | 'vender' | 'posicionar';
  tipo_criativo?: string[];
  template: string;
  variaveis: string[];
  exemplo: string;
  descricao: string;
}

export const TEMPLATES_TEXTO: TemplateTextoEstruturado[] = [
  // AIDA - Informar (Card Educativo)
  {
    id: 'aida_informar_card',
    nome: 'AIDA Educativo',
    framework: 'aida',
    tipo_conteudo: 'informar',
    tipo_criativo: ['card', 'post'],
    template: `🎯 ATENÇÃO: {titulo_impactante}

💡 INTERESSE: 
Você sabia que {dado_curioso}? Isso impacta diretamente em {area_relevante}.

📊 DESEJO:
Imagine como seria {beneficio_especifico}. Com esse conhecimento, você pode:
✓ {beneficio_1}
✓ {beneficio_2}
✓ {beneficio_3}

🔥 AÇÃO:
{cta_educativo}`,
    variaveis: ['titulo_impactante', 'dado_curioso', 'area_relevante', 'beneficio_especifico', 'beneficio_1', 'beneficio_2', 'beneficio_3', 'cta_educativo'],
    exemplo: "🎯 ATENÇÃO: 90% das pessoas cometem este erro no Instagram!\n\n💡 INTERESSE: Você sabia que postar no horário errado reduz seu alcance em até 70%?...",
    descricao: "Template AIDA otimizado para conteúdo educativo em cards estáticos"
  },

  // CTA Direto - Vender (Reels Conversão)
  {
    id: 'cta_vender_reels',
    nome: 'CTA Direto (Venda)',
    framework: 'cta',
    tipo_conteudo: 'vender',
    tipo_criativo: ['reels', 'video'],
    template: `🔥 {hook_impactante}

CENA 1 (0-3s): Problema Visual
{descricao_dor_cliente}

CENA 2 (3-8s): Solução Rápida
Apresentar {produto_servico} de forma visual e impactante

CENA 3 (8-12s): Prova/Resultado
Mostrar {resultado_tangivel} ou depoimento

CENA 4 (12-15s): CTA FORTE
"{cta_urgente}"

LEGENDA:
{emoji} {resumo_1linha}
{cta_legenda}`,
    variaveis: ['hook_impactante', 'descricao_dor_cliente', 'produto_servico', 'resultado_tangivel', 'cta_urgente', 'emoji', 'resumo_1linha', 'cta_legenda'],
    exemplo: "🔥 PARE DE PERDER CLIENTES!\n\nCENA 1: Cliente frustrado olhando para tela...",
    descricao: "Template otimizado para Reels de conversão direta com foco em vendas"
  },

  // Storytelling - Inspirar (Carrossel)
  {
    id: 'storytelling_inspirar_carrossel',
    nome: 'Storytelling Inspiracional',
    framework: 'storytelling',
    tipo_conteudo: 'inspirar',
    tipo_criativo: ['carrossel', 'post'],
    template: `SLIDE 1: Contexto Inicial
{situacao_inicio}

SLIDE 2-3: Conflito/Dor
{desafio_enfrentado}
{emocao_vivenciada}

SLIDE 4-5: Jornada de Transformação
{passos_dados}
{aprendizados}

SLIDE 6-7: Resultado/Superação
{conquista_alcancada}
{sentimento_atual}

SLIDE 8: Inspiração e CTA
💬 "{mensagem_inspiracional}"
{cta_conexao}`,
    variaveis: ['situacao_inicio', 'desafio_enfrentado', 'emocao_vivenciada', 'passos_dados', 'aprendizados', 'conquista_alcancada', 'sentimento_atual', 'mensagem_inspiracional', 'cta_conexao'],
    exemplo: "SLIDE 1: Em 2020, eu estava falido e sem perspectivas...",
    descricao: "Template de narrativa emocional para carrosséis inspiracionais"
  },

  // PPP (Problema-Promessa-Prova) - Posicionar
  {
    id: 'ppp_posicionar',
    nome: 'PPP (Autoridade)',
    framework: 'ppp',
    tipo_conteudo: 'posicionar',
    tipo_criativo: ['post', 'card'],
    template: `🚨 PROBLEMA:
{problema_mercado}

💎 PROMESSA:
É possível {resultado_desejado} quando você {abordagem_diferenciada}.

Nossa metodologia {nome_metodologia} já ajudou {numero_clientes}+ pessoas a {conquista_especifica}.

🏆 PROVA:
✓ {credencial_1}
✓ {resultado_mensuravel}
✓ {depoimento_resumido}

📌 {cta_autoridade}`,
    variaveis: ['problema_mercado', 'resultado_desejado', 'abordagem_diferenciada', 'nome_metodologia', 'numero_clientes', 'conquista_especifica', 'credencial_1', 'resultado_mensuravel', 'depoimento_resumido', 'cta_autoridade'],
    exemplo: "🚨 PROBLEMA: 80% das empresas perdem vendas por falta de presença digital...",
    descricao: "Template focado em estabelecer autoridade e credibilidade"
  },

  // Entretenimento - Meme/Trend
  {
    id: 'meme_entreter',
    nome: 'Meme/Trend',
    framework: 'storytelling',
    tipo_conteudo: 'entreter',
    tipo_criativo: ['reels', 'story'],
    template: `HOOK: {trend_audio}

SETUP (0-2s):
{situacao_relatavel}

PUNCH (2-5s):
{punchline_engracada}

BRANDING (5-7s):
Sutil menção de {marca} ou {produto}

LEGENDA:
{emoji_divertido} {frase_curta_engracada}
{hashtag_trend}

💡 Marque alguém que {situacao_relatavel}`,
    variaveis: ['trend_audio', 'situacao_relatavel', 'punchline_engracada', 'marca', 'produto', 'emoji_divertido', 'frase_curta_engracada', 'hashtag_trend'],
    exemplo: "HOOK: Audio do meme 'Oh no, oh no'\n\nSETUP: Quando você esquece de postar no Instagram...",
    descricao: "Template para conteúdo de entretenimento baseado em trends e memes"
  },

  // HERO - Informar
  {
    id: 'hero_informar',
    nome: 'HERO (Educação)',
    framework: 'hero',
    tipo_conteudo: 'informar',
    tipo_criativo: ['card', 'carrossel'],
    template: `H - HOOK (Gancho Irresistível):
{pergunta_impactante}

E - ENGAJAMENTO (Contextualizar):
{contexto_problema}

R - RESOLUÇÃO (Solução Prática):
{passo_a_passo}

O - OFERTA/AÇÃO (Próximo Passo):
{cta_especifico}`,
    variaveis: ['pergunta_impactante', 'contexto_problema', 'passo_a_passo', 'cta_especifico'],
    exemplo: "H - Você sabe qual o melhor horário para postar?\n\nE - 70% das pessoas postam quando a audiência está offline...",
    descricao: "Framework HERO para conteúdo educacional estruturado"
  }
];

// Função para buscar templates
export const getTemplatesPorTipo = (tipo_conteudo: string, tipo_criativo?: string) => {
  return TEMPLATES_TEXTO.filter(t => 
    t.tipo_conteudo === tipo_conteudo && 
    (!tipo_criativo || !t.tipo_criativo || t.tipo_criativo.includes(tipo_criativo.toLowerCase()))
  );
};

// Função para preencher template com dados
export const preencherTemplate = (template: TemplateTextoEstruturado, dados: Record<string, string>) => {
  let texto = template.template;
  
  template.variaveis.forEach(variavel => {
    const valor = dados[variavel] || `[${variavel}]`;
    texto = texto.replace(new RegExp(`{${variavel}}`, 'g'), valor);
  });
  
  return texto;
};

-- ========================================
-- PARTE 1: AGENTES DE IA E FRAMEWORKS
-- ========================================

-- 1. Criar tabela de Agentes de IA
CREATE TABLE IF NOT EXISTS roteiro_agentes_ia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  especialidade TEXT NOT NULL,
  descricao TEXT NOT NULL,
  icone TEXT DEFAULT '🎬',
  prompt_instrucoes TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Criar tabela de Frameworks de Conteúdo
CREATE TABLE IF NOT EXISTS roteiro_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  categoria TEXT,
  descricao TEXT NOT NULL,
  estrutura JSONB DEFAULT '{}',
  aplicacao TEXT,
  icone TEXT DEFAULT '🎯',
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Alterar tabela roteiros para adicionar novos campos
ALTER TABLE roteiros 
  ADD COLUMN IF NOT EXISTS agente_ia_id UUID REFERENCES roteiro_agentes_ia(id),
  ADD COLUMN IF NOT EXISTS framework_id UUID REFERENCES roteiro_frameworks(id),
  ADD COLUMN IF NOT EXISTS tom_criativo TEXT[];

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_roteiro_agentes_ia_ativo ON roteiro_agentes_ia(ativo, ordem);
CREATE INDEX IF NOT EXISTS idx_roteiro_frameworks_ativo ON roteiro_frameworks(ativo, ordem);
CREATE INDEX IF NOT EXISTS idx_roteiros_agente_ia ON roteiros(agente_ia_id);
CREATE INDEX IF NOT EXISTS idx_roteiros_framework ON roteiros(framework_id);

-- 5. RLS Policies para roteiro_agentes_ia
ALTER TABLE roteiro_agentes_ia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver agentes ativos"
  ON roteiro_agentes_ia FOR SELECT
  USING (ativo = true);

CREATE POLICY "Admin pode gerenciar agentes"
  ON roteiro_agentes_ia FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 6. RLS Policies para roteiro_frameworks
ALTER TABLE roteiro_frameworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver frameworks ativos"
  ON roteiro_frameworks FOR SELECT
  USING (ativo = true);

CREATE POLICY "Admin pode gerenciar frameworks"
  ON roteiro_frameworks FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- 7. Inserir Agentes de IA (8 agentes)
INSERT INTO roteiro_agentes_ia (nome, slug, especialidade, descricao, icone, prompt_instrucoes, tags, ordem) VALUES
(
  'Aaron Sorkin',
  'aaron-sorkin',
  'O Estruturalista',
  'Storytelling com diálogos rápidos e ritmo intenso. Ideal para vídeos institucionais e entrevistas.',
  '🎬',
  'Você é Aaron Sorkin, mestre em diálogos dinâmicos e ritmo acelerado. Escreva com estrutura em 3 atos clara, frases curtas e impactantes. Use diálogos rápidos e diretos. Cada cena deve ter propósito narrativo claro. Mantenha o ritmo intenso do início ao fim.',
  ARRAY['institucional', 'entrevistas', 'corporativo'],
  1
),
(
  'Quentin Tarantino',
  'quentin-tarantino',
  'O Cinematográfico',
  'Cortes não lineares, ritmo impactante e visual forte. Ideal para campanhas ousadas e criativas.',
  '✍️',
  'Você é Quentin Tarantino, conhecido por narrativas não lineares e visuais impactantes. Crie roteiros com cortes ousados, descrições visuais detalhadas e ritmo cinematográfico. Use referências culturais e momentos memoráveis. Não tenha medo de ser criativo e diferente.',
  ARRAY['campanhas', 'criativo', 'ousado'],
  2
),
(
  'Nora Ephron',
  'nora-ephron',
  'A Humanizadora',
  'Tons leves e emocionais. Ideal para campanhas afetivas e temas de saúde.',
  '💡',
  'Você é Nora Ephron, mestra em storytelling humano e emocional. Escreva com leveza, autenticidade e conexão emocional. Foque em momentos genuínos e personagens reais. Use humor sutil quando apropriado. Crie histórias que toquem o coração.',
  ARRAY['emocional', 'saúde', 'afetivo', 'leve'],
  3
),
(
  'David Mamet',
  'david-mamet',
  'O Direto e Persuasivo',
  'Texto seco e de impacto. Ideal para VTs publicitários curtos.',
  '🧠',
  'Você é David Mamet, mestre da economia de palavras. Escreva roteiros diretos, sem floreios. Cada palavra deve ter peso. Use frases curtas e impactantes. Corte tudo que não for essencial. O poder está na simplicidade e clareza da mensagem.',
  ARRAY['publicitário', 'vt', 'curto', 'direto'],
  4
),
(
  'Charlie Kaufman',
  'charlie-kaufman',
  'O Reflexivo',
  'Poético, introspectivo e criativo. Ideal para storytelling profundo.',
  '🎥',
  'Você é Charlie Kaufman, conhecido por narrativas reflexivas e criativas. Explore camadas de significado, use metáforas visuais e crie conexões inesperadas. Seja poético e introspectivo. Desafie convenções narrativas. Faça o público pensar.',
  ARRAY['storytelling', 'profundo', 'criativo', 'poético'],
  5
),
(
  'Gary Vaynerchuk',
  'gary-vaynerchuk',
  'O Digital Hustler',
  'Linguagem nativa da internet e alto engajamento. Ideal para Reels e TikToks.',
  '💬',
  'Você é Gary Vaynerchuk, expert em conteúdo digital nativo. Fale direto, use linguagem da internet, seja autêntico e energético. Comece com hook forte. Mantenha ritmo rápido. Foque em valor imediato. Use CTAs claros. Pense em viralidade.',
  ARRAY['reels', 'tiktok', 'digital', 'engajamento'],
  6
),
(
  'Ann Handley',
  'ann-handley',
  'A Educadora',
  'Didático e estruturado. Ideal para vídeos educativos e de marca.',
  '📈',
  'Você é Ann Handley, mestra em content marketing educacional. Estruture conteúdo de forma clara e didática. Use exemplos práticos, dados quando relevante. Mantenha tom acessível mas profissional. Eduque enquanto engaja. Crie valor real.',
  ARRAY['educativo', 'marca', 'didático', 'marketing'],
  7
),
(
  'Neil Patel',
  'neil-patel',
  'O Conversor',
  'Copywriting técnico e direto ao ponto. Ideal para lançamentos e vídeos de vendas.',
  '🔥',
  'Você é Neil Patel, expert em copywriting de conversão. Foque em resultados e ação. Use dados, prova social e urgência quando apropriado. Cada frame deve levar à conversão. CTA forte e claro. Remova objeções. Foque em benefícios tangíveis.',
  ARRAY['vendas', 'lançamento', 'conversão', 'copy'],
  8
)
ON CONFLICT (slug) DO NOTHING;

-- 8. Inserir Frameworks de Conteúdo (8 frameworks)
INSERT INTO roteiro_frameworks (nome, slug, categoria, descricao, estrutura, aplicacao, icone, ordem) VALUES
(
  'AIDA',
  'aida',
  'HESEC',
  'Atenção, Interesse, Desejo, Ação - Framework clássico de copywriting',
  '{"blocos": ["Atenção: Ganhe a atenção nos primeiros 3 segundos", "Interesse: Desperte curiosidade e relevância", "Desejo: Mostre benefícios e crie desejo", "Ação: CTA claro e direto"]}'::jsonb,
  'Roteiros publicitários e anúncios curtos (15-30s)',
  '🎯',
  1
),
(
  'Storytelling de 3 Atos',
  'storytelling-3-atos',
  'HERO',
  'Introdução, Conflito, Resolução - Estrutura narrativa clássica',
  '{"blocos": ["Ato 1: Apresentação do contexto e personagem", "Ato 2: Conflito, desafio ou problema", "Ato 3: Resolução e transformação"]}'::jsonb,
  'Campanhas emocionais e institucionais (60-120s)',
  '🪶',
  2
),
(
  'MicroStory',
  'microstory',
  NULL,
  'Hook – Valor – CTA: Framework enxuto para conteúdo curto',
  '{"blocos": ["Hook: Ganhe atenção em 1 segundo", "Valor: Entregue valor/insight rápido", "CTA: Chamada clara para ação"]}'::jsonb,
  'Reels e TikToks curtos (7-15s)',
  '💬',
  3
),
(
  'Jornada do Herói',
  'jornada-heroi',
  'HERO',
  'Estrutura de 8 etapas adaptada para audiovisual',
  '{"blocos": ["Mundo comum", "Chamado à aventura", "Recusa inicial", "Encontro com mentor", "Travessia do limiar", "Testes e provações", "Recompensa", "Retorno transformado"]}'::jsonb,
  'Narrativas inspiradoras e documentais (120-300s)',
  '🧭',
  4
),
(
  'Why-How-What',
  'why-how-what',
  'HESEC',
  'Framework de Simon Sinek: Propósito – Processo – Produto',
  '{"blocos": ["Why: Por que fazemos o que fazemos", "How: Como fazemos diferente", "What: O que oferecemos"]}'::jsonb,
  'Conteúdo corporativo e educacional (30-90s)',
  '🧩',
  5
),
(
  'Episódico',
  'episodico',
  NULL,
  'Estrutura de capítulos curtos para conteúdo seriado',
  '{"blocos": ["Gancho do episódio", "Desenvolvimento do tema", "Cliffhanger ou preview do próximo"]}'::jsonb,
  'Campanhas contínuas e storytelling de marca',
  '💡',
  6
),
(
  'Educa & Inspira',
  'educa-inspira',
  'HESEC',
  'Um ensinamento prático + reflexão inspiradora',
  '{"blocos": ["Problema/Dor identificável", "Ensinamento prático", "Reflexão e inspiração", "Aplicação imediata"]}'::jsonb,
  'Clínicas, educação e causas sociais (45-90s)',
  '📖',
  7
),
(
  'Trend Adaptation',
  'trend-adaptation',
  NULL,
  'Adaptação de trends virais com identidade de marca',
  '{"blocos": ["Hook trend (áudio/visual)", "Adaptação à marca", "Twist criativo", "CTA ou punchline"]}'::jsonb,
  'Conteúdo digital leve e rápido (7-30s)',
  '⚡',
  8
)
ON CONFLICT (slug) DO NOTHING;

-- 9. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_roteiro_agentes_ia_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_roteiro_agentes_ia_updated_at
  BEFORE UPDATE ON roteiro_agentes_ia
  FOR EACH ROW
  EXECUTE FUNCTION update_roteiro_agentes_ia_updated_at();

CREATE OR REPLACE FUNCTION update_roteiro_frameworks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_roteiro_frameworks_updated_at
  BEFORE UPDATE ON roteiro_frameworks
  FOR EACH ROW
  EXECUTE FUNCTION update_roteiro_frameworks_updated_at();
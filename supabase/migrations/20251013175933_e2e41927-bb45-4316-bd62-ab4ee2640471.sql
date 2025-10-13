-- =====================================================
-- TABELA 1: concorrentes_analise
-- =====================================================
CREATE TABLE IF NOT EXISTS concorrentes_analise (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  
  -- Dados do concorrente
  nome TEXT NOT NULL,
  site TEXT,
  instagram TEXT,
  facebook TEXT,
  tiktok TEXT,
  youtube TEXT,
  linkedin TEXT,
  observacoes TEXT,
  
  -- Análise IA (JSON estruturado)
  analise_ia JSONB DEFAULT '{}'::jsonb,
  
  -- Metadados
  analisado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_concorrentes_cliente_id ON concorrentes_analise(cliente_id);
CREATE INDEX idx_concorrentes_analise_ia ON concorrentes_analise USING GIN (analise_ia);
CREATE INDEX idx_concorrentes_created_at ON concorrentes_analise(created_at DESC);

-- RLS Policies
ALTER TABLE concorrentes_analise ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem visualizar concorrentes"
  ON concorrentes_analise FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem inserir concorrentes"
  ON concorrentes_analise FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem atualizar concorrentes"
  ON concorrentes_analise FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários autenticados podem deletar concorrentes"
  ON concorrentes_analise FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Comentários
COMMENT ON TABLE concorrentes_analise IS 'Armazena concorrentes e análises IA para benchmarking';
COMMENT ON COLUMN concorrentes_analise.analise_ia IS 'JSON com: seguidores, engajamento, frequência, top_posts, percepção visual';

-- =====================================================
-- TABELA 2: analise_competitiva
-- =====================================================
CREATE TABLE IF NOT EXISTS analise_competitiva (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  
  -- Análises
  cliente_analise JSONB DEFAULT '{}'::jsonb,
  resumo_ia TEXT,
  relatorio_markdown TEXT,
  
  -- Versionamento
  versao INTEGER DEFAULT 1,
  
  -- Metadados
  gerado_em TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_analise_cliente_id ON analise_competitiva(cliente_id);
CREATE INDEX idx_analise_versao ON analise_competitiva(cliente_id, versao DESC);
CREATE INDEX idx_analise_gerado_em ON analise_competitiva(gerado_em DESC);

-- RLS Policies
ALTER TABLE analise_competitiva ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem visualizar análises"
  ON analise_competitiva FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem inserir análises"
  ON analise_competitiva FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem atualizar análises"
  ON analise_competitiva FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Comentários
COMMENT ON TABLE analise_competitiva IS 'Relatórios comparativos de benchmark digital com versionamento';
COMMENT ON COLUMN analise_competitiva.cliente_analise IS 'JSON com análise do cliente (mesmo formato dos concorrentes)';
COMMENT ON COLUMN analise_competitiva.relatorio_markdown IS 'Relatório completo gerado pela IA em Markdown';
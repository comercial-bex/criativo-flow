-- ======================================
-- FASE 1: TABELAS DE PRODUTIVIDADE
-- ======================================

-- Tabela: Ciclos Pomodoro
CREATE TABLE IF NOT EXISTS produtividade_pomodoro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  setor TEXT NOT NULL CHECK (setor IN ('grs', 'design', 'audiovisual')),
  inicio TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  fim TIMESTAMPTZ,
  duracao_minutos INT,
  tipo TEXT DEFAULT 'foco' CHECK (tipo IN ('foco', 'pausa_curta', 'pausa_longa')),
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'cancelado')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: Reflexões Diárias
CREATE TABLE IF NOT EXISTS produtividade_reflexao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  setor TEXT NOT NULL CHECK (setor IN ('grs', 'design', 'audiovisual')),
  data TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  humor TEXT CHECK (humor IN ('excelente', 'bom', 'neutro', 'ruim', 'pessimo')),
  texto TEXT NOT NULL,
  resumo_ia TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: Metas SMART
CREATE TABLE IF NOT EXISTS produtividade_metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  setor TEXT NOT NULL CHECK (setor IN ('grs', 'design', 'audiovisual')),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  progresso NUMERIC(5,2) DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  categoria TEXT,
  data_limite DATE,
  qualidade_smart NUMERIC(5,2),
  avaliacao_ia JSONB,
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'concluida', 'cancelada')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: Checklist GTD
CREATE TABLE IF NOT EXISTS produtividade_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  setor TEXT NOT NULL CHECK (setor IN ('grs', 'design', 'audiovisual')),
  titulo TEXT NOT NULL,
  descricao TEXT,
  concluido BOOLEAN DEFAULT FALSE,
  prioridade INT DEFAULT 0,
  categoria TEXT,
  ordem INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela: Insights de Foco
CREATE TABLE IF NOT EXISTS produtividade_insights_foco (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  setor TEXT NOT NULL CHECK (setor IN ('grs', 'design', 'audiovisual')),
  data_analise DATE DEFAULT CURRENT_DATE,
  horarios_ideais JSONB,
  energia_media NUMERIC(5,2),
  recomendacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ======================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ======================================

-- Pomodoro
ALTER TABLE produtividade_pomodoro ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem seus próprios pomodoros"
  ON produtividade_pomodoro FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários criam seus pomodoros"
  ON produtividade_pomodoro FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários atualizam seus pomodoros"
  ON produtividade_pomodoro FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários deletam seus pomodoros"
  ON produtividade_pomodoro FOR DELETE
  USING (auth.uid() = user_id);

-- Reflexão
ALTER TABLE produtividade_reflexao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem suas reflexões"
  ON produtividade_reflexao FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários criam reflexões"
  ON produtividade_reflexao FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários atualizam reflexões"
  ON produtividade_reflexao FOR UPDATE
  USING (auth.uid() = user_id);

-- Metas
ALTER TABLE produtividade_metas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem suas metas"
  ON produtividade_metas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários gerenciam suas metas"
  ON produtividade_metas FOR ALL
  USING (auth.uid() = user_id);

-- Checklist
ALTER TABLE produtividade_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem seu checklist"
  ON produtividade_checklist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários gerenciam seu checklist"
  ON produtividade_checklist FOR ALL
  USING (auth.uid() = user_id);

-- Insights
ALTER TABLE produtividade_insights_foco ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem seus insights"
  ON produtividade_insights_foco FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema cria insights"
  ON produtividade_insights_foco FOR INSERT
  WITH CHECK (true);

-- ======================================
-- ÍNDICES PARA PERFORMANCE
-- ======================================

CREATE INDEX idx_pomodoro_user_setor ON produtividade_pomodoro(user_id, setor);
CREATE INDEX idx_pomodoro_status ON produtividade_pomodoro(status, inicio DESC);
CREATE INDEX idx_reflexao_user_data ON produtividade_reflexao(user_id, data DESC);
CREATE INDEX idx_metas_user_status ON produtividade_metas(user_id, status);
CREATE INDEX idx_checklist_user_concluido ON produtividade_checklist(user_id, concluido);
CREATE INDEX idx_insights_user_data ON produtividade_insights_foco(user_id, data_analise DESC);

-- ======================================
-- TRIGGERS PARA UPDATED_AT
-- ======================================

CREATE TRIGGER update_metas_updated_at 
  BEFORE UPDATE ON produtividade_metas
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_updated_at 
  BEFORE UPDATE ON produtividade_checklist
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
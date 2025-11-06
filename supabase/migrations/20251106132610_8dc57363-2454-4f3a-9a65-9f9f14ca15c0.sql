-- ================================
-- TABELAS DE HISTÓRICO
-- ================================

-- 1. Tabela de Histórico de Metas
CREATE TABLE IF NOT EXISTS public.cliente_metas_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_id UUID NOT NULL REFERENCES cliente_metas(id) ON DELETE CASCADE,
  valor_registrado NUMERIC NOT NULL,
  progresso_percent NUMERIC NOT NULL,
  data_registro TIMESTAMPTZ NOT NULL DEFAULT now(),
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_metas_historico_meta ON cliente_metas_historico(meta_id);
CREATE INDEX IF NOT EXISTS idx_metas_historico_data ON cliente_metas_historico(data_registro DESC);

-- RLS Policies
ALTER TABLE cliente_metas_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver todo histórico de metas"
  ON cliente_metas_historico FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'gestor')
    )
  );

CREATE POLICY "Sistema pode inserir histórico"
  ON cliente_metas_historico FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 2. Tabela de Histórico de Concorrentes
CREATE TABLE IF NOT EXISTS public.concorrentes_metricas_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concorrente_id UUID NOT NULL REFERENCES concorrentes_analise(id) ON DELETE CASCADE,
  
  -- Métricas por plataforma
  seguidores_instagram INT,
  seguidores_facebook INT,
  seguidores_tiktok INT,
  seguidores_youtube INT,
  seguidores_linkedin INT,
  
  -- Métricas de engajamento
  engajamento_percent NUMERIC(5,2),
  frequencia_posts_semana INT,
  media_likes INT,
  media_comments INT,
  
  -- Metadados
  data_coleta TIMESTAMPTZ NOT NULL DEFAULT now(),
  snapshot_completo JSONB,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_concorrente_hist_id ON concorrentes_metricas_historico(concorrente_id);
CREATE INDEX IF NOT EXISTS idx_concorrente_hist_data ON concorrentes_metricas_historico(data_coleta DESC);

-- RLS Policies
ALTER TABLE concorrentes_metricas_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver histórico de concorrentes"
  ON concorrentes_metricas_historico FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'gestor')
    )
  );

CREATE POLICY "Edge functions podem inserir histórico"
  ON concorrentes_metricas_historico FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ================================
-- TRIGGERS
-- ================================

-- Trigger para registrar mudanças em metas automaticamente
CREATE OR REPLACE FUNCTION registrar_mudanca_meta()
RETURNS TRIGGER AS $$
BEGIN
  -- Só registra se houve mudança significativa (>1%)
  IF (OLD.valor_atual IS DISTINCT FROM NEW.valor_atual) 
     OR (ABS(OLD.progresso_percent - NEW.progresso_percent) > 1) THEN
    INSERT INTO cliente_metas_historico (meta_id, valor_registrado, progresso_percent)
    VALUES (NEW.id, NEW.valor_atual, NEW.progresso_percent);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_registrar_mudanca_meta
AFTER UPDATE ON cliente_metas
FOR EACH ROW
EXECUTE FUNCTION registrar_mudanca_meta();
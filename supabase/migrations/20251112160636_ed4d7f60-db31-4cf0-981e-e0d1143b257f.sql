-- Habilitar RLS nas novas tabelas de analytics
ALTER TABLE post_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE publicacao_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_ab_variations ENABLE ROW LEVEL SECURITY;

-- Políticas para post_performance_metrics
CREATE POLICY "Admins podem ver todas as métricas"
  ON post_performance_metrics FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins podem inserir métricas"
  ON post_performance_metrics FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- Políticas para publicacao_queue
CREATE POLICY "Usuários veem suas próprias publicações"
  ON publicacao_queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts_planejamento pp
      WHERE pp.id = publicacao_queue.post_id
        AND (pp.responsavel_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "GRS e Admins gerenciam fila de publicação"
  ON publicacao_queue FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'grs'
    )
  );

CREATE POLICY "Sistema atualiza status de publicação"
  ON publicacao_queue FOR UPDATE
  USING (is_admin(auth.uid()));

-- Políticas para post_ab_variations
CREATE POLICY "Usuários veem variações de seus posts"
  ON post_ab_variations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts_planejamento pp
      WHERE pp.id = post_ab_variations.post_id
        AND (pp.responsavel_id = auth.uid() OR is_admin(auth.uid()))
    )
  );

CREATE POLICY "Admins e GRS criam variações A/B"
  ON post_ab_variations FOR INSERT
  WITH CHECK (
    is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'grs'
    )
  );

CREATE POLICY "Admins e donos atualizam variações"
  ON post_ab_variations FOR UPDATE
  USING (
    is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM posts_planejamento pp
      WHERE pp.id = post_ab_variations.post_id
        AND pp.responsavel_id = auth.uid()
    )
  );

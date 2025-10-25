-- ============================================================================
-- FASE 3B: RLS Policies para Subtarefas, Comentários e Notificações
-- ============================================================================

-- RLS para SUBTAREFAS
ALTER TABLE subtarefas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subtarefas visíveis se tarefa pai visível"
ON subtarefas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tarefa t
    WHERE t.id = subtarefas.tarefa_pai_id
    AND (
      t.executor_id = auth.uid() OR
      t.responsavel_id = auth.uid() OR
      t.cliente_id IN (SELECT cliente_id FROM pessoas WHERE profile_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'grs', 'gestor'))
    )
  )
);

CREATE POLICY "Subtarefas podem ser criadas por GRS/Gestor/Admin ou executor da tarefa pai"
ON subtarefas FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tarefa t
    WHERE t.id = subtarefas.tarefa_pai_id
    AND (
      t.executor_id = auth.uid() OR
      EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'grs', 'gestor'))
    )
  )
);

CREATE POLICY "Subtarefas podem ser atualizadas pelo responsável ou executor da tarefa pai"
ON subtarefas FOR UPDATE
USING (
  responsavel_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM tarefa t
    WHERE t.id = subtarefas.tarefa_pai_id
    AND (t.executor_id = auth.uid() OR t.responsavel_id = auth.uid())
  ) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'grs', 'gestor'))
);

CREATE POLICY "Subtarefas podem ser deletadas por GRS/Gestor/Admin"
ON subtarefas FOR DELETE
USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'grs', 'gestor'))
);

-- RLS para COMENTÁRIOS
ALTER TABLE tarefa_comentarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comentários visíveis se tarefa visível"
ON tarefa_comentarios FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tarefa t
    WHERE t.id = tarefa_comentarios.tarefa_id
    AND (
      t.executor_id = auth.uid() OR
      t.responsavel_id = auth.uid() OR
      t.cliente_id IN (SELECT cliente_id FROM pessoas WHERE profile_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'grs', 'gestor'))
    )
  )
);

CREATE POLICY "Comentários podem ser criados por quem vê a tarefa"
ON tarefa_comentarios FOR INSERT
WITH CHECK (
  autor_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM tarefa t
    WHERE t.id = tarefa_comentarios.tarefa_id
    AND (
      t.executor_id = auth.uid() OR
      t.responsavel_id = auth.uid() OR
      t.cliente_id IN (SELECT cliente_id FROM pessoas WHERE profile_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'grs', 'gestor'))
    )
  )
);

CREATE POLICY "Comentários podem ser editados pelo autor"
ON tarefa_comentarios FOR UPDATE
USING (autor_id = auth.uid());

CREATE POLICY "Comentários podem ser deletados pelo autor ou admin"
ON tarefa_comentarios FOR DELETE
USING (
  autor_id = auth.uid() OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'grs', 'gestor'))
);

-- RLS para NOTIFICAÇÕES (sem alterar tabela existente se já houver RLS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notificacoes' AND policyname = 'Usuários veem suas próprias notificações'
  ) THEN
    ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Usuários veem suas próprias notificações"
    ON notificacoes FOR SELECT
    USING (user_id = auth.uid());
    
    CREATE POLICY "Sistema cria notificações"
    ON notificacoes FOR INSERT
    WITH CHECK (true);
    
    CREATE POLICY "Usuários atualizam suas próprias notificações"
    ON notificacoes FOR UPDATE
    USING (user_id = auth.uid());
  END IF;
END $$;
-- ============================================
-- FASE 2: Sistema de Atividades e Comentários
-- ============================================

-- Criar tabela de atividades da tarefa
CREATE TABLE IF NOT EXISTS tarefa_atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id UUID NOT NULL REFERENCES tarefa(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_atividade TEXT NOT NULL CHECK (tipo_atividade IN ('comentario', 'mudanca_status', 'anexo_adicionado', 'checklist_item', 'atribuicao', 'prazo_alterado')),
  conteudo TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tarefa_atividades_tarefa ON tarefa_atividades(tarefa_id);
CREATE INDEX IF NOT EXISTS idx_tarefa_atividades_created ON tarefa_atividades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tarefa_atividades_user ON tarefa_atividades(user_id);

-- Comentários
COMMENT ON TABLE tarefa_atividades IS 'Timeline de atividades e comentários das tarefas';
COMMENT ON COLUMN tarefa_atividades.tipo_atividade IS 'Tipo: comentario, mudanca_status, anexo_adicionado, checklist_item, atribuicao, prazo_alterado';
COMMENT ON COLUMN tarefa_atividades.metadata IS 'Dados adicionais (ex: status anterior/novo, nome do arquivo, etc)';

-- Habilitar RLS
ALTER TABLE tarefa_atividades ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver atividades de tarefas que têm acesso
CREATE POLICY "Usuários veem atividades de suas tarefas"
ON tarefa_atividades FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tarefa t
    WHERE t.id = tarefa_atividades.tarefa_id
    AND (
      t.responsavel_id = auth.uid()
      OR t.executor_id = auth.uid()
      OR is_admin(auth.uid())
      OR (get_user_role(auth.uid()) = ANY (ARRAY['gestor'::user_role, 'grs'::user_role]))
      OR t.cliente_id IN (
        SELECT cliente_id FROM profiles WHERE id = auth.uid()
      )
    )
  )
);

-- Política: usuários podem criar atividades em tarefas que têm acesso
CREATE POLICY "Usuários podem criar atividades"
ON tarefa_atividades FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM tarefa t
    WHERE t.id = tarefa_atividades.tarefa_id
    AND (
      t.responsavel_id = auth.uid()
      OR t.executor_id = auth.uid()
      OR is_admin(auth.uid())
      OR (get_user_role(auth.uid()) = ANY (ARRAY['gestor'::user_role, 'grs'::user_role]))
      OR t.cliente_id IN (
        SELECT cliente_id FROM profiles WHERE id = auth.uid()
      )
    )
  )
);

-- Política: usuários podem atualizar suas próprias atividades
CREATE POLICY "Usuários podem atualizar suas atividades"
ON tarefa_atividades FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Política: usuários podem deletar suas próprias atividades (comentários)
CREATE POLICY "Usuários podem deletar suas atividades"
ON tarefa_atividades FOR DELETE
USING (user_id = auth.uid() AND tipo_atividade = 'comentario');

-- ============================================
-- FASE 3: Sistema de Seguidores
-- ============================================

-- Criar tabela de seguidores de tarefas
CREATE TABLE IF NOT EXISTS tarefa_seguidores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id UUID NOT NULL REFERENCES tarefa(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(tarefa_id, user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tarefa_seguidores_tarefa ON tarefa_seguidores(tarefa_id);
CREATE INDEX IF NOT EXISTS idx_tarefa_seguidores_user ON tarefa_seguidores(user_id);

-- Comentários
COMMENT ON TABLE tarefa_seguidores IS 'Usuários que seguem uma tarefa para receber notificações';

-- Habilitar RLS
ALTER TABLE tarefa_seguidores ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver seguidores de tarefas que têm acesso
CREATE POLICY "Usuários veem seguidores de suas tarefas"
ON tarefa_seguidores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tarefa t
    WHERE t.id = tarefa_seguidores.tarefa_id
    AND (
      t.responsavel_id = auth.uid()
      OR t.executor_id = auth.uid()
      OR is_admin(auth.uid())
      OR (get_user_role(auth.uid()) = ANY (ARRAY['gestor'::user_role, 'grs'::user_role]))
      OR t.cliente_id IN (
        SELECT cliente_id FROM profiles WHERE id = auth.uid()
      )
    )
  )
);

-- Política: usuários podem gerenciar seus próprios seguimentos
CREATE POLICY "Usuários gerenciam seus seguimentos"
ON tarefa_seguidores FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- Trigger: Notificar seguidores sobre atividades
-- ============================================
CREATE OR REPLACE FUNCTION notificar_seguidores_atividade()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir notificação para cada seguidor (exceto o autor da atividade)
  INSERT INTO notificacoes (user_id, titulo, mensagem, tipo, data_evento, metadata)
  SELECT 
    ts.user_id,
    'Nova atividade em tarefa que você segue',
    CASE 
      WHEN NEW.tipo_atividade = 'comentario' THEN 'Novo comentário adicionado'
      WHEN NEW.tipo_atividade = 'mudanca_status' THEN 'Status da tarefa foi alterado'
      WHEN NEW.tipo_atividade = 'anexo_adicionado' THEN 'Novo anexo adicionado'
      WHEN NEW.tipo_atividade = 'checklist_item' THEN 'Item do checklist atualizado'
      ELSE 'Nova atividade registrada'
    END,
    'info',
    NOW(),
    jsonb_build_object(
      'tarefa_id', NEW.tarefa_id,
      'atividade_id', NEW.id,
      'tipo_atividade', NEW.tipo_atividade
    )
  FROM tarefa_seguidores ts
  WHERE ts.tarefa_id = NEW.tarefa_id
  AND ts.user_id != NEW.user_id; -- Não notificar o autor
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger
DROP TRIGGER IF EXISTS trg_notificar_seguidores ON tarefa_atividades;
CREATE TRIGGER trg_notificar_seguidores
AFTER INSERT ON tarefa_atividades
FOR EACH ROW
EXECUTE FUNCTION notificar_seguidores_atividade();

-- ============================================
-- Trigger: Registrar mudanças de status automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION registrar_mudanca_status_tarefa()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar atividade se o status mudou
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO tarefa_atividades (
      tarefa_id,
      user_id,
      tipo_atividade,
      conteudo,
      metadata
    ) VALUES (
      NEW.id,
      COALESCE(NEW.updated_by, auth.uid()),
      'mudanca_status',
      'Status alterado',
      jsonb_build_object(
        'status_anterior', OLD.status,
        'status_novo', NEW.status
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger para mudanças de status
DROP TRIGGER IF EXISTS trg_registrar_mudanca_status ON tarefa;
CREATE TRIGGER trg_registrar_mudanca_status
AFTER UPDATE ON tarefa
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION registrar_mudanca_status_tarefa();
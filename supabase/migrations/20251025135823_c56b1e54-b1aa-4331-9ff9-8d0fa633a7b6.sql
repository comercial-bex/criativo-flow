-- ============================================================================
-- FASE 3: Sistema de Subtarefas, Comentários e Notificações
-- ============================================================================

-- SUBTAREFAS
CREATE TABLE IF NOT EXISTS subtarefas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_pai_id uuid NOT NULL REFERENCES tarefa(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text,
  status text NOT NULL DEFAULT 'backlog' 
    CHECK (status IN ('backlog', 'to_do', 'em_andamento', 'em_revisao', 'concluida', 'cancelado')),
  ordem integer NOT NULL DEFAULT 0,
  responsavel_id uuid REFERENCES pessoas(id),
  data_conclusao timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_subtarefas_tarefa ON subtarefas(tarefa_pai_id);
CREATE INDEX idx_subtarefas_status ON subtarefas(status);

COMMENT ON TABLE subtarefas IS 'Subtarefas de decomposição de tarefas principais';
COMMENT ON COLUMN subtarefas.ordem IS 'Ordem de exibição das subtarefas';

-- COMENTÁRIOS
CREATE TABLE IF NOT EXISTS tarefa_comentarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id uuid NOT NULL REFERENCES tarefa(id) ON DELETE CASCADE,
  autor_id uuid NOT NULL REFERENCES pessoas(id),
  conteudo text NOT NULL,
  tipo text DEFAULT 'comentario' CHECK (tipo IN ('comentario', 'atualizacao', 'mudanca_status')),
  metadados jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_comentarios_tarefa ON tarefa_comentarios(tarefa_id);
CREATE INDEX idx_comentarios_data ON tarefa_comentarios(created_at DESC);

COMMENT ON TABLE tarefa_comentarios IS 'Timeline de comentários e atualizações das tarefas';
COMMENT ON COLUMN tarefa_comentarios.tipo IS 'comentario = normal | atualizacao = sistema | mudanca_status = histórico';

-- NOTIFICAÇÕES (verificar se já existe)
CREATE TABLE IF NOT EXISTS notificacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES pessoas(id),
  tipo text NOT NULL CHECK (tipo IN ('tarefa_atribuida', 'prazo_proximo', 'comentario', 'status_mudou', 'info', 'success', 'warning', 'error')),
  titulo text NOT NULL,
  mensagem text,
  tarefa_id uuid REFERENCES tarefa(id) ON DELETE CASCADE,
  lida boolean DEFAULT false,
  link text,
  data_evento timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_notificacoes_usuario ON notificacoes(user_id, lida);
CREATE INDEX idx_notificacoes_data ON notificacoes(data_evento DESC);

COMMENT ON TABLE notificacoes IS 'Notificações do sistema para usuários';
COMMENT ON COLUMN notificacoes.tipo IS 'Tipo de notificação para estilização e filtragem';

-- Trigger para atualizar updated_at em subtarefas
CREATE OR REPLACE FUNCTION update_subtarefa_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_update_subtarefa_updated_at
BEFORE UPDATE ON subtarefas
FOR EACH ROW
EXECUTE FUNCTION update_subtarefa_updated_at();

-- Function para notificar executor ao ser atribuído
CREATE OR REPLACE FUNCTION fn_notificar_executor_tarefa()
RETURNS TRIGGER AS $$
BEGIN
  -- Apenas notificar se executor_id mudou e não é null
  IF (TG_OP = 'UPDATE' AND NEW.executor_id IS DISTINCT FROM OLD.executor_id AND NEW.executor_id IS NOT NULL) OR
     (TG_OP = 'INSERT' AND NEW.executor_id IS NOT NULL) THEN
    
    INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, tarefa_id, link)
    VALUES (
      NEW.executor_id,
      'tarefa_atribuida',
      'Nova Tarefa Atribuída',
      'A tarefa "' || NEW.titulo || '" foi atribuída para você.',
      NEW.id,
      '/tarefas/' || NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_notificar_executor
AFTER INSERT OR UPDATE OF executor_id ON tarefa
FOR EACH ROW
EXECUTE FUNCTION fn_notificar_executor_tarefa();
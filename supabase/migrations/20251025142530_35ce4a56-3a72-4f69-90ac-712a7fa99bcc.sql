-- Fase 1: Triggers para Notificações In-App

-- Trigger para comentários em tarefas
CREATE OR REPLACE FUNCTION fn_notificar_comentario_tarefa()
RETURNS TRIGGER AS $$
DECLARE
  v_responsavel_id uuid;
  v_tarefa_titulo text;
BEGIN
  -- Buscar responsável e título da tarefa
  SELECT responsavel_id, titulo INTO v_responsavel_id, v_tarefa_titulo
  FROM tarefa
  WHERE id = NEW.tarefa_id;
  
  -- Notificar responsável se não foi ele que comentou
  IF v_responsavel_id IS NOT NULL AND v_responsavel_id != NEW.autor_id THEN
    INSERT INTO notificacoes (
      user_id,
      tipo,
      titulo,
      mensagem,
      link_acao
    ) VALUES (
      v_responsavel_id,
      'info',
      'Novo comentário',
      'Novo comentário na tarefa: ' || v_tarefa_titulo,
      '/tarefas/' || NEW.tarefa_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notificar_comentario_tarefa
AFTER INSERT ON tarefa_comentarios
FOR EACH ROW
EXECUTE FUNCTION fn_notificar_comentario_tarefa();

-- Trigger para subtarefas (status mudou para concluido)
CREATE OR REPLACE FUNCTION fn_notificar_subtarefa_status()
RETURNS TRIGGER AS $$
DECLARE
  v_responsavel_id uuid;
  v_tarefa_titulo text;
BEGIN
  -- Verificar mudança de status
  IF OLD.status != NEW.status THEN
    -- Buscar dados da tarefa pai
    SELECT t.responsavel_id, t.titulo INTO v_responsavel_id, v_tarefa_titulo
    FROM tarefa t
    WHERE t.id = NEW.tarefa_pai_id;
    
    -- Notificar responsável
    IF v_responsavel_id IS NOT NULL THEN
      INSERT INTO notificacoes (
        user_id,
        tipo,
        titulo,
        mensagem,
        link_acao
      ) VALUES (
        v_responsavel_id,
        CASE 
          WHEN NEW.status = 'concluida' THEN 'success'
          ELSE 'info'
        END,
        'Subtarefa atualizada',
        'Subtarefa "' || NEW.titulo || '" agora está: ' || NEW.status || ' em: ' || v_tarefa_titulo,
        '/tarefas/' || NEW.tarefa_pai_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notificar_subtarefa_status
AFTER UPDATE ON subtarefas
FOR EACH ROW
EXECUTE FUNCTION fn_notificar_subtarefa_status();

-- Fase 4: Tabela de Push Subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own subscriptions"
ON push_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
ON push_subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
ON push_subscriptions FOR DELETE
USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user_id_lida ON notificacoes(user_id, lida);
CREATE INDEX IF NOT EXISTS idx_tarefa_comentarios_tarefa_id ON tarefa_comentarios(tarefa_id);
CREATE INDEX IF NOT EXISTS idx_subtarefas_tarefa_pai_id ON subtarefas(tarefa_pai_id);
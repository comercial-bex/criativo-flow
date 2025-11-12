-- Adicionar coluna para vincular post à tarefa
ALTER TABLE posts_planejamento 
ADD COLUMN IF NOT EXISTS tarefa_vinculada_id UUID REFERENCES tarefa(id) ON DELETE SET NULL;

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_posts_tarefa_vinculada 
ON posts_planejamento(tarefa_vinculada_id);

-- Trigger para sincronização bidirecional (tarefa → post)
CREATE OR REPLACE FUNCTION sync_tarefa_to_post()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a tarefa mudou, atualizar post vinculado
  UPDATE posts_planejamento
  SET
    titulo = NEW.titulo,
    data_postagem = NEW.prazo_executor,
    status_post = CASE 
      WHEN NEW.status = 'backlog' THEN 'a_fazer'
      WHEN NEW.status = 'em_producao' THEN 'em_producao'
      WHEN NEW.status = 'aprovado' THEN 'pronto'
      WHEN NEW.status = 'publicado' THEN 'publicado'
      ELSE 'a_fazer'
    END
  WHERE tarefa_vinculada_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_sync_tarefa_to_post ON tarefa;
CREATE TRIGGER trigger_sync_tarefa_to_post
AFTER UPDATE ON tarefa
FOR EACH ROW
EXECUTE FUNCTION sync_tarefa_to_post();
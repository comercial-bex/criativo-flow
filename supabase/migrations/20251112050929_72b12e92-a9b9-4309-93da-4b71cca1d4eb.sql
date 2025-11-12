-- Corrigir search_path da função sync_tarefa_to_post
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
$$ LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, pg_temp;
-- Adicionar campo texto_estruturado para armazenar AIDA, CTA, Storytelling
ALTER TABLE posts_planejamento 
ADD COLUMN IF NOT EXISTS texto_estruturado TEXT;

-- Atualizar campo tipo_conteudo se não existir
ALTER TABLE posts_planejamento 
ADD COLUMN IF NOT EXISTS tipo_conteudo TEXT DEFAULT 'informar';

-- Comentários descritivos
COMMENT ON COLUMN posts_planejamento.tipo_conteudo IS 'Conceito editorial: informar, inspirar, entreter, vender, posicionar';
COMMENT ON COLUMN posts_planejamento.objetivo_postagem IS 'Meta/finalidade mensurável da postagem (texto livre)';
COMMENT ON COLUMN posts_planejamento.texto_estruturado IS 'Estrutura textual: AIDA, CTA direto ou Storytelling';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_posts_tipo_conteudo ON posts_planejamento(tipo_conteudo);

-- Atualizar trigger para sincronizar tarefa → post com novos campos
CREATE OR REPLACE FUNCTION sync_tarefa_to_post()
RETURNS TRIGGER AS $$
BEGIN
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
    END,
    tipo_conteudo = COALESCE(NEW.kpis->'briefing'->>'tipo_conteudo', 'informar'),
    objetivo_postagem = NEW.kpis->'briefing'->>'objetivo_postagem',
    updated_at = NOW()
  WHERE tarefa_vinculada_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
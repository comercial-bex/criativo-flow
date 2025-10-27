-- FASE 4.1 CORRIGIDA: Adicionar coluna status a posts_planejamento

-- 1. Criar tipo ENUM para status de posts
DO $$ BEGIN
  CREATE TYPE post_status_enum AS ENUM (
    'rascunho', 
    'em_aprovacao', 
    'aprovado', 
    'reprovado',
    'em_producao', 
    'aguardando_publicacao', 
    'publicado', 
    'cancelado'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Adicionar coluna status 
ALTER TABLE posts_planejamento 
ADD COLUMN IF NOT EXISTS status post_status_enum DEFAULT 'rascunho';

-- 3. Adicionar coluna rede_social se não existir
ALTER TABLE posts_planejamento 
ADD COLUMN IF NOT EXISTS rede_social text DEFAULT 'instagram';

-- 4. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_posts_planejamento_status 
ON posts_planejamento(status);

-- 5. Atualizar posts existentes que já têm aprovações
-- (aprovacoes_cliente não tem item_id, então pulamos essa parte por enquanto)

COMMENT ON COLUMN posts_planejamento.status IS 'Status do post no fluxo editorial: rascunho → em_aprovacao → aprovado → em_producao → publicado';
COMMENT ON COLUMN posts_planejamento.rede_social IS 'Rede social de destino: instagram, facebook, linkedin, etc.';
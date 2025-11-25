-- ============================================
-- FASE 1: CORREÇÕES CRÍTICAS
-- P1: Adicionar relacionamento Posts ↔ Projeto  
-- P2: Adicionar relacionamento Aprovações ↔ Posts
-- ============================================

-- ========== P1: Posts ↔ Projeto ==========

-- 1. Adicionar coluna projeto_id
ALTER TABLE posts_planejamento 
ADD COLUMN IF NOT EXISTS projeto_id UUID;

-- 2. Criar FK
ALTER TABLE posts_planejamento
DROP CONSTRAINT IF EXISTS fk_posts_projeto;

ALTER TABLE posts_planejamento
ADD CONSTRAINT fk_posts_projeto
FOREIGN KEY (projeto_id) REFERENCES projetos(id)
ON DELETE SET NULL;

-- 3. Índices de performance
CREATE INDEX IF NOT EXISTS idx_posts_projeto_id ON posts_planejamento(projeto_id);
CREATE INDEX IF NOT EXISTS idx_posts_projeto_data ON posts_planejamento(projeto_id, data_postagem);
CREATE INDEX IF NOT EXISTS idx_posts_projeto_status ON posts_planejamento(projeto_id, status_post);

-- 4. Migrar dados existentes (projeto mais recente do cliente)
UPDATE posts_planejamento pp
SET projeto_id = (
  SELECT pr.id
  FROM planejamentos pl
  JOIN projetos pr ON pr.cliente_id = pl.cliente_id
  WHERE pl.id = pp.planejamento_id
  ORDER BY pr.created_at DESC
  LIMIT 1
)
WHERE pp.projeto_id IS NULL;

-- ========== P2: Aprovações ↔ Posts ==========

-- 1. Adicionar coluna post_id
ALTER TABLE aprovacoes_cliente
ADD COLUMN IF NOT EXISTS post_id UUID;

-- 2. Criar FK
ALTER TABLE aprovacoes_cliente
DROP CONSTRAINT IF EXISTS fk_aprovacao_post;

ALTER TABLE aprovacoes_cliente
ADD CONSTRAINT fk_aprovacao_post
FOREIGN KEY (post_id) REFERENCES posts_planejamento(id)
ON DELETE CASCADE;

-- 3. Índices de performance
CREATE INDEX IF NOT EXISTS idx_aprovacoes_post_id ON aprovacoes_cliente(post_id);
CREATE INDEX IF NOT EXISTS idx_aprovacoes_cliente_post ON aprovacoes_cliente(cliente_id, post_id);
CREATE INDEX IF NOT EXISTS idx_aprovacoes_post_status ON aprovacoes_cliente(post_id, status);

-- 4. Migrar dados via trace_id
UPDATE aprovacoes_cliente ac
SET post_id = ac.trace_id::UUID
WHERE ac.post_id IS NULL 
  AND ac.trace_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM posts_planejamento WHERE id = ac.trace_id::UUID);

-- ========== Documentação ==========

COMMENT ON COLUMN posts_planejamento.projeto_id IS 'FK para projetos - permite filtrar posts por projeto e gerar relatórios';
COMMENT ON COLUMN aprovacoes_cliente.post_id IS 'FK para posts - rastreia histórico de aprovações';

-- ========== Validação ==========

DO $$
DECLARE
  posts_sem_projeto INT;
  aprovacoes_vinculadas INT;
BEGIN
  SELECT COUNT(*) INTO posts_sem_projeto FROM posts_planejamento WHERE projeto_id IS NULL;
  SELECT COUNT(*) INTO aprovacoes_vinculadas FROM aprovacoes_cliente WHERE post_id IS NOT NULL;
  
  RAISE NOTICE '✅ FASE 1 concluída';
  RAISE NOTICE '📊 Posts sem projeto: %', posts_sem_projeto;
  RAISE NOTICE '📊 Aprovações vinculadas: %', aprovacoes_vinculadas;
END $$;
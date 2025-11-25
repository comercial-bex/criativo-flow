-- ============================================
-- FASE 2: OTIMIZAÇÕES (SEM TRIGGERS)
-- P4: Adicionar relacionamento Tarefas ↔ Planejamento
-- P5: TTL e limpeza automática de posts temporários
-- ============================================

-- ========== P4: Tarefas ↔ Planejamento ==========

-- 1. Adicionar coluna planejamento_id
ALTER TABLE tarefa
ADD COLUMN IF NOT EXISTS planejamento_id UUID;

-- 2. Criar FK
ALTER TABLE tarefa
DROP CONSTRAINT IF EXISTS fk_tarefa_planejamento;

ALTER TABLE tarefa
ADD CONSTRAINT fk_tarefa_planejamento
FOREIGN KEY (planejamento_id) REFERENCES planejamentos(id)
ON DELETE SET NULL;

-- 3. Índices de performance
CREATE INDEX IF NOT EXISTS idx_tarefa_planejamento_id ON tarefa(planejamento_id);
CREATE INDEX IF NOT EXISTS idx_tarefa_planejamento_status ON tarefa(planejamento_id, status);
CREATE INDEX IF NOT EXISTS idx_tarefa_planejamento_tipo ON tarefa(planejamento_id, tipo);

-- ========== P5: TTL e Limpeza de Posts Temporários ==========

-- 1. Adicionar FK em posts_gerados_temp
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_posts_temp_planejamento'
  ) THEN
    ALTER TABLE posts_gerados_temp
    ADD CONSTRAINT fk_posts_temp_planejamento
    FOREIGN KEY (planejamento_id) REFERENCES planejamentos(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Adicionar coluna expires_at
ALTER TABLE posts_gerados_temp
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days');

-- 3. Atualizar expires_at para registros existentes
UPDATE posts_gerados_temp
SET expires_at = created_at + INTERVAL '7 days'
WHERE expires_at IS NULL;

-- 4. Função de limpeza automática
CREATE OR REPLACE FUNCTION cleanup_expired_temp_posts()
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM posts_gerados_temp
  WHERE expires_at < NOW() 
     OR created_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  IF deleted_count > 0 THEN
    INSERT INTO audit_trail (
      entidade_tipo,
      entidade_id,
      acao,
      acao_detalhe,
      dados_depois
    ) VALUES (
      'posts_gerados_temp',
      gen_random_uuid(),
      'cleanup_expired',
      'Limpeza automática',
      jsonb_build_object(
        'posts_deletados', deleted_count,
        'timestamp', NOW()
      )
    );
  END IF;
  
  RETURN deleted_count;
END;
$$;

-- 5. Índice para otimizar limpeza
CREATE INDEX IF NOT EXISTS idx_posts_temp_expires ON posts_gerados_temp(expires_at) 
WHERE expires_at IS NOT NULL;

-- ========== Documentação ==========

COMMENT ON COLUMN tarefa.planejamento_id IS 'FK para planejamentos - filtrar tarefas por planejamento';
COMMENT ON COLUMN posts_gerados_temp.expires_at IS 'Expiração automática - deletado após 7 dias';
COMMENT ON FUNCTION cleanup_expired_temp_posts() IS 'Limpeza automática de posts temporários';

-- ========== Validação ==========

DO $$
DECLARE
  posts_temp_count INT;
  posts_expirados INT;
BEGIN
  SELECT COUNT(*) INTO posts_temp_count FROM posts_gerados_temp;
  SELECT COUNT(*) INTO posts_expirados FROM posts_gerados_temp WHERE expires_at < NOW();
  
  RAISE NOTICE '✅ FASE 2 concluída';
  RAISE NOTICE '📊 Posts temporários: %', posts_temp_count;
  RAISE NOTICE '📊 Posts expirados: %', posts_expirados;
  
  IF posts_expirados > 0 THEN
    PERFORM cleanup_expired_temp_posts();
    RAISE NOTICE '🧹 Limpeza executada';
  END IF;
END $$;
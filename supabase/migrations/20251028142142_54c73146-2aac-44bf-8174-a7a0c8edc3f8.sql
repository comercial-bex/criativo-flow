-- ====================================================================
-- FASE 1 - CORREÇÃO ESTRUTURAL
-- Adicionar captacao_id e FK constraints
-- ====================================================================

-- 1.1 Adicionar coluna captacao_id
ALTER TABLE eventos_calendario 
ADD COLUMN captacao_id UUID;

-- 1.2 Adicionar FK para captacoes_agenda
ALTER TABLE eventos_calendario 
ADD CONSTRAINT fk_eventos_captacao 
FOREIGN KEY (captacao_id) REFERENCES captacoes_agenda(id) ON DELETE SET NULL;

-- 1.3 Criar índice para captacao_id
CREATE INDEX idx_eventos_captacao_id ON eventos_calendario(captacao_id);

-- 1.4 Adicionar FK para tarefa_id (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_eventos_tarefa'
  ) THEN
    ALTER TABLE eventos_calendario 
    ADD CONSTRAINT fk_eventos_tarefa 
    FOREIGN KEY (tarefa_id) REFERENCES tarefa(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 1.5 Criar índice único para tarefa_id
CREATE UNIQUE INDEX idx_eventos_tarefa_unico 
ON eventos_calendario(tarefa_id) 
WHERE tarefa_id IS NOT NULL;

-- Validação
SELECT 
  'captacao_id adicionado' as acao,
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END as status
FROM information_schema.columns
WHERE table_name = 'eventos_calendario' 
  AND column_name = 'captacao_id'

UNION ALL

SELECT 
  'FK tarefa_id criada',
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END
FROM information_schema.table_constraints
WHERE constraint_name = 'fk_eventos_tarefa'

UNION ALL

SELECT 
  'FK captacao_id criada',
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END
FROM information_schema.table_constraints
WHERE constraint_name = 'fk_eventos_captacao';
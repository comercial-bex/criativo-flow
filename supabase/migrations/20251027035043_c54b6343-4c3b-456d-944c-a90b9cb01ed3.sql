-- ============================================================================
-- SPRINT 1B FINAL: Correção de Foreign Keys
-- Objetivo: Corrigir FKs de captacoes_agenda e tarefa para apontar para pessoas.profile_id
-- ============================================================================

-- ETAPA 1: Corrigir FK de captacoes_agenda
-- ============================================================================

-- 1.1) Dropar FK incorreta
ALTER TABLE captacoes_agenda 
DROP CONSTRAINT IF EXISTS fk_captacoes_especialista;

-- 1.2) Recriar FK correta apontando para pessoas.profile_id
ALTER TABLE captacoes_agenda 
ADD CONSTRAINT fk_captacoes_especialista 
FOREIGN KEY (especialista_id) 
REFERENCES pessoas(profile_id) 
ON DELETE SET NULL;

-- 1.3) Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_captacoes_especialista 
ON captacoes_agenda(especialista_id);

-- ============================================================================
-- ETAPA 2: Corrigir FK de tarefa.responsavel_id
-- ============================================================================

-- 2.1) Dropar FK antiga (se existir)
ALTER TABLE tarefa 
DROP CONSTRAINT IF EXISTS fk_tarefa_responsavel;

ALTER TABLE tarefa 
DROP CONSTRAINT IF EXISTS tarefa_responsavel_id_fkey;

-- 2.2) Recriar FK correta para pessoas.profile_id
ALTER TABLE tarefa 
ADD CONSTRAINT fk_tarefa_responsavel 
FOREIGN KEY (responsavel_id) 
REFERENCES pessoas(profile_id) 
ON DELETE SET NULL;

-- 2.3) Criar índice se não existir
CREATE INDEX IF NOT EXISTS idx_tarefa_responsavel 
ON tarefa(responsavel_id);

-- ============================================================================
-- ETAPA 3: Corrigir FK de tarefa.executor_id (se necessário)
-- ============================================================================

-- 3.1) Dropar FK antiga
ALTER TABLE tarefa 
DROP CONSTRAINT IF EXISTS fk_tarefa_executor;

ALTER TABLE tarefa 
DROP CONSTRAINT IF EXISTS tarefa_executor_id_fkey;

-- 3.2) Recriar FK correta para pessoas.profile_id
ALTER TABLE tarefa 
ADD CONSTRAINT fk_tarefa_executor 
FOREIGN KEY (executor_id) 
REFERENCES pessoas(profile_id) 
ON DELETE SET NULL;

-- 3.3) Criar índice se não existir
CREATE INDEX IF NOT EXISTS idx_tarefa_executor 
ON tarefa(executor_id);

-- ============================================================================
-- VALIDAÇÃO FINAL
-- ============================================================================

DO $$
DECLARE
  fk_captacoes_ok BOOLEAN;
  fk_tarefa_resp_ok BOOLEAN;
  fk_tarefa_exec_ok BOOLEAN;
  validation_msg TEXT := E'\n=== VALIDAÇÃO DE FOREIGN KEYS ===\n';
BEGIN
  -- Validar FK de captacoes_agenda
  SELECT EXISTS (
    SELECT 1 
    FROM pg_constraint c
    JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
    WHERE conrelid = 'captacoes_agenda'::regclass
      AND conname = 'fk_captacoes_especialista'
      AND confrelid = 'pessoas'::regclass
      AND af.attname = 'profile_id'
  ) INTO fk_captacoes_ok;

  -- Validar FK de tarefa.responsavel_id
  SELECT EXISTS (
    SELECT 1 
    FROM pg_constraint c
    JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
    WHERE conrelid = 'tarefa'::regclass
      AND conname = 'fk_tarefa_responsavel'
      AND confrelid = 'pessoas'::regclass
      AND af.attname = 'profile_id'
  ) INTO fk_tarefa_resp_ok;

  -- Validar FK de tarefa.executor_id
  SELECT EXISTS (
    SELECT 1 
    FROM pg_constraint c
    JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
    WHERE conrelid = 'tarefa'::regclass
      AND conname = 'fk_tarefa_executor'
      AND confrelid = 'pessoas'::regclass
      AND af.attname = 'profile_id'
  ) INTO fk_tarefa_exec_ok;

  -- Construir mensagem de validação
  validation_msg := validation_msg || 
    E'✓ FK captacoes_agenda.especialista_id → pessoas.profile_id: ' || 
    CASE WHEN fk_captacoes_ok THEN '✅ OK' ELSE '❌ FALHOU' END || E'\n';
  
  validation_msg := validation_msg || 
    E'✓ FK tarefa.responsavel_id → pessoas.profile_id: ' || 
    CASE WHEN fk_tarefa_resp_ok THEN '✅ OK' ELSE '❌ FALHOU' END || E'\n';
  
  validation_msg := validation_msg || 
    E'✓ FK tarefa.executor_id → pessoas.profile_id: ' || 
    CASE WHEN fk_tarefa_exec_ok THEN '✅ OK' ELSE '❌ FALHOU' END || E'\n';

  -- Mostrar resultado
  RAISE NOTICE '%', validation_msg;

  -- Falhar se alguma FK não estiver correta
  IF NOT (fk_captacoes_ok AND fk_tarefa_resp_ok AND fk_tarefa_exec_ok) THEN
    RAISE EXCEPTION 'Validação de Foreign Keys falhou!';
  END IF;
END $$;
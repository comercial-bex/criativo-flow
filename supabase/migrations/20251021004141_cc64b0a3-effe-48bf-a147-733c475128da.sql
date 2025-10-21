-- Remover triggers e funções obsoletas que bloqueiam a migração
DROP TRIGGER IF EXISTS trg_gerar_receita_tarefa ON tarefa;
DROP TRIGGER IF EXISTS trigger_gerar_receita_tarefa ON tarefa;
DROP FUNCTION IF EXISTS fn_gerar_receita_tarefa() CASCADE;

-- ============================================================================
-- SPRINT 1 CORRIGIDO: Eliminação de Dados Órfãos
-- Objetivo: Preparar sistema para criação de Foreign Keys
-- Órfãos detectados: 47 (17 projetos + 15 tarefas executor + 15 responsavel)
-- ============================================================================

-- ETAPA 1: Backup Completo (Segurança)
CREATE TABLE IF NOT EXISTS backup_fks_pre_sprint1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela TEXT NOT NULL,
  registro_id UUID NOT NULL,
  campo TEXT NOT NULL,
  valor_antigo UUID,
  backup_timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Backup de projetos.responsavel_grs_id
INSERT INTO backup_fks_pre_sprint1 (tabela, registro_id, campo, valor_antigo)
SELECT 'projetos', id, 'responsavel_grs_id', responsavel_grs_id
FROM projetos 
WHERE responsavel_grs_id IS NOT NULL;

-- Backup de tarefa.executor_id
INSERT INTO backup_fks_pre_sprint1 (tabela, registro_id, campo, valor_antigo)
SELECT 'tarefa', id, 'executor_id', executor_id
FROM tarefa 
WHERE executor_id IS NOT NULL;

-- Backup de tarefa.responsavel_id
INSERT INTO backup_fks_pre_sprint1 (tabela, registro_id, campo, valor_antigo)
SELECT 'tarefa', id, 'responsavel_id', responsavel_id
FROM tarefa 
WHERE responsavel_id IS NOT NULL;

-- ETAPA 2: Registro de Órfãos (Auditoria)
CREATE TABLE IF NOT EXISTS dados_orfaos_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela TEXT NOT NULL,
  campo TEXT NOT NULL,
  registro_id UUID NOT NULL,
  valor_orfao UUID NOT NULL,
  identificado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Registrar projetos órfãos
INSERT INTO dados_orfaos_historico (tabela, campo, registro_id, valor_orfao)
SELECT 'projetos', 'responsavel_grs_id', p.id, p.responsavel_grs_id
FROM projetos p
WHERE p.responsavel_grs_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM pessoas WHERE id = p.responsavel_grs_id);

-- Registrar tarefas órfãos (executor)
INSERT INTO dados_orfaos_historico (tabela, campo, registro_id, valor_orfao)
SELECT 'tarefa', 'executor_id', t.id, t.executor_id
FROM tarefa t
WHERE t.executor_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM pessoas WHERE id = t.executor_id);

-- Registrar tarefas órfãos (responsavel)
INSERT INTO dados_orfaos_historico (tabela, campo, registro_id, valor_orfao)
SELECT 'tarefa', 'responsavel_id', t.id, t.responsavel_id
FROM tarefa t
WHERE t.responsavel_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM pessoas WHERE id = t.responsavel_id);

-- ETAPA 3: Limpeza de Dados Órfãos
UPDATE projetos 
SET responsavel_grs_id = NULL,
    updated_at = NOW()
WHERE responsavel_grs_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM pessoas WHERE id = projetos.responsavel_grs_id);

UPDATE tarefa 
SET executor_id = NULL,
    updated_at = NOW()
WHERE executor_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM pessoas WHERE id = tarefa.executor_id);

UPDATE tarefa 
SET responsavel_id = NULL,
    updated_at = NOW()
WHERE responsavel_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM pessoas WHERE id = tarefa.responsavel_id);

-- ETAPA 4: View de Validação
CREATE OR REPLACE VIEW validacao_orfaos_sprint1 AS
SELECT 
  'projetos.responsavel_grs_id' as campo,
  COUNT(*) as total_orfaos
FROM projetos p
WHERE p.responsavel_grs_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM pessoas WHERE id = p.responsavel_grs_id)

UNION ALL

SELECT 
  'tarefa.executor_id',
  COUNT(*)
FROM tarefa t
WHERE t.executor_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM pessoas WHERE id = t.executor_id)

UNION ALL

SELECT 
  'tarefa.responsavel_id',
  COUNT(*)
FROM tarefa t
WHERE t.responsavel_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM pessoas WHERE id = t.responsavel_id);

-- ETAPA 5: Função de Rollback
CREATE OR REPLACE FUNCTION rollback_sprint1()
RETURNS TABLE(tabela TEXT, registros_restaurados BIGINT) AS $$
BEGIN
  UPDATE projetos p
  SET responsavel_grs_id = b.valor_antigo
  FROM backup_fks_pre_sprint1 b
  WHERE b.tabela = 'projetos' 
    AND b.campo = 'responsavel_grs_id'
    AND b.registro_id = p.id;
  
  UPDATE tarefa t
  SET executor_id = b.valor_antigo
  FROM backup_fks_pre_sprint1 b
  WHERE b.tabela = 'tarefa' 
    AND b.campo = 'executor_id'
    AND b.registro_id = t.id;
  
  UPDATE tarefa t
  SET responsavel_id = b.valor_antigo
  FROM backup_fks_pre_sprint1 b
  WHERE b.tabela = 'tarefa' 
    AND b.campo = 'responsavel_id'
    AND b.registro_id = t.id;
  
  RETURN QUERY
  SELECT 'projetos'::TEXT, COUNT(*)::BIGINT FROM backup_fks_pre_sprint1 WHERE tabela = 'projetos'
  UNION ALL
  SELECT 'tarefa', COUNT(*) FROM backup_fks_pre_sprint1 WHERE tabela = 'tarefa';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ETAPA 6: Registro no Audit Trail
INSERT INTO audit_trail (
  acao, entidade_tipo, entidade_id, dados_antes, dados_depois, metadata, 
  user_role, acao_detalhe, entidades_afetadas, impacto_tipo
)
VALUES (
  'FIX_ORPHANS', 'sistema', gen_random_uuid(),
  jsonb_build_object('orfaos_projetos', 17, 'orfaos_tarefa_executor', 15, 'orfaos_tarefa_responsavel', 15, 'total', 47),
  jsonb_build_object('orfaos_projetos', 0, 'orfaos_tarefa_executor', 0, 'orfaos_tarefa_responsavel', 0, 'total', 0),
  jsonb_build_object('sprint', '1', 'estrategia', 'SET_NULL', 'backup_tabela', 'backup_fks_pre_sprint1', 'historico_tabela', 'dados_orfaos_historico', 'rollback_function', 'rollback_sprint1()'),
  'system', 'Sprint 1: Correção de 47 dados órfãos (preparação para FKs)',
  '["projetos", "tarefa"]'::jsonb, 'integridade'
);
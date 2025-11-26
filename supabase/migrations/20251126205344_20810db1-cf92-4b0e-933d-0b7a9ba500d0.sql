-- ========================================
-- MIGRATION: Correções críticas MVP - Parte 1
-- ========================================

-- ✅ 1. ADICIONAR coluna data_prazo na tabela tarefa
ALTER TABLE tarefa ADD COLUMN IF NOT EXISTS data_prazo DATE;

-- ✅ 2. MIGRAR dados de prazo_executor para data_prazo
UPDATE tarefa 
SET data_prazo = prazo_executor::date 
WHERE prazo_executor IS NOT NULL AND data_prazo IS NULL;

-- ✅ 3. RECRIAR views adicionando coluna data_prazo

-- View: vw_calendario_completo
DROP VIEW IF EXISTS vw_calendario_completo CASCADE;
CREATE OR REPLACE VIEW vw_calendario_completo AS
SELECT 
  t.id as tarefa_id,
  t.titulo as tarefa_titulo,
  t.descricao as tarefa_descricao,
  t.status as tarefa_status,
  t.prioridade,
  t.tipo as tarefa_tipo,
  t.data_prazo,
  t.prazo_executor,
  t.data_inicio_prevista,
  t.data_entrega_prevista,
  t.created_at as tarefa_created_at,
  c.id as cliente_id,
  c.nome as cliente_nome,
  p.id as projeto_id,
  p.titulo as projeto_titulo,
  p.status as projeto_status,
  resp.profile_id as responsavel_profile_id,
  resp.nome as responsavel_nome,
  exec.profile_id as executor_profile_id,
  exec.nome as executor_nome
FROM tarefa t
LEFT JOIN clientes c ON c.id = t.cliente_id
LEFT JOIN projetos p ON p.id = t.projeto_id
LEFT JOIN pessoas resp ON resp.id = t.responsavel_id
LEFT JOIN pessoas exec ON exec.id = t.executor_id;

-- View: vw_dashboard_vencimentos (corrigido: concluido sem acento)
DROP VIEW IF EXISTS vw_dashboard_vencimentos CASCADE;
CREATE OR REPLACE VIEW vw_dashboard_vencimentos AS
SELECT 
  t.id,
  t.titulo,
  t.descricao,
  t.status,
  t.prioridade,
  t.tipo,
  t.data_prazo,
  t.prazo_executor,
  t.cliente_id,
  c.nome as cliente_nome,
  t.projeto_id,
  p.titulo as projeto_titulo,
  t.responsavel_id,
  resp.nome as responsavel_nome,
  t.executor_id,
  exec.nome as executor_nome,
  CASE 
    WHEN t.data_prazo < CURRENT_DATE THEN true
    WHEN t.prazo_executor::date < CURRENT_DATE THEN true
    ELSE false
  END as atrasada
FROM tarefa t
LEFT JOIN clientes c ON c.id = t.cliente_id
LEFT JOIN projetos p ON p.id = t.projeto_id
LEFT JOIN pessoas resp ON resp.id = t.responsavel_id
LEFT JOIN pessoas exec ON exec.id = t.executor_id
WHERE t.status != 'concluido';

-- ✅ 4. CRIAR índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_tarefa_data_prazo ON tarefa(data_prazo) WHERE data_prazo IS NOT NULL;

-- ✅ 5. Log de auditoria
INSERT INTO audit_trail (
  entidade_tipo,
  entidade_id,
  acao,
  acao_detalhe,
  user_id,
  dados_depois,
  trace_id
) VALUES (
  'system',
  gen_random_uuid(),
  'migration_mvp_fixes_part1',
  'Adicionado data_prazo em tarefa e views recriadas',
  NULL,
  jsonb_build_object(
    'data_prazo_adicionado', true,
    'views_recriadas', 2,
    'timestamp', NOW()
  ),
  gen_random_uuid()
);

COMMENT ON COLUMN tarefa.data_prazo IS 'Data de prazo da tarefa (compatibilidade com frontend)';

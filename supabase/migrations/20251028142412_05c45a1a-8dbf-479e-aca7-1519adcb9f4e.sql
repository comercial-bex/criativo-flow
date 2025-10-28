-- ====================================================================
-- FASE 4 - VIEW UNIFICADA E OTIMIZAÇÃO
-- ====================================================================

-- 4.1 Criar View de Calendário Unificado
CREATE OR REPLACE VIEW vw_calendario_unificado AS
SELECT 
  ec.id,
  ec.titulo,
  ec.data_inicio,
  ec.data_fim,
  ec.tipo,
  ec.status,
  ec.origem,
  ec.cor,
  ec.responsavel_id,
  ec.projeto_id,
  ec.cliente_id,
  ec.tarefa_id,
  ec.captacao_id,
  ec.is_automatico,
  ec.local,
  ec.descricao,
  ec.duracao_minutos,
  -- Dados do responsável
  p.nome as responsavel_nome,
  p.avatar_url as responsavel_avatar,
  p.papeis as responsavel_papeis,
  -- Dados do projeto
  proj.titulo as projeto_titulo,
  -- Dados do cliente
  c.nome as cliente_nome,
  -- Metadados de origem
  CASE 
    WHEN ec.tarefa_id IS NOT NULL THEN 'Tarefa'
    WHEN ec.captacao_id IS NOT NULL THEN 'Captação'
    ELSE 'Evento Manual'
  END as tipo_origem,
  ec.created_at,
  ec.updated_at
FROM eventos_calendario ec
LEFT JOIN pessoas p ON p.id = ec.responsavel_id
LEFT JOIN projetos proj ON proj.id = ec.projeto_id
LEFT JOIN clientes c ON c.id = ec.cliente_id
ORDER BY ec.data_inicio DESC;

-- 4.2 Adicionar Índices de Performance
CREATE INDEX IF NOT EXISTS idx_eventos_responsavel_periodo 
ON eventos_calendario(responsavel_id, data_inicio, data_fim);

CREATE INDEX IF NOT EXISTS idx_eventos_origem_tipo 
ON eventos_calendario(origem, tipo);

CREATE INDEX IF NOT EXISTS idx_tarefa_prazo 
ON tarefa(prazo_executor) WHERE prazo_executor IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_captacao_data 
ON captacoes_agenda(data_captacao) WHERE data_captacao IS NOT NULL;

-- ====================================================================
-- FASE 5 - VIEW DE VALIDAÇÃO
-- ====================================================================

CREATE OR REPLACE VIEW vw_validacao_calendario_sync AS
SELECT 
  'Total Eventos' as metrica,
  COUNT(*)::text as valor,
  '✅' as status
FROM eventos_calendario

UNION ALL

SELECT 
  'Eventos de Tarefas',
  COUNT(*)::text,
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️' END
FROM eventos_calendario WHERE tarefa_id IS NOT NULL

UNION ALL

SELECT 
  'Eventos de Captações',
  COUNT(*)::text,
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️' END
FROM eventos_calendario WHERE captacao_id IS NOT NULL

UNION ALL

SELECT 
  'Tarefas Órfãs (SEM evento)',
  COUNT(*)::text,
  CASE WHEN COUNT(*) = 0 THEN '✅' ELSE '❌' END
FROM tarefa t
LEFT JOIN eventos_calendario ec ON ec.tarefa_id = t.id
WHERE t.prazo_executor IS NOT NULL AND ec.id IS NULL

UNION ALL

SELECT 
  'Captações Órfãs (SEM evento)',
  COUNT(*)::text,
  CASE WHEN COUNT(*) = 0 THEN '✅' ELSE '❌' END
FROM captacoes_agenda ca
LEFT JOIN eventos_calendario ec ON ec.captacao_id = ca.id
WHERE ca.data_captacao IS NOT NULL AND ec.id IS NULL

UNION ALL

SELECT 
  'Trigger Tarefas Ativo',
  CASE WHEN COUNT(*) > 0 THEN 'SIM' ELSE 'NÃO' END,
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END
FROM pg_trigger 
WHERE tgname = 'trg_auto_sync_tarefa_to_calendar'

UNION ALL

SELECT 
  'Trigger Captações Ativo',
  CASE WHEN COUNT(*) > 0 THEN 'SIM' ELSE 'NÃO' END,
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '❌' END
FROM pg_trigger 
WHERE tgname = 'trg_auto_sync_captacao_to_calendar';

-- Comentários
COMMENT ON VIEW vw_calendario_unificado IS 
'View unificada do calendário com dados relacionados de pessoas, projetos e clientes. Sincroniza automaticamente tarefas e captações.';

COMMENT ON FUNCTION fn_auto_sync_tarefa_to_calendar() IS 
'Trigger automático que sincroniza tarefas com eventos no calendário quando prazo_executor é definido.';

COMMENT ON FUNCTION fn_auto_sync_captacao_to_calendar() IS 
'Trigger automático que sincroniza captações com eventos no calendário quando data_captacao é definida.';

-- Validação Final
SELECT '✅ SINCRONIZAÇÃO COMPLETA!' as resultado;
SELECT * FROM vw_validacao_calendario_sync ORDER BY metrica;
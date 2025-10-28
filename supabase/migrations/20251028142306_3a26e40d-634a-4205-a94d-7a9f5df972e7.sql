-- ====================================================================
-- FASE 2 - SINCRONIZAÇÃO RETROATIVA (SEM ON CONFLICT)
-- ====================================================================

-- 2.1 Função de Sincronização de Tarefas Órfãs
CREATE OR REPLACE FUNCTION sync_tarefas_to_calendar()
RETURNS TABLE(tarefas_sincronizadas INT, erros TEXT[]) 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  v_count INT := 0;
  v_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
  INSERT INTO eventos_calendario (
    titulo, descricao, tipo, status,
    data_inicio, data_fim,
    responsavel_id, projeto_id, cliente_id, tarefa_id,
    origem, cor, is_automatico
  )
  SELECT 
    t.titulo,
    COALESCE(t.descricao, 'Tarefa criada automaticamente'),
    'criacao_avulso'::tipo_evento,
    CASE 
      WHEN t.status = 'concluido' THEN 'concluido'::status_evento
      WHEN t.status = 'em_andamento' THEN 'em_andamento'::status_evento
      ELSE 'agendado'::status_evento
    END,
    t.prazo_executor - INTERVAL '4 hours',
    t.prazo_executor,
    t.responsavel_id,
    t.projeto_id,
    p.cliente_id,
    t.id,
    'tarefa',
    '#3b82f6',
    true
  FROM tarefa t
  LEFT JOIN projetos p ON p.id = t.projeto_id
  LEFT JOIN eventos_calendario ec ON ec.tarefa_id = t.id
  WHERE t.prazo_executor IS NOT NULL
    AND ec.id IS NULL;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_count, v_errors;
EXCEPTION
  WHEN OTHERS THEN
    v_errors := ARRAY_APPEND(v_errors, SQLERRM);
    RETURN QUERY SELECT 0, v_errors;
END;
$$;

-- 2.2 Função de Sincronização de Captações Órfãs
CREATE OR REPLACE FUNCTION sync_captacoes_to_calendar()
RETURNS TABLE(captacoes_sincronizadas INT, erros TEXT[]) 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  v_count INT := 0;
  v_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
  INSERT INTO eventos_calendario (
    titulo, descricao, tipo, status,
    data_inicio, data_fim,
    responsavel_id, cliente_id, captacao_id,
    origem, cor, is_automatico, local
  )
  SELECT 
    ca.titulo,
    COALESCE(ca.observacoes, 'Captação agendada automaticamente'),
    'captacao_externa'::tipo_evento,
    CASE 
      WHEN ca.status = 'concluido' THEN 'concluido'::status_evento
      WHEN ca.status = 'em_andamento' THEN 'em_andamento'::status_evento
      WHEN ca.status = 'cancelado' THEN 'cancelado'::status_evento
      ELSE 'agendado'::status_evento
    END,
    ca.data_captacao,
    ca.data_captacao + INTERVAL '2 hours',
    ca.especialista_id,
    ca.cliente_id,
    ca.id,
    'captacao',
    '#f97316',
    true,
    ca.local
  FROM captacoes_agenda ca
  LEFT JOIN eventos_calendario ec ON ec.captacao_id = ca.id
  WHERE ca.data_captacao IS NOT NULL
    AND ec.id IS NULL;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN QUERY SELECT v_count, v_errors;
EXCEPTION
  WHEN OTHERS THEN
    v_errors := ARRAY_APPEND(v_errors, SQLERRM);
    RETURN QUERY SELECT 0, v_errors;
END;
$$;

-- 2.3 Executar Sincronização Retroativa
DO $$
DECLARE
  v_tarefas INT;
  v_captacoes INT;
BEGIN
  SELECT tarefas_sincronizadas INTO v_tarefas FROM sync_tarefas_to_calendar();
  SELECT captacoes_sincronizadas INTO v_captacoes FROM sync_captacoes_to_calendar();
  
  RAISE NOTICE '✅ Sincronização concluída: % tarefas + % captações', v_tarefas, v_captacoes;
END $$;

-- Validação
SELECT 
  'Tarefas sincronizadas' as metrica,
  COUNT(*) as total
FROM eventos_calendario 
WHERE tarefa_id IS NOT NULL

UNION ALL

SELECT 
  'Captações sincronizadas',
  COUNT(*)
FROM eventos_calendario 
WHERE captacao_id IS NOT NULL;
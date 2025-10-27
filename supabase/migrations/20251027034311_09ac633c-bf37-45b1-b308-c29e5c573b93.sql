-- TRIGGER: Sincronizar status de captações com tarefas e eventos
CREATE OR REPLACE FUNCTION fn_sync_captacao_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando captação é cancelada, cancelar tarefa e evento vinculados
  IF NEW.status = 'cancelado' AND OLD.status != 'cancelado' THEN
    -- Cancelar tarefa
    UPDATE tarefa 
    SET status = 'cancelado' 
    WHERE observacoes::jsonb->>'agendamento_id' = NEW.id::text;
    
    -- Cancelar evento no calendário
    UPDATE eventos_calendario 
    SET status = 'cancelado'
    WHERE titulo = '📹 ' || NEW.titulo
      AND tipo = 'captacao_externa'
      AND responsavel_id = NEW.especialista_id;
      
    RAISE NOTICE '✅ Captação % cancelada - tarefa e evento atualizados', NEW.id;
  END IF;
  
  -- Quando captação é concluída, concluir tarefa
  IF NEW.status = 'concluido' AND OLD.status != 'concluido' THEN
    UPDATE tarefa 
    SET status = 'concluido' 
    WHERE observacoes::jsonb->>'agendamento_id' = NEW.id::text;
    
    RAISE NOTICE '✅ Captação % concluída - tarefa atualizada', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_captacao_status
AFTER UPDATE OF status ON captacoes_agenda
FOR EACH ROW EXECUTE FUNCTION fn_sync_captacao_status();

-- VIEW: Dashboard consolidado do calendário
CREATE OR REPLACE VIEW vw_calendario_completo AS
SELECT 
  e.id,
  e.titulo,
  e.tipo,
  e.data_inicio,
  e.data_fim,
  e.local,
  e.status,
  e.is_bloqueante,
  e.is_extra,
  p.nome as responsavel_nome,
  p.avatar_url as responsavel_avatar,
  p.profile_id as responsavel_profile_id,
  pr.titulo as projeto_titulo,
  pr.id as projeto_id,
  c.nome as cliente_nome,
  c.id as cliente_id,
  t.id as tarefa_id,
  t.status as tarefa_status,
  ca.id as captacao_id,
  ca.status as captacao_status,
  ca.equipamentos as captacao_equipamentos
FROM eventos_calendario e
LEFT JOIN pessoas p ON e.responsavel_id = p.profile_id
LEFT JOIN projetos pr ON e.projeto_id = pr.id
LEFT JOIN clientes c ON e.cliente_id = c.id
LEFT JOIN tarefa t ON t.observacoes::jsonb->>'agendamento_id' = e.id::text
LEFT JOIN captacoes_agenda ca ON ca.titulo = REPLACE(e.titulo, '📹 ', '')
  AND ca.especialista_id = e.responsavel_id
ORDER BY e.data_inicio DESC;

-- RLS para a view
ALTER VIEW vw_calendario_completo OWNER TO postgres;
GRANT SELECT ON vw_calendario_completo TO authenticated;

COMMENT ON VIEW vw_calendario_completo IS 'Dashboard consolidado que une eventos, captações, tarefas e dados relacionados';

-- Validação final
DO $$
DECLARE
  v_trigger_count INTEGER;
  v_view_exists BOOLEAN;
  v_eventos_count INTEGER;
BEGIN
  -- Verificar trigger criado
  SELECT COUNT(*) INTO v_trigger_count
  FROM pg_trigger
  WHERE tgname = 'trg_sync_captacao_status';
  RAISE NOTICE '✅ Trigger sync_captacao_status: %', CASE WHEN v_trigger_count > 0 THEN 'Criado' ELSE 'FALHOU' END;
  
  -- Verificar view criada
  SELECT EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_name = 'vw_calendario_completo'
  ) INTO v_view_exists;
  RAISE NOTICE '✅ View calendario_completo: %', CASE WHEN v_view_exists THEN 'Criada' ELSE 'FALHOU' END;
  
  -- Contar eventos no calendário
  SELECT COUNT(*) INTO v_eventos_count FROM eventos_calendario;
  RAISE NOTICE '📊 Total de eventos no calendário: %', v_eventos_count;
END $$;
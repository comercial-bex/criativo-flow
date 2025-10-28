-- ====================================================================
-- FASE 3 - TRIGGERS AUTOMÁTICOS
-- ====================================================================

-- 3.1 Trigger para Auto-Sincronização de Tarefas
CREATE OR REPLACE FUNCTION fn_auto_sync_tarefa_to_calendar()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- INSERÇÃO: Criar evento se tarefa tem prazo
  IF (TG_OP = 'INSERT' AND NEW.prazo_executor IS NOT NULL) THEN
    INSERT INTO eventos_calendario (
      titulo, descricao, tipo, status,
      data_inicio, data_fim,
      responsavel_id, projeto_id, cliente_id, tarefa_id,
      origem, cor, is_automatico
    )
    SELECT 
      NEW.titulo,
      COALESCE(NEW.descricao, 'Tarefa criada automaticamente'),
      'criacao_avulso'::tipo_evento,
      'agendado'::status_evento,
      NEW.prazo_executor - INTERVAL '4 hours',
      NEW.prazo_executor,
      NEW.responsavel_id,
      NEW.projeto_id,
      p.cliente_id,
      NEW.id,
      'tarefa',
      '#3b82f6',
      true
    FROM projetos p WHERE p.id = NEW.projeto_id;
    
  -- ATUALIZAÇÃO: Sincronizar mudanças
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Se adicionou prazo, criar evento
    IF (OLD.prazo_executor IS NULL AND NEW.prazo_executor IS NOT NULL) THEN
      INSERT INTO eventos_calendario (
        titulo, descricao, tipo, status,
        data_inicio, data_fim,
        responsavel_id, projeto_id, cliente_id, tarefa_id,
        origem, cor, is_automatico
      )
      SELECT 
        NEW.titulo,
        COALESCE(NEW.descricao, 'Tarefa atualizada automaticamente'),
        'criacao_avulso'::tipo_evento,
        'agendado'::status_evento,
        NEW.prazo_executor - INTERVAL '4 hours',
        NEW.prazo_executor,
        NEW.responsavel_id,
        NEW.projeto_id,
        p.cliente_id,
        NEW.id,
        'tarefa',
        '#3b82f6',
        true
      FROM projetos p WHERE p.id = NEW.projeto_id;
      
    -- Se mudou prazo, atualizar evento existente
    ELSIF (NEW.prazo_executor IS NOT NULL AND OLD.prazo_executor IS DISTINCT FROM NEW.prazo_executor) THEN
      UPDATE eventos_calendario
      SET 
        data_inicio = NEW.prazo_executor - INTERVAL '4 hours',
        data_fim = NEW.prazo_executor,
        titulo = NEW.titulo,
        updated_at = NOW()
      WHERE tarefa_id = NEW.id;
      
    -- Se removeu prazo, deletar evento automático
    ELSIF (OLD.prazo_executor IS NOT NULL AND NEW.prazo_executor IS NULL) THEN
      DELETE FROM eventos_calendario 
      WHERE tarefa_id = NEW.id AND is_automatico = true;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_sync_tarefa_to_calendar ON tarefa;
CREATE TRIGGER trg_auto_sync_tarefa_to_calendar
AFTER INSERT OR UPDATE ON tarefa
FOR EACH ROW
EXECUTE FUNCTION fn_auto_sync_tarefa_to_calendar();

-- 3.2 Trigger para Auto-Sincronização de Captações
CREATE OR REPLACE FUNCTION fn_auto_sync_captacao_to_calendar()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- INSERÇÃO: Criar evento para nova captação
  IF (TG_OP = 'INSERT' AND NEW.data_captacao IS NOT NULL) THEN
    INSERT INTO eventos_calendario (
      titulo, descricao, tipo, status,
      data_inicio, data_fim,
      responsavel_id, cliente_id, captacao_id,
      origem, cor, is_automatico, local
    )
    VALUES (
      NEW.titulo,
      COALESCE(NEW.observacoes, 'Captação agendada automaticamente'),
      'captacao_externa'::tipo_evento,
      COALESCE(NEW.status::status_evento, 'agendado'::status_evento),
      NEW.data_captacao,
      NEW.data_captacao + INTERVAL '2 hours',
      NEW.especialista_id,
      NEW.cliente_id,
      NEW.id,
      'captacao',
      '#f97316',
      true,
      NEW.local
    );
    
  -- ATUALIZAÇÃO: Sincronizar mudanças
  ELSIF (TG_OP = 'UPDATE' AND NEW.data_captacao IS NOT NULL) THEN
    UPDATE eventos_calendario
    SET 
      titulo = NEW.titulo,
      data_inicio = NEW.data_captacao,
      data_fim = NEW.data_captacao + INTERVAL '2 hours',
      status = COALESCE(NEW.status::status_evento, status),
      local = NEW.local,
      updated_at = NOW()
    WHERE captacao_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_sync_captacao_to_calendar ON captacoes_agenda;
CREATE TRIGGER trg_auto_sync_captacao_to_calendar
AFTER INSERT OR UPDATE ON captacoes_agenda
FOR EACH ROW
EXECUTE FUNCTION fn_auto_sync_captacao_to_calendar();

-- Validação
SELECT 
  'Trigger Tarefas' as trigger_nome,
  CASE WHEN COUNT(*) > 0 THEN '✅ Ativo' ELSE '❌ Inativo' END as status
FROM pg_trigger 
WHERE tgname = 'trg_auto_sync_tarefa_to_calendar'

UNION ALL

SELECT 
  'Trigger Captações',
  CASE WHEN COUNT(*) > 0 THEN '✅ Ativo' ELSE '❌ Inativo' END
FROM pg_trigger 
WHERE tgname = 'trg_auto_sync_captacao_to_calendar';
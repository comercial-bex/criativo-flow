-- ============================================
-- SPRINT 1: TRIGGERS AUTOMÁTICOS DE SINCRONIZAÇÃO
-- ============================================

-- 1️⃣ TRIGGER: Sincronizar TAREFA → eventos_calendario
CREATE OR REPLACE FUNCTION fn_auto_sync_tarefa_to_calendar()
RETURNS TRIGGER AS $$
BEGIN
  -- INSERT: Criar evento quando tarefa é criada
  IF (TG_OP = 'INSERT' AND NEW.prazo_executor IS NOT NULL) THEN
    INSERT INTO eventos_calendario (
      titulo, tipo, status, data_inicio, data_fim, 
      responsavel_id, projeto_id, cliente_id, tarefa_id, 
      origem, cor, is_automatico
    )
    SELECT 
      NEW.titulo,
      'criacao_avulso'::tipo_evento,
      'agendado'::status_evento,
      NEW.prazo_executor - INTERVAL '4 hours',
      NEW.prazo_executor,
      NEW.responsavel_id,
      NEW.projeto_id,
      COALESCE(p.cliente_id, NEW.cliente_id),
      NEW.id,
      'grs',
      '#3b82f6',
      true
    FROM projetos p
    WHERE p.id = NEW.projeto_id
    UNION ALL
    SELECT 
      NEW.titulo,
      'criacao_avulso'::tipo_evento,
      'agendado'::status_evento,
      NEW.prazo_executor - INTERVAL '4 hours',
      NEW.prazo_executor,
      NEW.responsavel_id,
      NEW.projeto_id,
      NEW.cliente_id,
      NEW.id,
      'grs',
      '#3b82f6',
      true
    WHERE NEW.projeto_id IS NULL
    LIMIT 1;
    
  -- UPDATE: Atualizar evento quando tarefa muda
  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE eventos_calendario
    SET 
      titulo = NEW.titulo,
      data_inicio = NEW.prazo_executor - INTERVAL '4 hours',
      data_fim = NEW.prazo_executor,
      responsavel_id = NEW.responsavel_id,
      projeto_id = NEW.projeto_id,
      status = CASE 
        WHEN NEW.status = 'concluido' THEN 'concluido'::status_evento
        WHEN NEW.status = 'cancelado' THEN 'cancelado'::status_evento
        ELSE 'agendado'::status_evento
      END
    WHERE tarefa_id = NEW.id;
    
  -- DELETE: Remover evento quando tarefa é deletada
  ELSIF (TG_OP = 'DELETE') THEN
    DELETE FROM eventos_calendario WHERE tarefa_id = OLD.id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2️⃣ TRIGGER: Sincronizar CAPTACAO → eventos_calendario
CREATE OR REPLACE FUNCTION fn_auto_sync_captacao_to_calendar()
RETURNS TRIGGER AS $$
BEGIN
  -- INSERT: Criar evento quando captação é criada
  IF (TG_OP = 'INSERT' AND NEW.data_captacao IS NOT NULL) THEN
    INSERT INTO eventos_calendario (
      titulo, tipo, status, data_inicio, data_fim,
      responsavel_id, cliente_id, captacao_id,
      origem, cor, is_automatico
    ) VALUES (
      NEW.titulo,
      'captacao_externa'::tipo_evento,
      'agendado'::status_evento,
      NEW.data_captacao,
      NEW.data_captacao + INTERVAL '2 hours',
      NEW.especialista_id,
      NEW.cliente_id,
      NEW.id,
      'audiovisual',
      '#f97316',
      true
    );
    
  -- UPDATE: Atualizar evento quando captação muda
  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE eventos_calendario
    SET 
      titulo = NEW.titulo,
      data_inicio = NEW.data_captacao,
      data_fim = NEW.data_captacao + INTERVAL '2 hours',
      responsavel_id = NEW.especialista_id,
      cliente_id = NEW.cliente_id,
      status = CASE 
        WHEN NEW.status_captacao = 'concluido' THEN 'concluido'::status_evento
        WHEN NEW.status_captacao = 'cancelado' THEN 'cancelado'::status_evento
        ELSE 'agendado'::status_evento
      END
    WHERE captacao_id = NEW.id;
    
  -- DELETE: Remover evento quando captação é deletada
  ELSIF (TG_OP = 'DELETE') THEN
    DELETE FROM eventos_calendario WHERE captacao_id = OLD.id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3️⃣ ATIVAR TRIGGERS
DROP TRIGGER IF EXISTS trg_sync_tarefa_to_calendar ON tarefa;
CREATE TRIGGER trg_sync_tarefa_to_calendar
  AFTER INSERT OR UPDATE OR DELETE ON tarefa
  FOR EACH ROW
  EXECUTE FUNCTION fn_auto_sync_tarefa_to_calendar();

DROP TRIGGER IF EXISTS trg_sync_captacao_to_calendar ON captacoes_agenda;
CREATE TRIGGER trg_sync_captacao_to_calendar
  AFTER INSERT OR UPDATE OR DELETE ON captacoes_agenda
  FOR EACH ROW
  EXECUTE FUNCTION fn_auto_sync_captacao_to_calendar();

-- 4️⃣ VALIDAÇÃO
SELECT '✅ TRIGGERS ATIVADOS!' as status;
SELECT 
  trigger_name, 
  event_object_table, 
  action_timing, 
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name IN ('trg_sync_tarefa_to_calendar', 'trg_sync_captacao_to_calendar');
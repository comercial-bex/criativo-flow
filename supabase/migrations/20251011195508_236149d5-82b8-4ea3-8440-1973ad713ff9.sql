-- PRIORIDADE 4: Sistema de Notificações Automáticas para Conflitos de Agenda

-- Criar função para notificar conflitos de agenda
CREATE OR REPLACE FUNCTION fn_notificar_conflito_agenda()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_conflitos INT;
  v_responsavel_nome TEXT;
  v_grs_id UUID;
  v_projeto_titulo TEXT;
BEGIN
  -- Contar eventos bloqueantes no mesmo dia para o responsável
  SELECT COUNT(*) INTO v_conflitos
  FROM eventos_calendario
  WHERE responsavel_id = NEW.responsavel_id
    AND DATE(data_inicio) = DATE(NEW.data_inicio)
    AND is_bloqueante = true
    AND id != NEW.id; -- Excluir o próprio evento
  
  -- Se há 2 ou mais eventos (conflito), notificar
  IF v_conflitos >= 1 THEN
    -- Buscar nome do responsável
    SELECT nome INTO v_responsavel_nome
    FROM profiles
    WHERE id = NEW.responsavel_id;
    
    -- Buscar GRS do projeto (se houver)
    IF NEW.projeto_id IS NOT NULL THEN
      SELECT p.titulo, pr.responsavel_grs_id 
      INTO v_projeto_titulo, v_grs_id
      FROM projetos pr
      LEFT JOIN projetos p ON p.id = pr.id
      WHERE pr.id = NEW.projeto_id;
    END IF;
    
    -- Notificar o especialista sobre a sobrecarga
    INSERT INTO notificacoes (user_id, titulo, mensagem, tipo, data_evento)
    VALUES (
      NEW.responsavel_id,
      '⚠️ Atenção: Conflito de Agenda',
      'Você tem ' || (v_conflitos + 1) || ' eventos agendados para ' || 
      TO_CHAR(NEW.data_inicio, 'DD/MM/YYYY') || '. Verifique sua agenda para evitar sobrecarga.',
      'warning',
      NOW()
    );
    
    -- Notificar o GRS responsável pelo projeto (se existir)
    IF v_grs_id IS NOT NULL THEN
      INSERT INTO notificacoes (user_id, titulo, mensagem, tipo, data_evento)
      VALUES (
        v_grs_id,
        '⚠️ Sobrecarga Detectada na Equipe',
        COALESCE(v_responsavel_nome, 'Especialista') || ' tem ' || 
        (v_conflitos + 1) || ' eventos agendados para ' || 
        TO_CHAR(NEW.data_inicio, 'DD/MM/YYYY') || 
        CASE WHEN v_projeto_titulo IS NOT NULL 
          THEN ' (Projeto: ' || v_projeto_titulo || ')'
          ELSE '' 
        END,
        'warning',
        NOW()
      );
    END IF;
    
    -- Notificar gestor se sobrecarga crítica (3+ eventos)
    IF v_conflitos >= 2 THEN
      INSERT INTO notificacoes (user_id, titulo, mensagem, tipo, data_evento)
      SELECT 
        ur.user_id,
        '🚨 Sobrecarga Crítica Detectada',
        COALESCE(v_responsavel_nome, 'Especialista') || ' tem ' || 
        (v_conflitos + 1) || ' eventos no mesmo dia (' || 
        TO_CHAR(NEW.data_inicio, 'DD/MM/YYYY') || '). Redistribuição urgente necessária.',
        'error',
        NOW()
      FROM user_roles ur
      WHERE ur.role = 'gestor';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para eventos no calendário
DROP TRIGGER IF EXISTS trg_notificar_conflito ON eventos_calendario;

CREATE TRIGGER trg_notificar_conflito
  AFTER INSERT OR UPDATE ON eventos_calendario
  FOR EACH ROW
  WHEN (NEW.is_bloqueante = true)
  EXECUTE FUNCTION fn_notificar_conflito_agenda();

-- Comentários de documentação
COMMENT ON FUNCTION fn_notificar_conflito_agenda() IS 
'PRIORIDADE 4: Notifica automaticamente sobre conflitos de agenda quando 2+ eventos bloqueantes são agendados para o mesmo dia. Notifica o especialista, GRS do projeto e gestor em casos críticos.';

COMMENT ON TRIGGER trg_notificar_conflito ON eventos_calendario IS
'Dispara notificações automáticas quando eventos bloqueantes conflitantes são detectados na agenda de especialistas.';
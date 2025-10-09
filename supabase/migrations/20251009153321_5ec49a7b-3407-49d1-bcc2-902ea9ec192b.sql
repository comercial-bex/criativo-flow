-- Função principal de criação de eventos com regras automáticas
CREATE OR REPLACE FUNCTION fn_criar_evento_com_regras(
  p_projeto_id UUID,
  p_responsavel_id UUID,
  p_titulo TEXT,
  p_tipo tipo_evento,
  p_data_inicio TIMESTAMPTZ,
  p_data_fim TIMESTAMPTZ,
  p_modo_criativo TEXT DEFAULT NULL,
  p_local TEXT DEFAULT NULL,
  p_is_extra BOOLEAN DEFAULT FALSE,
  p_equipamentos_ids UUID[] DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_evento_id UUID;
  v_conflito JSONB;
  v_config RECORD;
  v_especialidade TEXT;
  v_pausa_id UUID;
  v_buffer_ida_id UUID;
  v_buffer_volta_id UUID;
  v_preparacao_id UUID;
  v_backup_id UUID;
  v_tipo_deslocamento TEXT;
  v_duracao_desl INTEGER;
  v_cliente_id UUID;
BEGIN
  IF NOT p_is_extra THEN
    v_conflito := fn_verificar_conflito_agenda(p_responsavel_id, p_data_inicio, p_data_fim, NULL);
    IF (v_conflito->>'tem_conflito')::BOOLEAN THEN
      RETURN jsonb_build_object(
        'success', FALSE,
        'error', 'Conflito de agenda detectado',
        'conflitos', v_conflito->'conflitos'
      );
    END IF;
  END IF;
  
  SELECT especialidade INTO v_especialidade FROM profiles WHERE id = p_responsavel_id;
  SELECT * INTO v_config FROM calendario_config WHERE especialidade = v_especialidade;
  SELECT cliente_id INTO v_cliente_id FROM projetos WHERE id = p_projeto_id;
  
  INSERT INTO eventos_calendario (
    projeto_id, cliente_id, responsavel_id, titulo, tipo, data_inicio, data_fim,
    is_extra, is_bloqueante, modo_criativo, local, equipamentos_ids, created_by
  ) VALUES (
    p_projeto_id, v_cliente_id, p_responsavel_id, p_titulo, p_tipo, p_data_inicio, p_data_fim,
    p_is_extra, NOT p_is_extra, p_modo_criativo, p_local, p_equipamentos_ids, auth.uid()
  ) RETURNING id INTO v_evento_id;
  
  IF p_tipo IN ('criacao_lote', 'edicao_longa') AND NOT p_is_extra THEN
    INSERT INTO eventos_calendario (
      projeto_id, cliente_id, responsavel_id, titulo, tipo, data_inicio, data_fim,
      is_extra, is_bloqueante, is_automatico, evento_pai_id, created_by
    ) VALUES (
      p_projeto_id, v_cliente_id, p_responsavel_id, 'Pausa Automática', 'pausa_automatica',
      p_data_inicio + INTERVAL '2 hours',
      p_data_inicio + INTERVAL '2 hours' + (v_config.pausa_foco || ' minutes')::INTERVAL,
      FALSE, TRUE, TRUE, v_evento_id, auth.uid()
    ) RETURNING id INTO v_pausa_id;
  END IF;
  
  IF p_tipo IN ('captacao_interna', 'captacao_externa') THEN
    v_tipo_deslocamento := CASE
      WHEN p_local ILIKE '%são paulo%' OR p_local ILIKE '%sp%' THEN 'curto'
      WHEN p_local IS NOT NULL THEN 'medio'
      ELSE 'longo'
    END;
    
    v_duracao_desl := CASE v_tipo_deslocamento
      WHEN 'curto' THEN v_config.deslocamento_curto
      WHEN 'medio' THEN v_config.deslocamento_medio
      ELSE v_config.deslocamento_longo
    END;
    
    INSERT INTO eventos_calendario (
      projeto_id, cliente_id, responsavel_id, titulo, tipo, data_inicio, data_fim,
      is_bloqueante, is_automatico, evento_pai_id, created_by
    ) VALUES (
      p_projeto_id, v_cliente_id, p_responsavel_id, 'Preparação/Checklist', 'preparacao',
      p_data_inicio - (v_config.tempo_preparacao_captacao || ' minutes')::INTERVAL,
      p_data_inicio,
      TRUE, TRUE, v_evento_id, auth.uid()
    ) RETURNING id INTO v_preparacao_id;
    
    IF p_tipo = 'captacao_externa' THEN
      INSERT INTO eventos_calendario (
        projeto_id, cliente_id, responsavel_id, titulo, tipo, data_inicio, data_fim,
        is_bloqueante, is_automatico, evento_pai_id, tipo_deslocamento, created_by
      ) VALUES (
        p_projeto_id, v_cliente_id, p_responsavel_id, 'Deslocamento (Ida)', 'deslocamento',
        p_data_inicio - ((v_config.tempo_preparacao_captacao + v_duracao_desl) || ' minutes')::INTERVAL,
        p_data_inicio - (v_config.tempo_preparacao_captacao || ' minutes')::INTERVAL,
        TRUE, TRUE, v_evento_id, v_tipo_deslocamento, auth.uid()
      ) RETURNING id INTO v_buffer_ida_id;
      
      INSERT INTO eventos_calendario (
        projeto_id, cliente_id, responsavel_id, titulo, tipo, data_inicio, data_fim,
        is_bloqueante, is_automatico, evento_pai_id, tipo_deslocamento, created_by
      ) VALUES (
        p_projeto_id, v_cliente_id, p_responsavel_id, 'Deslocamento (Volta)', 'deslocamento',
        p_data_fim,
        p_data_fim + (v_duracao_desl || ' minutes')::INTERVAL,
        TRUE, TRUE, v_evento_id, v_tipo_deslocamento, auth.uid()
      ) RETURNING id INTO v_buffer_volta_id;
    END IF;
    
    INSERT INTO eventos_calendario (
      projeto_id, cliente_id, responsavel_id, titulo, tipo, data_inicio, data_fim,
      is_bloqueante, is_automatico, evento_pai_id, created_by
    ) VALUES (
      p_projeto_id, v_cliente_id, p_responsavel_id, 'Descarga/Backup', 'backup',
      CASE WHEN p_tipo = 'captacao_externa'
        THEN p_data_fim + (v_duracao_desl || ' minutes')::INTERVAL
        ELSE p_data_fim
      END,
      CASE WHEN p_tipo = 'captacao_externa'
        THEN p_data_fim + ((v_duracao_desl + v_config.tempo_descarga_backup) || ' minutes')::INTERVAL
        ELSE p_data_fim + (v_config.tempo_descarga_backup || ' minutes')::INTERVAL
      END,
      TRUE, TRUE, v_evento_id, auth.uid()
    ) RETURNING id INTO v_backup_id;
  END IF;
  
  IF p_equipamentos_ids IS NOT NULL AND array_length(p_equipamentos_ids, 1) > 0 THEN
    FOR i IN 1..array_length(p_equipamentos_ids, 1) LOOP
      PERFORM fn_criar_reserva_equipamento(
        p_item_id := p_equipamentos_ids[i],
        p_tipo_reserva := p_tipo::TEXT,
        p_inicio := p_data_inicio,
        p_fim := p_data_fim,
        p_tarefa_id := NULL,
        p_projeto_id := p_projeto_id,
        p_quantidade := 1
      );
    END LOOP;
  END IF;
  
  RETURN jsonb_build_object(
    'success', TRUE,
    'evento_id', v_evento_id,
    'pausa_id', v_pausa_id,
    'preparacao_id', v_preparacao_id,
    'buffer_ida_id', v_buffer_ida_id,
    'buffer_volta_id', v_buffer_volta_id,
    'backup_id', v_backup_id
  );
END;
$$;
-- Funções de verificação

CREATE OR REPLACE FUNCTION fn_verificar_conflito_agenda(
  p_responsavel_id UUID,
  p_data_inicio TIMESTAMPTZ,
  p_data_fim TIMESTAMPTZ,
  p_excluir_evento_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conflitos JSONB;
  v_tem_conflito BOOLEAN;
BEGIN
  SELECT
    COUNT(*) > 0,
    COALESCE(jsonb_agg(jsonb_build_object(
      'id', id,
      'titulo', titulo,
      'data_inicio', data_inicio,
      'data_fim', data_fim,
      'tipo', tipo
    )), '[]'::jsonb)
  INTO v_tem_conflito, v_conflitos
  FROM eventos_calendario
  WHERE responsavel_id = p_responsavel_id
    AND is_bloqueante = TRUE
    AND (id IS DISTINCT FROM p_excluir_evento_id)
    AND (
      (data_inicio, data_fim) OVERLAPS (p_data_inicio, p_data_fim)
    );
  
  RETURN jsonb_build_object(
    'tem_conflito', v_tem_conflito,
    'conflitos', v_conflitos
  );
END;
$$;

CREATE OR REPLACE FUNCTION fn_sugerir_slot_disponivel(
  p_responsavel_id UUID,
  p_duracao_minutos INTEGER,
  p_data_preferida DATE,
  p_tipo_evento tipo_evento
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_config RECORD;
  v_especialidade TEXT;
  v_inicio TIMESTAMPTZ;
  v_fim TIMESTAMPTZ;
  v_horarios TIME[] := ARRAY['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  v_h TIME;
  v_conflito JSONB;
BEGIN
  SELECT especialidade INTO v_especialidade
  FROM profiles WHERE id = p_responsavel_id;
  
  SELECT * INTO v_config
  FROM calendario_config
  WHERE especialidade = v_especialidade;
  
  FOREACH v_h IN ARRAY v_horarios LOOP
    v_inicio := (p_data_preferida || ' ' || v_h::TEXT)::TIMESTAMPTZ;
    v_fim := v_inicio + (p_duracao_minutos || ' minutes')::INTERVAL;
    
    IF EXTRACT(DOW FROM p_data_preferida) BETWEEN 1 AND 5 THEN
      IF (v_h >= v_config.seg_sex_manha_inicio AND v_fim::TIME <= v_config.seg_sex_manha_fim)
         OR (v_h >= v_config.seg_sex_tarde_inicio AND v_fim::TIME <= v_config.seg_sex_tarde_fim) THEN
        
        v_conflito := fn_verificar_conflito_agenda(p_responsavel_id, v_inicio, v_fim, NULL);
        
        IF NOT (v_conflito->>'tem_conflito')::BOOLEAN THEN
          RETURN jsonb_build_object(
            'disponivel', TRUE,
            'slot_inicio', v_inicio,
            'slot_fim', v_fim,
            'turno', CASE WHEN v_h < '12:00' THEN 'manhã' ELSE 'tarde' END
          );
        END IF;
      END IF;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object('disponivel', FALSE);
END;
$$;
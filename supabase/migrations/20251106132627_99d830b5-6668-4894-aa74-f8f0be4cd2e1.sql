-- Corrigir search_path da função registrar_mudanca_meta
CREATE OR REPLACE FUNCTION registrar_mudanca_meta()
RETURNS TRIGGER AS $$
BEGIN
  -- Só registra se houve mudança significativa (>1%)
  IF (OLD.valor_atual IS DISTINCT FROM NEW.valor_atual) 
     OR (ABS(OLD.progresso_percent - NEW.progresso_percent) > 1) THEN
    INSERT INTO cliente_metas_historico (meta_id, valor_registrado, progresso_percent)
    VALUES (NEW.id, NEW.valor_atual, NEW.progresso_percent);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
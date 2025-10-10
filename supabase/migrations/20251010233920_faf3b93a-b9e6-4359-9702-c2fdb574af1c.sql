-- Corrigir Security Warning: Function Search Path Mutable
-- Adicionar SET search_path = public às funções trigger

-- 1. Corrigir trg_calcular_ponto_auto
CREATE OR REPLACE FUNCTION public.trg_calcular_ponto_auto()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN 
  PERFORM fn_calcular_ponto(NEW.id); 
  RETURN NEW; 
END; 
$$;

-- 2. Corrigir trg_atualizar_status_unidade
CREATE OR REPLACE FUNCTION public.trg_atualizar_status_unidade()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status_mov = 'em_uso' AND NEW.unidade_id IS NOT NULL THEN
    UPDATE inventario_unidades SET status_unidade = 'em_uso' WHERE id = NEW.unidade_id;
  ELSIF NEW.status_mov = 'concluida' AND NEW.unidade_id IS NOT NULL THEN
    UPDATE inventario_unidades SET status_unidade = 'disponivel' WHERE id = NEW.unidade_id;
  END IF;
  RETURN NEW;
END;
$$;
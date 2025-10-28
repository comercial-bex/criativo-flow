-- Verificar e remover TODAS as constraints UNIQUE de data
DO $$ 
BEGIN
  -- Remover constraint antiga se existir
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'feriados_nacionais_data_key') THEN
    ALTER TABLE feriados_nacionais DROP CONSTRAINT feriados_nacionais_data_key;
  END IF;
  
  -- Remover constraint nova se existir
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'feriados_nacionais_unique_key') THEN
    ALTER TABLE feriados_nacionais DROP CONSTRAINT feriados_nacionais_unique_key;
  END IF;
END $$;

-- Criar constraint composta correta
ALTER TABLE feriados_nacionais 
ADD CONSTRAINT feriados_nacionais_unique_key 
UNIQUE (data, tipo, estado, cidade);
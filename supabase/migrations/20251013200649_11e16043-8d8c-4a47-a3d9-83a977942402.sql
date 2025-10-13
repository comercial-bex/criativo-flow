-- FASE 3: Normalizar CPFs já cadastrados
-- Remove formatação de CPFs existentes (123.456.789-00 → 12345678900)

UPDATE pessoas
SET cpf = regexp_replace(cpf, '[^0-9]', '', 'g')
WHERE cpf IS NOT NULL
  AND cpf ~ '[^0-9]'; -- Apenas CPFs com formatação
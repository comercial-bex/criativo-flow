-- ============================================
-- FASE 1: Adicionar pessoa_id nas tabelas RH
-- ============================================

-- 1. financeiro_folha_itens
ALTER TABLE financeiro_folha_itens 
ADD COLUMN IF NOT EXISTS pessoa_id UUID;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_folha_itens_pessoa'
  ) THEN
    ALTER TABLE financeiro_folha_itens 
    ADD CONSTRAINT fk_folha_itens_pessoa 
    FOREIGN KEY (pessoa_id) REFERENCES pessoas(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_folha_itens_pessoa 
ON financeiro_folha_itens(pessoa_id);

-- Migrar dados: buscar pessoa pelo CPF do colaborador
UPDATE financeiro_folha_itens fi
SET pessoa_id = (
  SELECT p.id 
  FROM pessoas p
  INNER JOIN rh_colaboradores c ON p.cpf = c.cpf_cnpj
  WHERE c.id = fi.colaborador_id
  LIMIT 1
)
WHERE fi.colaborador_id IS NOT NULL 
  AND fi.pessoa_id IS NULL;

-- 2. financeiro_historico_salarial
ALTER TABLE financeiro_historico_salarial 
ADD COLUMN IF NOT EXISTS pessoa_id UUID;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_historico_pessoa'
  ) THEN
    ALTER TABLE financeiro_historico_salarial 
    ADD CONSTRAINT fk_historico_pessoa 
    FOREIGN KEY (pessoa_id) REFERENCES pessoas(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_historico_pessoa 
ON financeiro_historico_salarial(pessoa_id);

-- Migrar dados
UPDATE financeiro_historico_salarial hs
SET pessoa_id = (
  SELECT p.id 
  FROM pessoas p
  INNER JOIN rh_colaboradores c ON p.cpf = c.cpf_cnpj
  WHERE c.id = hs.colaborador_id
  LIMIT 1
)
WHERE hs.colaborador_id IS NOT NULL 
  AND hs.pessoa_id IS NULL;

-- 3. financeiro_adiantamentos
ALTER TABLE financeiro_adiantamentos 
ADD COLUMN IF NOT EXISTS pessoa_id UUID;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_adiantamento_pessoa'
  ) THEN
    ALTER TABLE financeiro_adiantamentos 
    ADD CONSTRAINT fk_adiantamento_pessoa 
    FOREIGN KEY (pessoa_id) REFERENCES pessoas(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_adiantamento_pessoa 
ON financeiro_adiantamentos(pessoa_id);

-- Migrar dados
UPDATE financeiro_adiantamentos a
SET pessoa_id = (
  SELECT p.id 
  FROM pessoas p
  INNER JOIN rh_colaboradores c ON p.cpf = c.cpf_cnpj
  WHERE c.id = a.colaborador_id
  LIMIT 1
)
WHERE a.colaborador_id IS NOT NULL 
  AND a.pessoa_id IS NULL;

-- 4. rh_folha_ponto
ALTER TABLE rh_folha_ponto 
ADD COLUMN IF NOT EXISTS pessoa_id UUID;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_ponto_pessoa'
  ) THEN
    ALTER TABLE rh_folha_ponto 
    ADD CONSTRAINT fk_ponto_pessoa 
    FOREIGN KEY (pessoa_id) REFERENCES pessoas(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ponto_pessoa 
ON rh_folha_ponto(pessoa_id);

-- Migrar dados
UPDATE rh_folha_ponto fp
SET pessoa_id = (
  SELECT p.id 
  FROM pessoas p
  INNER JOIN rh_colaboradores c ON p.cpf = c.cpf_cnpj
  WHERE c.id = fp.colaborador_id
  LIMIT 1
)
WHERE fp.colaborador_id IS NOT NULL 
  AND fp.pessoa_id IS NULL;

-- 5. rh_ocorrencias_ponto (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rh_ocorrencias_ponto') THEN
    ALTER TABLE rh_ocorrencias_ponto 
    ADD COLUMN IF NOT EXISTS pessoa_id UUID;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'fk_ocorrencia_pessoa'
    ) THEN
      ALTER TABLE rh_ocorrencias_ponto 
      ADD CONSTRAINT fk_ocorrencia_pessoa 
      FOREIGN KEY (pessoa_id) REFERENCES pessoas(id) ON DELETE CASCADE;
    END IF;

    CREATE INDEX IF NOT EXISTS idx_ocorrencia_pessoa 
    ON rh_ocorrencias_ponto(pessoa_id);

    -- Migrar dados
    UPDATE rh_ocorrencias_ponto op
    SET pessoa_id = (
      SELECT p.id 
      FROM pessoas p
      INNER JOIN rh_colaboradores c ON p.cpf = c.cpf_cnpj
      WHERE c.id = op.colaborador_id
      LIMIT 1
    )
    WHERE op.colaborador_id IS NOT NULL 
      AND op.pessoa_id IS NULL;
  END IF;
END $$;

-- Log de migração
DO $$
DECLARE
  v_folha_migrados INTEGER;
  v_historico_migrados INTEGER;
  v_adiant_migrados INTEGER;
  v_ponto_migrados INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_folha_migrados FROM financeiro_folha_itens WHERE pessoa_id IS NOT NULL;
  SELECT COUNT(*) INTO v_historico_migrados FROM financeiro_historico_salarial WHERE pessoa_id IS NOT NULL;
  SELECT COUNT(*) INTO v_adiant_migrados FROM financeiro_adiantamentos WHERE pessoa_id IS NOT NULL;
  SELECT COUNT(*) INTO v_ponto_migrados FROM rh_folha_ponto WHERE pessoa_id IS NOT NULL;

  RAISE NOTICE '✅ Migração Fase 1 concluída:';
  RAISE NOTICE '   - Folha itens: % registros migrados', v_folha_migrados;
  RAISE NOTICE '   - Histórico salarial: % registros migrados', v_historico_migrados;
  RAISE NOTICE '   - Adiantamentos: % registros migrados', v_adiant_migrados;
  RAISE NOTICE '   - Folha ponto: % registros migrados', v_ponto_migrados;
END $$;
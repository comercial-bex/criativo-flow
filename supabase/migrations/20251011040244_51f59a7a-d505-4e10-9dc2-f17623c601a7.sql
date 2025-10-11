-- 1. Verificar se o tipo status_colaborador existe e adicionar valores
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_colaborador') THEN
    CREATE TYPE status_colaborador AS ENUM ('ativo', 'inativo', 'ferias', 'afastado', 'desligado');
  ELSE
    -- Adicionar valores se o tipo já existir (se não existirem)
    BEGIN
      ALTER TYPE status_colaborador ADD VALUE IF NOT EXISTS 'ferias';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER TYPE status_colaborador ADD VALUE IF NOT EXISTS 'inativo';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- 2. Adicionar campo status à tabela ocorrencias_ponto
ALTER TABLE ocorrencias_ponto 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente';

-- 3. Criar constraint para status (sem usar CHECK, usando trigger)
CREATE OR REPLACE FUNCTION validar_status_ocorrencia()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('pendente', 'aprovado', 'rejeitado') THEN
    RAISE EXCEPTION 'Status inválido. Use: pendente, aprovado ou rejeitado';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_status_ocorrencia ON ocorrencias_ponto;
CREATE TRIGGER trg_validar_status_ocorrencia
  BEFORE INSERT OR UPDATE ON ocorrencias_ponto
  FOR EACH ROW
  EXECUTE FUNCTION validar_status_ocorrencia();

-- 4. Criar índices de performance
CREATE INDEX IF NOT EXISTS idx_ocorrencias_status ON ocorrencias_ponto(status);
CREATE INDEX IF NOT EXISTS idx_pessoas_status ON pessoas(status);
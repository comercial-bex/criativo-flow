-- ============================================
-- FASE 4: RETROCOMPATIBILIDADE E SINCRONIZAÇÃO
-- ============================================

-- 1. Adicionar coluna pessoa_id em financeiro_adiantamentos
ALTER TABLE financeiro_adiantamentos 
ADD COLUMN IF NOT EXISTS pessoa_id UUID REFERENCES pessoas(id);

-- 2. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_adiantamentos_pessoa ON financeiro_adiantamentos(pessoa_id);

-- 3. Trigger de sincronização: garantir que pessoa_id seja preenchido
CREATE OR REPLACE FUNCTION sync_adiantamento_pessoa()
RETURNS TRIGGER AS $$
BEGIN
  -- Se pessoa_id não foi fornecido, usar colaborador_id
  IF NEW.pessoa_id IS NULL AND NEW.colaborador_id IS NOT NULL THEN
    NEW.pessoa_id := NEW.colaborador_id;
  END IF;
  
  -- Se colaborador_id não foi fornecido, usar pessoa_id
  IF NEW.colaborador_id IS NULL AND NEW.pessoa_id IS NOT NULL THEN
    NEW.colaborador_id := NEW.pessoa_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_sync_adiantamento
BEFORE INSERT OR UPDATE ON financeiro_adiantamentos
FOR EACH ROW EXECUTE FUNCTION sync_adiantamento_pessoa();

-- 4. View de retrocompatibilidade: rh_colaboradores
CREATE OR REPLACE VIEW rh_colaboradores_view AS
SELECT 
  id,
  nome as nome_completo,
  cpf as cpf_cnpj,
  email,
  telefones[1] as telefone,
  (dados_bancarios->>'banco_codigo') as banco_codigo,
  (dados_bancarios->>'banco_nome') as banco_nome,
  (dados_bancarios->>'agencia') as agencia,
  (dados_bancarios->>'conta') as conta,
  (dados_bancarios->>'tipo_conta') as tipo_conta,
  (dados_bancarios->>'pix_tipo') as pix_tipo,
  (dados_bancarios->>'pix_chave') as pix_chave,
  cargo_id,
  regime,
  data_admissao,
  data_desligamento,
  status,
  salario_base,
  fee_mensal,
  observacoes,
  created_at,
  updated_at
FROM pessoas
WHERE 'colaborador' = ANY(papeis);

-- 5. View de retrocompatibilidade: especialistas (profiles com especialidade)
CREATE OR REPLACE VIEW especialistas_view AS
SELECT 
  id,
  nome,
  email,
  telefones[1] as telefone,
  'designer' as especialidade, -- Determinar pela presença no array papeis
  status,
  created_at,
  updated_at
FROM pessoas
WHERE 'especialista' = ANY(papeis);

-- 6. RLS Policies para views
ALTER VIEW rh_colaboradores_view SET (security_invoker = true);
ALTER VIEW especialistas_view SET (security_invoker = true);

-- 7. Comentários de deprecação
COMMENT ON TABLE rh_colaboradores IS 'DEPRECATED: Use tabela pessoas com papeis = [''colaborador'']';
COMMENT ON COLUMN financeiro_adiantamentos.colaborador_id IS 'DEPRECATED: Use pessoa_id';

-- 8. Migrar dados existentes (se houver)
UPDATE financeiro_adiantamentos 
SET pessoa_id = colaborador_id 
WHERE pessoa_id IS NULL AND colaborador_id IS NOT NULL;
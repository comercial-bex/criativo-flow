-- ============================================================================
-- FASE 2: Classificação Financeira
-- ============================================================================

-- Adicionar campo tipo_lancamento
ALTER TABLE financeiro_lancamentos 
ADD COLUMN IF NOT EXISTS tipo_lancamento text 
CHECK (tipo_lancamento IN ('receita', 'despesa', 'transferencia'));

-- Criar índice para otimizar queries
CREATE INDEX IF NOT EXISTS idx_financeiro_tipo 
ON financeiro_lancamentos(tipo_lancamento);

-- Atualizar registros existentes baseado em conta_debito/credito
UPDATE financeiro_lancamentos 
SET tipo_lancamento = CASE
  WHEN conta_credito_id IN (
    SELECT id FROM financeiro_plano_contas WHERE codigo LIKE '3.%'
  ) THEN 'receita'
  WHEN conta_debito_id IN (
    SELECT id FROM financeiro_plano_contas WHERE codigo LIKE '4.%' OR codigo LIKE '5.%'
  ) THEN 'despesa'
  ELSE 'transferencia'
END
WHERE tipo_lancamento IS NULL;

-- Adicionar comentário
COMMENT ON COLUMN financeiro_lancamentos.tipo_lancamento IS 
'Tipo do lançamento: receita, despesa ou transferência';

-- View de Receitas vs Despesas
CREATE OR REPLACE VIEW vw_financeiro_resumo AS
SELECT 
  DATE_TRUNC('month', data_lancamento) as mes,
  tipo_lancamento,
  SUM(valor) as total,
  COUNT(*) as quantidade
FROM financeiro_lancamentos
WHERE tipo_lancamento IN ('receita', 'despesa')
GROUP BY DATE_TRUNC('month', data_lancamento), tipo_lancamento
ORDER BY mes DESC;

-- View de DRE Simplificado
CREATE OR REPLACE VIEW vw_dre_mensal AS
SELECT 
  DATE_TRUNC('month', data_lancamento) as mes,
  SUM(CASE WHEN tipo_lancamento = 'receita' THEN valor ELSE 0 END) as receitas,
  SUM(CASE WHEN tipo_lancamento = 'despesa' THEN valor ELSE 0 END) as despesas,
  SUM(CASE WHEN tipo_lancamento = 'receita' THEN valor ELSE -valor END) as lucro_liquido
FROM financeiro_lancamentos
GROUP BY DATE_TRUNC('month', data_lancamento)
ORDER BY mes DESC;

COMMENT ON VIEW vw_financeiro_resumo IS 'Resumo mensal de receitas e despesas';
COMMENT ON VIEW vw_dre_mensal IS 'DRE (Demonstração do Resultado do Exercício) mensal simplificado';
-- Recuperar colaboradores de admin_temp_data
INSERT INTO pessoas (
  nome, regime, cargo_atual, salario_base, fee_mensal, 
  papeis, status, created_at
)
SELECT DISTINCT
  produto_nome,
  regime::text,
  cargo_atual,
  CASE WHEN regime = 'clt' THEN salario_ou_fee END,
  CASE WHEN regime = 'pj' THEN salario_ou_fee END,
  ARRAY['colaborador']::text[],
  'ativo'::text,
  created_at
FROM admin_temp_data
WHERE (regime IS NOT NULL OR cargo_atual IS NOT NULL)
  AND produto_nome IS NOT NULL
  AND produto_nome NOT IN (SELECT nome FROM pessoas WHERE 'colaborador' = ANY(papeis))
ON CONFLICT DO NOTHING;

-- Adicionar coluna para marcar dados incompletos
ALTER TABLE pessoas 
ADD COLUMN IF NOT EXISTS dados_incompletos boolean DEFAULT false;

-- Marcar colaboradores com dados essenciais faltantes
UPDATE pessoas
SET dados_incompletos = true
WHERE 'colaborador' = ANY(papeis)
  AND (
    nome IS NULL OR 
    cpf IS NULL OR 
    regime IS NULL OR
    (regime = 'clt' AND salario_base IS NULL) OR
    (regime = 'pj' AND fee_mensal IS NULL)
  );
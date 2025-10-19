-- =====================================================
-- SPRINT 7: DRE, CENTROS DE CUSTO, INADIMPLÊNCIA E CUSTOS POR PROJETO
-- =====================================================

-- ========================================
-- 1. TABELA: centros_custo
-- ========================================
CREATE TABLE IF NOT EXISTS public.centros_custo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT CHECK (tipo IN ('operacional', 'administrativo', 'comercial', 'projetos')) DEFAULT 'operacional',
  responsavel_id UUID,
  orcamento_mensal NUMERIC(15,2),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.centros_custo IS 'Centros de custo para alocação de despesas';

-- RLS para centros_custo
ALTER TABLE public.centros_custo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin e Financeiro podem gerenciar centros de custo"
  ON public.centros_custo FOR ALL
  USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'financeiro');

CREATE POLICY "Usuários autenticados podem ver centros de custo"
  ON public.centros_custo FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Trigger para updated_at
CREATE TRIGGER update_centros_custo_updated_at
  BEFORE UPDATE ON public.centros_custo
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tarefa_updated_at();

-- ========================================
-- 2. VIEW MATERIALIZADA: vw_dre (Demonstração do Resultado do Exercício)
-- ========================================
CREATE MATERIALIZED VIEW IF NOT EXISTS public.vw_dre AS
WITH receitas AS (
  SELECT 
    DATE_TRUNC('month', l.data_lancamento) AS mes,
    pc.codigo AS conta_codigo,
    pc.nome AS conta_nome,
    SUM(l.valor) AS valor_total
  FROM public.financeiro_lancamentos l
  JOIN public.financeiro_plano_contas pc ON l.conta_credito_id = pc.id
  WHERE pc.tipo = 'receita'
  GROUP BY DATE_TRUNC('month', l.data_lancamento), pc.codigo, pc.nome
),
despesas AS (
  SELECT 
    DATE_TRUNC('month', l.data_lancamento) AS mes,
    pc.codigo AS conta_codigo,
    pc.nome AS conta_nome,
    SUM(l.valor) AS valor_total
  FROM public.financeiro_lancamentos l
  JOIN public.financeiro_plano_contas pc ON l.conta_debito_id = pc.id
  WHERE pc.tipo = 'despesa'
  GROUP BY DATE_TRUNC('month', l.data_lancamento), pc.codigo, pc.nome
)
SELECT 
  mes,
  'receita' AS tipo,
  conta_codigo,
  conta_nome,
  valor_total
FROM receitas
UNION ALL
SELECT 
  mes,
  'despesa' AS tipo,
  conta_codigo,
  conta_nome,
  valor_total
FROM despesas
ORDER BY mes DESC, tipo, conta_codigo;

CREATE UNIQUE INDEX IF NOT EXISTS idx_vw_dre_unique ON public.vw_dre(mes, tipo, conta_codigo);

COMMENT ON MATERIALIZED VIEW public.vw_dre IS 'DRE agregado por mês e categoria contábil';

-- ========================================
-- 3. VIEW MATERIALIZADA: vw_inadimplencia
-- ========================================
CREATE MATERIALIZED VIEW IF NOT EXISTS public.vw_inadimplencia AS
SELECT 
  t.id AS titulo_id,
  t.numero_documento,
  t.tipo,
  t.descricao,
  t.valor_liquido,
  t.valor_pago,
  (t.valor_liquido - COALESCE(t.valor_pago, 0)) AS valor_em_aberto,
  t.data_vencimento,
  t.dias_atraso,
  t.status,
  CASE 
    WHEN t.cliente_id IS NOT NULL THEN c.nome
    WHEN t.fornecedor_id IS NOT NULL THEN f.nome_fantasia
    ELSE 'Não identificado'
  END AS devedor_credor,
  t.cliente_id,
  t.fornecedor_id,
  cc.nome AS centro_custo,
  t.updated_at
FROM public.titulos_financeiros t
LEFT JOIN public.clientes c ON t.cliente_id = c.id
LEFT JOIN public.fornecedores f ON t.fornecedor_id = f.id
LEFT JOIN public.centros_custo cc ON t.centro_custo_id = cc.id
WHERE t.status IN ('pendente', 'vencido')
  AND t.data_vencimento < CURRENT_DATE
  AND (t.valor_liquido - COALESCE(t.valor_pago, 0)) > 0
ORDER BY t.dias_atraso DESC, t.data_vencimento ASC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_vw_inadimplencia_unique ON public.vw_inadimplencia(titulo_id);

COMMENT ON MATERIALIZED VIEW public.vw_inadimplencia IS 'Títulos vencidos e em aberto (inadimplência)';

-- ========================================
-- 4. VIEW MATERIALIZADA: vw_custos_projeto
-- ========================================
CREATE MATERIALIZED VIEW IF NOT EXISTS public.vw_custos_projeto AS
WITH custos_lancamentos AS (
  SELECT 
    p.id AS projeto_id,
    p.titulo AS projeto_nome,
    p.cliente_id,
    c.nome AS cliente_nome,
    SUM(CASE WHEN pc.tipo = 'despesa' THEN l.valor ELSE 0 END) AS total_despesas,
    SUM(CASE WHEN pc.tipo = 'receita' THEN l.valor ELSE 0 END) AS total_receitas
  FROM public.projetos p
  LEFT JOIN public.clientes c ON p.cliente_id = c.id
  LEFT JOIN public.financeiro_lancamentos l ON l.origem_id::TEXT LIKE '%' || p.id::TEXT || '%'
  LEFT JOIN public.financeiro_plano_contas pc ON (l.conta_debito_id = pc.id OR l.conta_credito_id = pc.id)
  GROUP BY p.id, p.titulo, p.cliente_id, c.nome
),
custos_titulos AS (
  SELECT 
    p.id AS projeto_id,
    SUM(CASE WHEN t.tipo = 'pagar' THEN t.valor_liquido ELSE 0 END) AS total_titulos_despesa,
    SUM(CASE WHEN t.tipo = 'receber' THEN t.valor_liquido ELSE 0 END) AS total_titulos_receita
  FROM public.projetos p
  LEFT JOIN public.titulos_financeiros t ON t.projeto_id = p.id
  GROUP BY p.id
)
SELECT 
  cl.projeto_id,
  cl.projeto_nome,
  cl.cliente_id,
  cl.cliente_nome,
  COALESCE(cl.total_despesas, 0) + COALESCE(ct.total_titulos_despesa, 0) AS custo_total,
  COALESCE(cl.total_receitas, 0) + COALESCE(ct.total_titulos_receita, 0) AS receita_total,
  (COALESCE(cl.total_receitas, 0) + COALESCE(ct.total_titulos_receita, 0)) - 
  (COALESCE(cl.total_despesas, 0) + COALESCE(ct.total_titulos_despesa, 0)) AS lucro_liquido,
  CASE 
    WHEN (COALESCE(cl.total_receitas, 0) + COALESCE(ct.total_titulos_receita, 0)) > 0
    THEN ROUND(
      ((COALESCE(cl.total_receitas, 0) + COALESCE(ct.total_titulos_receita, 0)) - 
       (COALESCE(cl.total_despesas, 0) + COALESCE(ct.total_titulos_despesa, 0))) / 
      NULLIF((COALESCE(cl.total_receitas, 0) + COALESCE(ct.total_titulos_receita, 0)), 0) * 100, 2
    )
    ELSE 0
  END AS margem_lucro_percent
FROM custos_lancamentos cl
LEFT JOIN custos_titulos ct ON cl.projeto_id = ct.projeto_id
ORDER BY custo_total DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_vw_custos_projeto_unique ON public.vw_custos_projeto(projeto_id);

COMMENT ON MATERIALIZED VIEW public.vw_custos_projeto IS 'Custos agregados por projeto';

-- ========================================
-- 5. FUNÇÃO: Refresh automático das views materializadas
-- ========================================
CREATE OR REPLACE FUNCTION public.refresh_relatorios_financeiros()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.vw_dre;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.vw_inadimplencia;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.vw_custos_projeto;
END;
$$;

COMMENT ON FUNCTION public.refresh_relatorios_financeiros IS 'Atualiza todas as views materializadas de relatórios financeiros';

-- ========================================
-- 6. RLS para Views Materializadas
-- ========================================
ALTER MATERIALIZED VIEW public.vw_dre OWNER TO postgres;
ALTER MATERIALIZED VIEW public.vw_inadimplencia OWNER TO postgres;
ALTER MATERIALIZED VIEW public.vw_custos_projeto OWNER TO postgres;

GRANT SELECT ON public.vw_dre TO authenticated;
GRANT SELECT ON public.vw_inadimplencia TO authenticated;
GRANT SELECT ON public.vw_custos_projeto TO authenticated;

-- ========================================
-- 7. INSERIR CENTROS DE CUSTO PADRÃO
-- ========================================
INSERT INTO public.centros_custo (codigo, nome, descricao, tipo, ativo) VALUES
  ('CC-001', 'Operações', 'Centro de custo operacional', 'operacional', true),
  ('CC-002', 'Administrativo', 'Despesas administrativas', 'administrativo', true),
  ('CC-003', 'Comercial', 'Despesas comerciais e marketing', 'comercial', true),
  ('CC-004', 'Projetos', 'Custos diretos de projetos', 'projetos', true)
ON CONFLICT (codigo) DO NOTHING;
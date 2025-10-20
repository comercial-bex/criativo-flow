-- Criar funções wrapper para acessar views do schema internal

-- ========================================
-- Função para acessar mv_dashboard_financeiro
-- ========================================
CREATE OR REPLACE FUNCTION public.get_dashboard_financeiro_data()
RETURNS SETOF internal.mv_dashboard_financeiro
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, internal
AS $$
  SELECT * FROM internal.mv_dashboard_financeiro
  ORDER BY mes DESC;
$$;

-- ========================================
-- Função para acessar vw_fluxo_por_categoria
-- ========================================
CREATE OR REPLACE FUNCTION public.get_fluxo_por_categoria_data()
RETURNS SETOF internal.vw_fluxo_por_categoria
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, internal
AS $$
  SELECT * FROM internal.vw_fluxo_por_categoria
  ORDER BY valor_total DESC;
$$;

-- ========================================
-- Comentários de documentação
-- ========================================
COMMENT ON FUNCTION public.get_dashboard_financeiro_data() 
IS 'Wrapper seguro para acessar internal.mv_dashboard_financeiro via RPC';

COMMENT ON FUNCTION public.get_fluxo_por_categoria_data() 
IS 'Wrapper seguro para acessar internal.vw_fluxo_por_categoria via RPC';
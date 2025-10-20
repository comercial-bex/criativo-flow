-- Mover Materialized Views Restantes para Schema Internal

-- ========================================
-- Mover mv_dashboard_financeiro
-- ========================================
ALTER MATERIALIZED VIEW public.mv_dashboard_financeiro SET SCHEMA internal;

-- ========================================
-- Mover vw_fluxo_por_categoria  
-- ========================================
ALTER MATERIALIZED VIEW public.vw_fluxo_por_categoria SET SCHEMA internal;

-- ========================================
-- Atualizar função de refresh para usar schema correto
-- ========================================
CREATE OR REPLACE FUNCTION public.refresh_dashboard_financeiro()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, internal
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY internal.mv_dashboard_financeiro;
END;
$$;

-- ========================================
-- Comentários de segurança
-- ========================================
COMMENT ON MATERIALIZED VIEW internal.mv_dashboard_financeiro 
IS 'SECURITY: Materialized view movida para schema internal - não exposta na API pública';

COMMENT ON MATERIALIZED VIEW internal.vw_fluxo_por_categoria 
IS 'SECURITY: Materialized view movida para schema internal - não exposta na API pública';
-- ==========================================
-- FASE 1: OTIMIZAÇÃO DE PERFORMANCE DO BANCO
-- ==========================================

-- 1. Habilitar extensão pg_trgm para buscas rápidas de texto
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. ÍNDICES CRÍTICOS PARA TABELA CLIENTES
CREATE INDEX IF NOT EXISTS idx_clientes_status 
ON public.clientes(status) 
WHERE status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clientes_nome_trgm 
ON public.clientes USING gin(nome gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_clientes_email_lower 
ON public.clientes(lower(email)) 
WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clientes_responsavel 
ON public.clientes(responsavel_id) 
WHERE responsavel_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clientes_created_at 
ON public.clientes(created_at DESC);

-- 3. ÍNDICES CRÍTICOS PARA TABELA PROJETOS
CREATE INDEX IF NOT EXISTS idx_projetos_cliente_status 
ON public.projetos(cliente_id, status) 
WHERE cliente_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_projetos_created_at 
ON public.projetos(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_projetos_status 
ON public.projetos(status) 
WHERE status IS NOT NULL;

-- 4. ÍNDICES CRÍTICOS PARA TABELA PLANEJAMENTOS
CREATE INDEX IF NOT EXISTS idx_planejamentos_cliente_status 
ON public.planejamentos(cliente_id, status) 
WHERE cliente_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_planejamentos_created_at 
ON public.planejamentos(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_planejamentos_mes_referencia 
ON public.planejamentos(mes_referencia) 
WHERE mes_referencia IS NOT NULL;

-- 5. CRIAR VIEW MATERIALIZADA PARA DASHBOARD GRS
-- Pré-calcula métricas agregadas de forma genérica
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_grs_dashboard_metrics AS
SELECT 
  c.id as cliente_id,
  c.nome as cliente_nome,
  c.email as cliente_email,
  c.status::text as cliente_status,
  c.responsavel_id,
  c.created_at as cliente_created_at,
  
  -- Contadores simples de projetos
  COUNT(DISTINCT p.id) FILTER (WHERE p.id IS NOT NULL) as total_projetos,
  COUNT(DISTINCT p.id) FILTER (WHERE p.updated_at > NOW() - INTERVAL '30 days') as projetos_recentes,
  
  -- Contadores de planejamentos
  COUNT(DISTINCT pl.id) FILTER (WHERE pl.id IS NOT NULL) as total_planejamentos,
  
  -- Última atualização
  GREATEST(
    COALESCE(MAX(p.updated_at), c.updated_at),
    COALESCE(MAX(pl.updated_at), c.updated_at),
    c.updated_at
  ) as ultima_atualizacao

FROM public.clientes c
LEFT JOIN public.projetos p ON p.cliente_id = c.id
LEFT JOIN public.planejamentos pl ON pl.cliente_id = c.id
WHERE c.status::text = 'ativo'
GROUP BY c.id, c.nome, c.email, c.status, c.responsavel_id, c.created_at, c.updated_at;

-- Índice único para refresh concorrente
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_grs_dashboard_cliente 
ON mv_grs_dashboard_metrics(cliente_id);

-- Índice para ordenação
CREATE INDEX IF NOT EXISTS idx_mv_grs_dashboard_created 
ON mv_grs_dashboard_metrics(cliente_created_at DESC);

-- 6. FUNÇÃO PARA ATUALIZAÇÃO DA VIEW MATERIALIZADA
CREATE OR REPLACE FUNCTION public.refresh_grs_dashboard_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_grs_dashboard_metrics;
END;
$$;

-- 7. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON MATERIALIZED VIEW mv_grs_dashboard_metrics IS 
'View materializada com métricas pré-calculadas do dashboard GRS. 
Atualizar periodicamente com: SELECT refresh_grs_dashboard_metrics();';

COMMENT ON FUNCTION refresh_grs_dashboard_metrics() IS 
'Atualiza a view materializada de métricas do dashboard GRS de forma concorrente (sem bloquear leituras).';
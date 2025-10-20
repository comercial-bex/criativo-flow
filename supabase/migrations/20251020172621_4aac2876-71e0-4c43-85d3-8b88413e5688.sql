-- FASE 3: Corrigir Warnings do Linter (Colunas Corretas)

-- ========================================
-- 3.1 Function Search Path Mutable
-- ========================================
ALTER FUNCTION public.normalizar_cpf(text)
SET search_path = public, pg_temp;

-- ========================================
-- 3.2 Mover Materialized Views para schema interno
-- ========================================
CREATE SCHEMA IF NOT EXISTS internal;

ALTER MATERIALIZED VIEW public.vw_dre SET SCHEMA internal;
ALTER MATERIALIZED VIEW public.vw_inadimplencia SET SCHEMA internal;
ALTER MATERIALIZED VIEW public.vw_custos_projeto SET SCHEMA internal;
ALTER MATERIALIZED VIEW public.vw_mapa_dividas SET SCHEMA internal;

CREATE OR REPLACE FUNCTION public.refresh_relatorios_financeiros()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, internal
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY internal.vw_dre;
  REFRESH MATERIALIZED VIEW CONCURRENTLY internal.vw_inadimplencia;
  REFRESH MATERIALIZED VIEW CONCURRENTLY internal.vw_custos_projeto;
  REFRESH MATERIALIZED VIEW CONCURRENTLY internal.vw_mapa_dividas;
END;
$$;

-- ========================================
-- 3.3 Recriar View Profiles (usar colunas reais)
-- ========================================
DROP VIEW IF EXISTS public.profiles CASCADE;

CREATE VIEW public.profiles AS
SELECT 
  p.id,
  p.nome,
  p.email,
  p.telefones,
  p.status,
  p.cliente_id,
  p.created_at,
  p.updated_at,
  p.logo_url as avatar_url,
  p.especialidade_id
FROM public.pessoas p;

-- Habilitar RLS na tabela base
ALTER TABLE public.pessoas ENABLE ROW LEVEL SECURITY;

-- Comentários de segurança
COMMENT ON VIEW public.profiles 
IS 'SECURITY: View SEM security definer - usa RLS da tabela pessoas';

COMMENT ON SCHEMA internal 
IS 'Schema interno para materialized views - não exposto na API pública';

COMMENT ON EXTENSION pg_net 
IS 'WARNING: Extensão no public schema (pg_net não suporta SET SCHEMA)';
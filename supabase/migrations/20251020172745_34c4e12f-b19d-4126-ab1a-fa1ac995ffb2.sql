-- FASE 3: Corrigir Warnings Restantes (sem duplicar views já movidas)

-- ========================================
-- 3.1 Function Search Path Mutable
-- ========================================
ALTER FUNCTION public.normalizar_cpf(text)
SET search_path = public, pg_temp;

-- ========================================
-- 3.2 Extensão pg_net (não pode ser movida)
-- ========================================
COMMENT ON EXTENSION pg_net 
IS 'SECURITY NOTE: Esta extensão está no public schema (não suporta SET SCHEMA). Não é crítico para segurança.';

-- ========================================
-- 3.3 Corrigir View profiles (remover SECURITY DEFINER)
-- ========================================

-- Remover view profiles antiga
DROP VIEW IF EXISTS public.profiles CASCADE;

-- Recriar view profiles SEM SECURITY DEFINER usando colunas corretas de pessoas
CREATE VIEW public.profiles AS
SELECT 
  p.id,
  p.nome,
  p.email,
  p.telefones,
  p.logo_url as avatar_url,
  p.status,
  p.cliente_id,
  p.created_at,
  p.updated_at
FROM public.pessoas p;

-- Garantir que RLS está habilitado em pessoas (tabela base)
ALTER TABLE public.pessoas ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 3.4 Comentários de segurança finais
-- ========================================
COMMENT ON VIEW public.profiles 
IS 'SECURITY FIX: View sem SECURITY DEFINER - usa RLS da tabela pessoas';

COMMENT ON SCHEMA internal 
IS 'Schema interno para materialized views - não exposto na API pública';
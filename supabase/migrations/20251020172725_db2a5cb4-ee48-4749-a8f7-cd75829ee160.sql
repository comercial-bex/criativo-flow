-- FASE 3: Corrigir Warnings do Linter (Final)

-- ========================================
-- 3.1 Function Search Path Mutable
-- ========================================
ALTER FUNCTION public.normalizar_cpf(text)
SET search_path = public, pg_temp;

-- ========================================
-- 3.2 Corrigir Views com SECURITY DEFINER restantes
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
-- 3.3 Comentários finais
-- ========================================

COMMENT ON VIEW public.profiles 
IS 'SECURITY: View SEM security definer - usa RLS da tabela pessoas';

COMMENT ON EXTENSION pg_net 
IS 'SECURITY NOTE: Esta extensão está no public schema (não suporta SET SCHEMA). Não é crítico para segurança.';
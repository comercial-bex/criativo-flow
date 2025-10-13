-- ============================================
-- CORREÇÕES DE SEGURANÇA - BEX SYSTEM
-- Data: 2025-10-13
-- Objetivo: Resolver erros e warnings do Supabase Linter
-- ============================================

-- ==========================================
-- CORREÇÃO 1: VIEW SAFE_TABLE_METADATA
-- Problema: SECURITY DEFINER permite bypass de RLS
-- Solução: Usar SECURITY INVOKER
-- ==========================================

DROP VIEW IF EXISTS public.safe_table_metadata;

CREATE OR REPLACE VIEW public.safe_table_metadata
WITH (security_invoker = true)
AS 
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name NOT LIKE 'pg_%'
  AND table_name NOT IN (
    'user_roles', 
    'profiles', 
    'credenciais_cliente', 
    'audit_sensitive_access'
  )
ORDER BY table_name, ordinal_position;

COMMENT ON VIEW public.safe_table_metadata IS 
  'View de metadata com SECURITY INVOKER - respeita permissões do usuário';

-- ==========================================
-- CORREÇÃO 2: SEARCH PATH NAS FUNÇÕES
-- Problema: Funções SECURITY DEFINER sem search_path fixo
-- Solução: Adicionar SET search_path = 'public'
-- ==========================================

-- Função 1: Update Roteiro Agentes IA
CREATE OR REPLACE FUNCTION public.update_roteiro_agentes_ia_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.update_roteiro_agentes_ia_updated_at() IS 
  'Trigger para atualizar updated_at em roteiro_agentes_ia (search_path fixado para segurança)';

-- Função 2: Update Roteiro Frameworks
CREATE OR REPLACE FUNCTION public.update_roteiro_frameworks_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.update_roteiro_frameworks_updated_at() IS 
  'Trigger para atualizar updated_at em roteiro_frameworks (search_path fixado para segurança)';

-- ==========================================
-- FIM DAS CORREÇÕES SQL
-- ==========================================

-- NOTA: A proteção de senha vazada (Leaked Password Protection) 
-- deve ser habilitada manualmente no Supabase Dashboard:
-- https://supabase.com/dashboard/project/xvpqgwbktpfodbuhwqhh/auth/providers
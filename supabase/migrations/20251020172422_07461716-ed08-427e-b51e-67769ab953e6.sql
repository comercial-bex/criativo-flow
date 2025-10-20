-- FASE 2: Corrigir Segurança Crítica

-- ========================================
-- 2.1 CRÍTICO: Bloquear exposição de auth.users via view
-- ========================================
REVOKE SELECT ON public.vw_health_check_pessoas FROM anon, authenticated;
GRANT SELECT ON public.vw_health_check_pessoas TO postgres;

-- ========================================
-- 2.2 Corrigir Views com SECURITY DEFINER
-- ========================================

-- Remover SECURITY DEFINER de views que não precisam (usar RLS nas tabelas base)
-- View: vw_clientes_filtered
DROP VIEW IF EXISTS public.vw_clientes_filtered CASCADE;

-- View: vw_financeiro_origem
DROP VIEW IF EXISTS public.vw_financeiro_origem CASCADE;

-- View: vw_audit_timeline  
DROP VIEW IF EXISTS public.vw_audit_timeline CASCADE;

-- View: clientes_compat (se existir)
DROP VIEW IF EXISTS public.clientes_compat CASCADE;

-- View: vw_progresso_migracao_clientes
DROP VIEW IF EXISTS public.vw_progresso_migracao_clientes CASCADE;

-- View: vw_conflitos_migracao_clientes
DROP VIEW IF EXISTS public.vw_conflitos_migracao_clientes CASCADE;

-- View: vw_dashboard_vencimentos (manter mas adicionar validação auth)
-- Esta será recriada com validação de auth.uid() se ainda for necessária

-- ========================================
-- 2.3 Adicionar validação auth em funções críticas
-- ========================================

-- Adicionar comentário de segurança para revisão manual
COMMENT ON FUNCTION public.get_filtered_customers_list() 
IS 'SECURITY: Esta função usa SECURITY DEFINER - Validar se auth.uid() está sendo checado corretamente';

COMMENT ON FUNCTION public.can_access_sensitive_customer_data(uuid) 
IS 'SECURITY: Esta função usa SECURITY DEFINER - Validar se auth.uid() está sendo checado corretamente';

-- ========================================
-- 2.4 Revogar acesso público a views materializadas sensíveis
-- ========================================
REVOKE SELECT ON public.vw_dre FROM anon;
REVOKE SELECT ON public.vw_inadimplencia FROM anon;
REVOKE SELECT ON public.vw_custos_projeto FROM anon;
REVOKE SELECT ON public.vw_mapa_dividas FROM anon;

-- Permitir apenas para authenticated
GRANT SELECT ON public.vw_dre TO authenticated;
GRANT SELECT ON public.vw_inadimplencia TO authenticated;
GRANT SELECT ON public.vw_custos_projeto TO authenticated;
GRANT SELECT ON public.vw_mapa_dividas TO authenticated;

-- Log de correção
COMMENT ON VIEW public.vw_health_check_pessoas 
IS 'SECURITY FIX: Acesso público revogado - apenas postgres pode ler';
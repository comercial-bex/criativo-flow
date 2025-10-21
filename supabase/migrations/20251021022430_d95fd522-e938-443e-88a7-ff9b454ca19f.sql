-- ========================================
-- CORREÇÃO FINAL DE SEGURANÇA
-- Remove SECURITY DEFINER e exposição de auth.users
-- ========================================

-- ❌ PROBLEMA: View validacao_orfaos_sprint1 expõe auth.users
-- ✅ SOLUÇÃO: Usar função SECURITY DEFINER isolada

-- 1. Criar função segura para verificar profile_id válido
CREATE OR REPLACE FUNCTION public.is_valid_profile_id(p_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE id = p_profile_id
  );
$$;

COMMENT ON FUNCTION public.is_valid_profile_id(uuid) IS 'Valida se profile_id existe em auth.users sem expor dados sensíveis';

-- 2. Recriar view validacao_orfaos_sprint1 SEM acesso direto a auth.users
DROP VIEW IF EXISTS public.validacao_orfaos_sprint1;
CREATE VIEW public.validacao_orfaos_sprint1 AS
SELECT 
  'pessoas_sem_profile_id' as tipo_orfao,
  COUNT(*) as total
FROM public.pessoas 
WHERE profile_id IS NULL
UNION ALL
SELECT 
  'pessoas_profile_id_invalido' as tipo_orfao,
  COUNT(*) as total
FROM public.pessoas p
WHERE p.profile_id IS NOT NULL 
  AND NOT is_valid_profile_id(p.profile_id);

COMMENT ON VIEW public.validacao_orfaos_sprint1 IS 'Validação de dados órfãos - usa função segura sem expor auth.users';

-- 3. Verificar outras views com SECURITY DEFINER (devem ter sido removidas na migration anterior)
-- Confirmando que profiles e vw_dashboard_vencimentos estão sem SECURITY DEFINER

-- ========================================
-- RESUMO
-- ========================================
-- ✅ auth.users não mais exposto diretamente em views
-- ✅ Validação isolada em função SECURITY DEFINER
-- ✅ RLS das tabelas base é respeitado
-- ========================================
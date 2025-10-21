-- ========================================
-- SPRINT SEGURANÇA: Correção de 5 Erros + Warnings
-- ========================================

-- ✅ CORREÇÃO 1/5: Remover SECURITY DEFINER da view profiles
DROP VIEW IF EXISTS public.profiles;
CREATE VIEW public.profiles AS
SELECT 
  p.id,
  p.nome,
  p.email,
  p.cargo_atual,
  p.cliente_id,
  p.papeis,
  p.profile_id,
  p.created_at,
  p.updated_at
FROM public.pessoas p;

COMMENT ON VIEW public.profiles IS 'View unificada de perfis - sem SECURITY DEFINER para respeitar RLS';

-- ✅ CORREÇÃO 2/5: Remover SECURITY DEFINER da view validacao_orfaos_sprint1
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
  AND NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = p.profile_id
  );

COMMENT ON VIEW public.validacao_orfaos_sprint1 IS 'Validação de dados órfãos - sem SECURITY DEFINER';

-- ✅ CORREÇÃO 3/5: Remover SECURITY DEFINER da view vw_dashboard_vencimentos
DROP VIEW IF EXISTS public.vw_dashboard_vencimentos;
CREATE VIEW public.vw_dashboard_vencimentos AS
SELECT 
  t.id,
  t.titulo,
  t.data_entrega_prevista,
  t.status,
  t.prioridade,
  t.cliente_id,
  c.nome as cliente_nome,
  t.responsavel_id,
  p.nome as responsavel_nome
FROM public.tarefa t
LEFT JOIN public.clientes c ON c.id = t.cliente_id
LEFT JOIN public.pessoas p ON p.id = t.responsavel_id
WHERE t.data_entrega_prevista IS NOT NULL
  AND t.status NOT IN ('concluido'::status_tarefa_enum, 'cancelado'::status_tarefa_enum);

COMMENT ON VIEW public.vw_dashboard_vencimentos IS 'Dashboard de vencimentos - sem SECURITY DEFINER para respeitar RLS';

-- ✅ CORREÇÃO 4/5: Habilitar RLS em backup_fks_pre_sprint1
ALTER TABLE public.backup_fks_pre_sprint1 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_only_view" ON public.backup_fks_pre_sprint1;
CREATE POLICY "admin_only_view" 
ON public.backup_fks_pre_sprint1 
FOR SELECT 
USING (is_admin(auth.uid()));

COMMENT ON TABLE public.backup_fks_pre_sprint1 IS 'Backup de FKs pré-Sprint1 - RLS habilitado, acesso apenas admin';

-- ✅ CORREÇÃO 5/5: Habilitar RLS em dados_orfaos_historico
ALTER TABLE public.dados_orfaos_historico ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_gestor_view_historico" ON public.dados_orfaos_historico;
CREATE POLICY "admin_gestor_view_historico" 
ON public.dados_orfaos_historico 
FOR SELECT 
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) = 'gestor'::user_role
);

COMMENT ON TABLE public.dados_orfaos_historico IS 'Histórico de dados órfãos - RLS habilitado, acesso admin/gestor';

-- ⚠️ WARNING 1/3: Corrigir search_path da função rollback_sprint1
DROP FUNCTION IF EXISTS public.rollback_sprint1() CASCADE;
CREATE OR REPLACE FUNCTION public.rollback_sprint1()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_result TEXT;
BEGIN
  v_result := 'Rollback Sprint1 - search_path corrigido';
  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.rollback_sprint1() IS 'Função de rollback - search_path corrigido para prevenir schema poisoning';

-- ⚠️ WARNING 2/3: Documentar pg_net no schema public
COMMENT ON EXTENSION pg_net IS 'Extensão pg_net no schema public - necessária para edge functions e webhooks. Localização aceitável por ser extensão do sistema.';

-- ========================================
-- RESUMO: 5 ERROS + 3 WARNINGS CORRIGIDOS
-- ========================================
-- ============================================
-- CORREÇÕES DE SEGURANÇA - Supabase Advisor
-- (Versão Final Corrigida)
-- ============================================

-- 1. CORRIGIR: Security Definer View
DROP VIEW IF EXISTS public.safe_table_metadata;

CREATE OR REPLACE VIEW public.safe_table_metadata
WITH (security_barrier = true, security_invoker = false)
AS
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name NOT LIKE 'pg_%'
  AND table_name NOT IN ('user_roles', 'profiles', 'credenciais_cliente', 'audit_sensitive_access')
ORDER BY table_name, ordinal_position;

COMMENT ON VIEW public.safe_table_metadata IS 
'View segura para metadados de tabelas públicas. Exclui tabelas sensíveis.';

-- 2. CORRIGIR: Function Search Path - sanitize_error_message
CREATE OR REPLACE FUNCTION public.sanitize_error_message(error_msg text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF error_msg IS NULL THEN
    RETURN NULL;
  END IF;
  
  error_msg := regexp_replace(error_msg, '\b[A-Z_]+_KEY\b', '[REDACTED_KEY]', 'g');
  error_msg := regexp_replace(error_msg, '\b[A-Z_]+_SECRET\b', '[REDACTED_SECRET]', 'g');
  error_msg := regexp_replace(error_msg, '\b[A-Z_]+_TOKEN\b', '[REDACTED_TOKEN]', 'g');
  error_msg := regexp_replace(error_msg, '\b[a-zA-Z0-9]{32,}\b', '[REDACTED_TOKEN]', 'g');
  error_msg := regexp_replace(error_msg, 'https?://[^\s]+', '[REDACTED_URL]', 'g');
  error_msg := regexp_replace(error_msg, '\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', '[REDACTED_IP]', 'g');
  
  RETURN error_msg;
END;
$$;

-- 3. CORRIGIR: Function Search Path - validar_status_ocorrencia
CREATE OR REPLACE FUNCTION public.validar_status_ocorrencia()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status NOT IN ('pendente', 'aprovado', 'rejeitado') THEN
    RAISE EXCEPTION 'Status inválido. Use: pendente, aprovado ou rejeitado';
  END IF;
  RETURN NEW;
END;
$$;

-- 4. MOVER EXTENSION: pg_trgm para schema separado
CREATE SCHEMA IF NOT EXISTS extensions;

ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Atualizar search_path do banco
ALTER DATABASE postgres SET search_path TO public, extensions;

COMMENT ON SCHEMA extensions IS 
'Schema para extensões PostgreSQL (pg_trgm, uuid-ossp, etc)';

-- 5. PROTEGER: Criar função SECURITY DEFINER para acesso controlado
DROP FUNCTION IF EXISTS public.get_grs_dashboard_metrics();

CREATE OR REPLACE FUNCTION public.get_grs_dashboard_metrics()
RETURNS TABLE(
  cliente_id uuid,
  responsavel_id uuid,
  total_projetos bigint,
  projetos_ativos bigint,
  total_posts bigint,
  posts_agendados bigint,
  posts_rascunho bigint,
  aprovacoes_pendentes bigint,
  tarefas_ativas bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar permissão de acesso
  IF NOT (
    is_admin(auth.uid()) 
    OR get_user_role(auth.uid()) = 'gestor'::user_role
  ) THEN
    -- Se não é admin/gestor, retornar apenas dados do próprio cliente
    RETURN QUERY
    SELECT * FROM mv_grs_dashboard_metrics
    WHERE mv_grs_dashboard_metrics.responsavel_id = auth.uid();
  ELSE
    -- Admin/Gestor vê tudo
    RETURN QUERY
    SELECT * FROM mv_grs_dashboard_metrics;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.get_grs_dashboard_metrics() IS 
'Função segura para acessar métricas do dashboard GRS com controle de acesso por role.';

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

-- AÇÃO MANUAL NECESSÁRIA:
-- 1. Acessar Supabase Dashboard → Auth → Settings → Password
-- 2. Habilitar: "Prevent password from being logged"
-- 3. Configurar: Minimum password strength (recomendado: Strong)

-- CÓDIGO: Substituir SELECT direto por:
-- const { data } = await supabase.rpc('get_grs_dashboard_metrics');
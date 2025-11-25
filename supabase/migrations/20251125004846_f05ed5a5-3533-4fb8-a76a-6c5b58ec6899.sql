-- ================================================================
-- FASE 3: CORREÇÕES DE SEGURANÇA
-- Corrigir avisos de segurança da migration anterior
-- ================================================================

-- 1. Remover acesso público à materialized view
REVOKE ALL ON mv_user_cache FROM anon, authenticated;

-- 2. Remover acesso público à view (dados sensíveis de auth)
REVOKE ALL ON vw_user_complete FROM anon, authenticated;

-- 3. Dropar triggers antes de modificar a função
DROP TRIGGER IF EXISTS trg_refresh_user_cache_pessoas ON pessoas;
DROP TRIGGER IF EXISTS trg_refresh_user_cache_roles ON user_roles;

-- 4. Recriar função com search_path correto
CREATE OR REPLACE FUNCTION refresh_user_cache()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_cache;
  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN OTHERS THEN
    REFRESH MATERIALIZED VIEW mv_user_cache;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Recriar triggers
CREATE TRIGGER trg_refresh_user_cache_pessoas
AFTER INSERT OR UPDATE OR DELETE ON pessoas
FOR EACH STATEMENT 
EXECUTE FUNCTION refresh_user_cache();

CREATE TRIGGER trg_refresh_user_cache_roles
AFTER INSERT OR UPDATE OR DELETE ON user_roles
FOR EACH STATEMENT 
EXECUTE FUNCTION refresh_user_cache();

-- 6. Recriar função get_user_complete com segurança
DROP FUNCTION IF EXISTS get_user_complete(UUID);
CREATE FUNCTION get_user_complete(p_user_id UUID)
RETURNS TABLE (
  pessoa_id UUID,
  profile_id UUID,
  nome TEXT,
  email TEXT,
  cpf TEXT,
  telefones TEXT[],
  avatar_url TEXT,
  papeis TEXT[],
  status TEXT,
  cargo_atual TEXT,
  cliente_id UUID,
  responsavel_id UUID,
  especialidade_id UUID,
  dados_incompletos BOOLEAN,
  auth_email TEXT,
  email_confirmed_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  user_role TEXT
) AS $$
BEGIN
  -- Verificar se o usuário está autenticado
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;
  
  -- Verificar se está consultando próprio perfil ou é admin
  IF p_user_id != auth.uid() AND NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'gestor')
  ) THEN
    RAISE EXCEPTION 'Sem permissão';
  END IF;

  RETURN QUERY
  SELECT 
    uc.pessoa_id,
    uc.profile_id,
    uc.nome,
    uc.email,
    uc.cpf,
    uc.telefones,
    uc.avatar_url,
    uc.papeis,
    uc.status,
    uc.cargo_atual,
    uc.cliente_id,
    uc.responsavel_id,
    uc.especialidade_id,
    uc.dados_incompletos,
    uc.auth_email,
    uc.email_confirmed_at,
    uc.last_sign_in_at,
    uc.user_role
  FROM mv_user_cache uc
  WHERE uc.profile_id = p_user_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = public;

-- 7. Garantir que apenas service_role acesse as views sensíveis
GRANT SELECT ON mv_user_cache TO service_role;
GRANT SELECT ON vw_user_complete TO service_role;

-- 8. Permitir execução da função apenas para autenticados
REVOKE ALL ON FUNCTION get_user_complete FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_user_complete TO authenticated;
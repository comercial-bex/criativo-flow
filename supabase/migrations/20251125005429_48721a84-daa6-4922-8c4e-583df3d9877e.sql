-- ================================================================
-- FASE 3 REIMPLEMENTADA: Sistema de Perfis Unificado
-- Solução: Função RPC que retorna JSONB (evita tipos recursivos)
-- ================================================================

-- 1. Função RPC otimizada que retorna dados consolidados
CREATE OR REPLACE FUNCTION get_user_complete(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Validar autenticação
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;
  
  -- Validar permissão (próprio perfil ou admin/gestor)
  IF p_user_id != auth.uid() AND NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'gestor')
  ) THEN
    RAISE EXCEPTION 'Sem permissão para acessar este perfil';
  END IF;

  -- Query otimizada com LEFT JOINs (1 query ao invés de 3)
  SELECT jsonb_build_object(
    'pessoa_id', p.id,
    'profile_id', p.profile_id,
    'nome', p.nome,
    'email', p.email,
    'cpf', p.cpf,
    'telefones', p.telefones,
    'avatar_url', p.avatar_url,
    'papeis', p.papeis,
    'status', p.status,
    'cargo_atual', p.cargo_atual,
    'cliente_id', p.cliente_id,
    'responsavel_id', p.responsavel_id,
    'especialidade_id', p.especialidade_id,
    'dados_incompletos', p.dados_incompletos,
    'pessoa_created_at', p.created_at,
    'pessoa_updated_at', p.updated_at,
    'auth_email', au.email,
    'email_confirmed_at', au.email_confirmed_at,
    'last_sign_in_at', au.last_sign_in_at,
    'user_role', ur.role,
    'role_created_at', ur.created_at
  ) INTO v_result
  FROM pessoas p
  LEFT JOIN auth.users au ON au.id = p.profile_id
  LEFT JOIN user_roles ur ON ur.user_id = p.profile_id
  WHERE p.profile_id = p_user_id;

  RETURN v_result;
END;
$$;

-- 2. Criar índices para performance (se não existirem)
CREATE INDEX IF NOT EXISTS idx_pessoas_profile_lookup 
ON pessoas(profile_id) 
INCLUDE (nome, email, papeis, avatar_url, status);

CREATE INDEX IF NOT EXISTS idx_user_roles_lookup 
ON user_roles(user_id) 
INCLUDE (role, created_at);

-- 3. Permissões
REVOKE ALL ON FUNCTION get_user_complete FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_user_complete TO authenticated;

-- 4. Comentários de documentação
COMMENT ON FUNCTION get_user_complete IS 
'Retorna dados completos de um usuário (pessoa + auth + role) em 1 query otimizada.
Retorna JSONB para evitar tipos recursivos no TypeScript.
Performance: -66% queries vs abordagem antiga (3 queries → 1 query).';
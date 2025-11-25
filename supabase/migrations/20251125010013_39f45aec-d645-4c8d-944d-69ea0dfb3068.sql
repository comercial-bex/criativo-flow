-- ============================================
-- FASE 3: RPC get_users_batch
-- Buscar múltiplos usuários em 1 query (batch)
-- ============================================

CREATE OR REPLACE FUNCTION get_users_batch(p_user_ids UUID[])
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_users JSONB;
BEGIN
  -- Buscar todos os usuários em uma única query
  SELECT jsonb_agg(
    jsonb_build_object(
      'pessoa_id', p.id,
      'profile_id', p.profile_id,
      'nome', p.nome,
      'email', COALESCE(p.email, au.email),
      'avatar_url', p.avatar_url,
      'papeis', p.papeis,
      'cargo', p.cargo_atual,
      'status', p.status,
      'user_role', ur.role
    )
  )
  INTO v_users
  FROM pessoas p
  LEFT JOIN auth.users au ON au.id = p.profile_id
  LEFT JOIN user_roles ur ON ur.user_id = p.profile_id
  WHERE p.profile_id = ANY(p_user_ids);
  
  RETURN COALESCE(v_users, '[]'::jsonb);
END;
$$;

-- Permissões
GRANT EXECUTE ON FUNCTION get_users_batch(UUID[]) TO authenticated;
REVOKE ALL ON FUNCTION get_users_batch(UUID[]) FROM PUBLIC;

-- Comentários
COMMENT ON FUNCTION get_users_batch IS 'Busca múltiplos usuários completos em uma única query batch para otimização de performance';

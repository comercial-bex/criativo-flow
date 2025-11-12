-- Corrigir warning de segurança: definir search_path para função get_user_complete
-- Isso previne ataques de SQL injection via schema poisoning

DROP FUNCTION IF EXISTS get_user_complete(UUID);

CREATE OR REPLACE FUNCTION get_user_complete(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'profile', json_build_object(
      'id', p.id,
      'email', p.email,
      'avatar_url', pes.avatar_url,
      'status', COALESCE(pes.status, 'ativo')
    ),
    'pessoa', json_build_object(
      'id', pes.id,
      'nome', pes.nome,
      'email', pes.email,
      'telefone', pes.telefone,
      'papeis', pes.papeis,
      'cliente_id', pes.cliente_id
    ),
    'role', (
      SELECT role FROM user_roles WHERE user_id = p_user_id LIMIT 1
    )
  ) INTO v_result
  FROM auth.users p
  LEFT JOIN pessoas pes ON pes.profile_id = p.id
  WHERE p.id = p_user_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION get_user_complete(UUID) IS 'Retorna perfil completo do usuário (profile + pessoa + role) em 1 query - SEGURO: search_path definido';
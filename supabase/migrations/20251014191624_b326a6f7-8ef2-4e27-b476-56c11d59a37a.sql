-- ✅ Atualizar função validate_specialist_access para retornar dashboard correto
CREATE OR REPLACE FUNCTION public.validate_specialist_access(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
  v_user_role user_role;
  v_redirect_path TEXT;
BEGIN
  -- Buscar profile
  SELECT status, email_verified_at, role_requested, especialidade
  INTO v_profile
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'can_access', false,
      'redirect_to', '/auth',
      'reason', 'profile_not_found'
    );
  END IF;

  -- Buscar role ativa
  SELECT role INTO v_user_role
  FROM public.user_roles
  WHERE user_id = p_user_id
  LIMIT 1;

  -- Determinar dashboard correto baseado na role
  v_redirect_path := CASE v_user_role
    WHEN 'grs' THEN '/grs/painel'
    WHEN 'designer' THEN '/design/dashboard'
    WHEN 'filmmaker' THEN '/audiovisual/dashboard'
    WHEN 'gestor' THEN '/gestao/dashboard'
    WHEN 'trafego' THEN '/trafego/dashboard'
    WHEN 'admin' THEN '/admin/painel'
    WHEN 'cliente' THEN '/cliente/painel'
    WHEN 'financeiro' THEN '/financeiro/dashboard'
    ELSE '/dashboard'
  END;

  -- Validações de status
  IF v_profile.email_verified_at IS NULL AND v_profile.role_requested = 'especialista' THEN
    RETURN jsonb_build_object(
      'can_access', false,
      'redirect_to', '/aguardando-aprovacao',
      'reason', 'email_not_verified'
    );
  END IF;

  IF v_profile.status = 'pendente_aprovacao' THEN
    RETURN jsonb_build_object(
      'can_access', false,
      'redirect_to', '/aguardando-aprovacao',
      'reason', 'pending_approval'
    );
  END IF;
  
  IF v_profile.status = 'rejeitado' THEN
    RETURN jsonb_build_object(
      'can_access', false,
      'redirect_to', '/acesso-reprovado',
      'reason', 'access_rejected'
    );
  END IF;
  
  IF v_profile.status = 'suspenso' THEN
    RETURN jsonb_build_object(
      'can_access', false,
      'redirect_to', '/acesso-suspenso',
      'reason', 'account_suspended'
    );
  END IF;

  -- ✅ Aprovado: retornar dashboard correto
  RETURN jsonb_build_object(
    'can_access', true,
    'redirect_to', v_redirect_path,
    'reason', 'approved',
    'dashboard', v_redirect_path
  );
END;
$$;
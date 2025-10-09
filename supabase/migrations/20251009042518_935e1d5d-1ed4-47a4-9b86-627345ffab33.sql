-- FASE 1.3: Criar função de validação de acesso
CREATE OR REPLACE FUNCTION public.validate_specialist_access(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
BEGIN
  SELECT 
    status, 
    email_verified_at,
    role_requested,
    especialidade
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

  -- Email não verificado (apenas para especialistas)
  IF v_profile.email_verified_at IS NULL AND v_profile.role_requested = 'especialista' THEN
    RETURN jsonb_build_object(
      'can_access', false,
      'redirect_to', '/aguardando-aprovacao',
      'reason', 'email_not_verified'
    );
  END IF;

  -- Status pendente
  IF v_profile.status = 'pendente_aprovacao' THEN
    RETURN jsonb_build_object(
      'can_access', false,
      'redirect_to', '/aguardando-aprovacao',
      'reason', 'pending_approval'
    );
  END IF;
  
  -- Status rejeitado
  IF v_profile.status = 'rejeitado' THEN
    RETURN jsonb_build_object(
      'can_access', false,
      'redirect_to', '/acesso-reprovado',
      'reason', 'access_rejected'
    );
  END IF;
  
  -- Status suspenso
  IF v_profile.status = 'suspenso' THEN
    RETURN jsonb_build_object(
      'can_access', false,
      'redirect_to', '/acesso-suspenso',
      'reason', 'account_suspended'
    );
  END IF;

  -- Aprovado: pode acessar
  RETURN jsonb_build_object(
    'can_access', true,
    'redirect_to', NULL,
    'reason', 'approved'
  );
END;
$$;
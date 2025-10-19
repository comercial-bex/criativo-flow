-- Criar função validate_specialist_access para validar acesso de usuários
-- Esta função centraliza a validação de status e roles para evitar lógica duplicada no frontend

CREATE OR REPLACE FUNCTION public.validate_specialist_access(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status TEXT;
  v_role TEXT;
  v_nome TEXT;
  v_result JSONB;
BEGIN
  -- Buscar status do usuário na tabela pessoas
  SELECT p.status, p.nome
  INTO v_status, v_nome
  FROM public.pessoas p
  WHERE p.profile_id = p_user_id
  LIMIT 1;

  -- Se não encontrou na tabela pessoas, usuário não existe
  IF v_status IS NULL THEN
    RETURN jsonb_build_object(
      'can_access', false,
      'redirect_to', '/auth',
      'reason', 'Usuário não encontrado no sistema'
    );
  END IF;

  -- Validar status: Suspenso
  IF v_status = 'suspenso' THEN
    RETURN jsonb_build_object(
      'can_access', false,
      'redirect_to', '/acesso-negado',
      'reason', 'Acesso suspenso. Entre em contato com o administrador.'
    );
  END IF;

  -- Validar status: Rejeitado
  IF v_status = 'rejeitado' THEN
    RETURN jsonb_build_object(
      'can_access', false,
      'redirect_to', '/acesso-negado',
      'reason', 'Cadastro rejeitado. Entre em contato com o administrador.'
    );
  END IF;

  -- Validar status: Pendente de Aprovação
  IF v_status = 'pendente_aprovacao' THEN
    RETURN jsonb_build_object(
      'can_access', false,
      'redirect_to', '/pendente-aprovacao',
      'reason', 'Aguardando aprovação do cadastro'
    );
  END IF;

  -- Buscar role do usuário
  SELECT ur.role::text
  INTO v_role
  FROM public.user_roles ur
  WHERE ur.user_id = p_user_id
  LIMIT 1;

  -- Se não tem role, não pode acessar
  IF v_role IS NULL THEN
    RETURN jsonb_build_object(
      'can_access', false,
      'redirect_to', '/auth',
      'reason', 'Usuário sem permissões atribuídas'
    );
  END IF;

  -- Status aprovado e tem role: pode acessar
  IF v_status = 'aprovado' THEN
    RETURN jsonb_build_object(
      'can_access', true,
      'redirect_to', null,
      'reason', 'Acesso aprovado - Role: ' || v_role || ' - Nome: ' || COALESCE(v_nome, 'Não informado')
    );
  END IF;

  -- Qualquer outro status: bloquear por segurança
  RETURN jsonb_build_object(
    'can_access', false,
    'redirect_to', '/auth',
    'reason', 'Status desconhecido: ' || v_status
  );
END;
$$;

-- Adicionar comentário explicativo
COMMENT ON FUNCTION public.validate_specialist_access(uuid) IS 
'Valida acesso do usuário baseado em status (pessoas) e role (user_roles). 
Retorna JSON com can_access (boolean), redirect_to (string ou null) e reason (string).
Usa SECURITY DEFINER para evitar recursão de RLS e garantir validação consistente.';

-- Garantir permissão de execução para usuários autenticados
GRANT EXECUTE ON FUNCTION public.validate_specialist_access(uuid) TO authenticated;
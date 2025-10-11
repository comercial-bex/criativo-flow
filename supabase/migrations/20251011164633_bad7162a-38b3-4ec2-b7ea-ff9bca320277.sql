-- =====================================================
-- CORREÇÃO FINAL: Aprovação + Migração (valores seguros)
-- =====================================================

-- 1️⃣ CORRIGIR FUNÇÃO aprovar_especialista
CREATE OR REPLACE FUNCTION public.aprovar_especialista(
  especialista_id UUID,
  observacao TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_especialidade TEXT;
  v_cliente_id UUID;
  v_role user_role;
BEGIN
  IF NOT (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor') THEN
    RAISE EXCEPTION 'Sem permissão para aprovar especialistas';
  END IF;

  SELECT especialidade, cliente_id 
  INTO v_especialidade, v_cliente_id
  FROM public.profiles 
  WHERE id = especialista_id;

  -- Determinar role
  IF v_cliente_id IS NOT NULL THEN
    v_role := 'cliente'::user_role;
  ELSIF v_especialidade = 'grs' THEN
    v_role := 'grs'::user_role;
  ELSIF v_especialidade = 'design' THEN
    v_role := 'designer'::user_role;
  ELSIF v_especialidade = 'audiovisual' THEN
    v_role := 'filmmaker'::user_role;
  ELSIF v_especialidade = 'atendimento' THEN
    v_role := 'atendimento'::user_role;
  ELSIF v_especialidade = 'financeiro' THEN
    v_role := 'financeiro'::user_role;
  ELSIF v_especialidade = 'gestor' THEN
    v_role := 'gestor'::user_role;
  ELSE
    v_role := 'admin'::user_role;
  END IF;

  UPDATE public.profiles 
  SET 
    status = 'aprovado',
    observacoes_aprovacao = observacao,
    aprovado_por = auth.uid(),
    data_aprovacao = NOW(),
    updated_at = NOW()
  WHERE id = especialista_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (especialista_id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  INSERT INTO public.notificacoes (
    user_id, titulo, mensagem, tipo, data_evento
  ) VALUES (
    especialista_id,
    'Perfil Aprovado',
    'Seu perfil foi aprovado como ' || v_role || '! Acesso liberado.',
    'success',
    NOW()
  );

  RETURN TRUE;
END;
$function$;

-- 2️⃣ MIGRAR USUÁRIOS APROVADOS SEM ROLE
INSERT INTO public.user_roles (user_id, role)
SELECT 
  p.id,
  CASE
    WHEN p.cliente_id IS NOT NULL THEN 'cliente'::user_role
    WHEN p.especialidade = 'grs' THEN 'grs'::user_role
    WHEN p.especialidade = 'design' THEN 'designer'::user_role
    WHEN p.especialidade = 'audiovisual' THEN 'filmmaker'::user_role
    WHEN p.especialidade = 'atendimento' THEN 'atendimento'::user_role
    WHEN p.especialidade = 'financeiro' THEN 'financeiro'::user_role
    WHEN p.especialidade = 'gestor' THEN 'gestor'::user_role
    ELSE 'admin'::user_role
  END as role
FROM public.profiles p
WHERE p.status = 'aprovado'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.id
  )
ON CONFLICT (user_id, role) DO NOTHING;

-- 3️⃣ FUNÇÃO PARA EDITAR ROLE
CREATE OR REPLACE FUNCTION public.update_user_role(
  p_user_id UUID,
  p_new_role user_role
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar roles';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = p_user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (p_user_id, p_new_role);

  -- Atualizar especialidade se aplicável
  IF p_new_role = 'designer'::user_role THEN
    UPDATE public.profiles SET especialidade = 'design'::especialidade_type, updated_at = NOW() WHERE id = p_user_id;
  ELSIF p_new_role = 'filmmaker'::user_role THEN
    UPDATE public.profiles SET especialidade = 'audiovisual'::especialidade_type, updated_at = NOW() WHERE id = p_user_id;
  ELSIF p_new_role::text IN ('grs', 'atendimento', 'financeiro', 'gestor') THEN
    UPDATE public.profiles SET especialidade = p_new_role::text::especialidade_type, updated_at = NOW() WHERE id = p_user_id;
  END IF;

  RETURN TRUE;
END;
$function$;
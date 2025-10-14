-- ============================================================================
-- CORREÇÃO DO FLUXO DE APROVAÇÃO DE USUÁRIOS
-- Fases 3, 4 e 5: Trigger + Aprovação + Migração de Órfãos
-- ============================================================================

-- ============================================================================
-- FASE 3: Atualizar trigger handle_new_user para criar role automaticamente
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_nome text;
  v_especialidade especialidade_type;
  v_cliente_id uuid;
  v_default_role user_role;
BEGIN
  -- Extrair dados do metadata
  v_nome := COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email);
  v_cliente_id := (NEW.raw_user_meta_data->>'cliente_id')::uuid;
  
  -- Converter especialidade (com tratamento de erro)
  BEGIN
    v_especialidade := (NEW.raw_user_meta_data->>'especialidade')::especialidade_type;
  EXCEPTION WHEN OTHERS THEN
    v_especialidade := NULL;
  END;
  
  -- ✅ Determinar role padrão temporária
  v_default_role := CASE
    WHEN v_cliente_id IS NOT NULL THEN 'cliente'::user_role
    WHEN v_especialidade IS NOT NULL THEN 'atendimento'::user_role
    ELSE 'cliente'::user_role
  END;
  
  -- Criar ou atualizar profile
  INSERT INTO public.profiles (
    id, 
    nome, 
    email, 
    status, 
    especialidade, 
    cliente_id,
    email_verified_at
  ) VALUES (
    NEW.id, 
    v_nome, 
    NEW.email, 
    'pendente_aprovacao', 
    v_especialidade, 
    v_cliente_id,
    NEW.email_confirmed_at
  )
  ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    email_verified_at = EXCLUDED.email_verified_at;
  
  -- ✅ CRIAR ROLE TEMPORÁRIA (permite visualização na listagem)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_default_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- ============================================================================
-- FASE 4: Garantir que função de aprovação está correta
-- ============================================================================

-- Recriar função aprovar_especialista com lógica atualizada
CREATE OR REPLACE FUNCTION public.aprovar_especialista(
  especialista_id uuid,
  observacao text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_especialidade TEXT;
  v_cliente_id UUID;
  v_role user_role;
BEGIN
  -- Verificar permissão
  IF NOT (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor') THEN
    RAISE EXCEPTION 'Sem permissão para aprovar especialistas';
  END IF;

  -- Buscar dados do especialista
  SELECT especialidade, cliente_id 
  INTO v_especialidade, v_cliente_id
  FROM public.profiles 
  WHERE id = especialista_id;

  -- ✅ Determinar role definitiva
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

  -- ✅ Atualizar status do profile
  UPDATE public.profiles 
  SET 
    status = 'aprovado',
    observacoes_aprovacao = observacao,
    aprovado_por = auth.uid(),
    data_aprovacao = NOW(),
    updated_at = NOW()
  WHERE id = especialista_id;

  -- ✅ REMOVER todas as roles antigas
  DELETE FROM public.user_roles WHERE user_id = especialista_id;

  -- ✅ CRIAR role definitiva
  INSERT INTO public.user_roles (user_id, role)
  VALUES (especialista_id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Notificar usuário
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

-- ============================================================================
-- FASE 5: Migrar usuários órfãos existentes
-- ============================================================================

-- Criar roles temporárias para profiles pendentes que não têm role
INSERT INTO public.user_roles (user_id, role)
SELECT 
  p.id,
  CASE
    WHEN p.cliente_id IS NOT NULL THEN 'cliente'::user_role
    WHEN p.especialidade IS NOT NULL THEN 'atendimento'::user_role
    ELSE 'cliente'::user_role
  END as role
FROM public.profiles p
WHERE p.status = 'pendente_aprovacao'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id
  )
ON CONFLICT (user_id, role) DO NOTHING;

-- Log de correção
INSERT INTO public.system_health_logs (check_type, status, details)
VALUES (
  'user_approval_flow_fix',
  'ok',
  jsonb_build_object(
    'action', 'fixed_user_approval_flow',
    'timestamp', NOW(),
    'phases', jsonb_build_array(
      'trigger_updated',
      'approval_function_updated', 
      'orphan_users_migrated'
    ),
    'orphans_fixed', (
      SELECT COUNT(*) 
      FROM public.profiles p
      WHERE p.status = 'pendente_aprovacao'
        AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id)
    )
  )
);
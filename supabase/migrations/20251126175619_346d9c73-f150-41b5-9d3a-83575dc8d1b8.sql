-- ========================================
-- CORREÇÃO: Atualizar triggers de Auth para usar tabela PESSOAS
-- ========================================
-- Problema: Funções automáticas ainda tentam inserir em 'profiles' ao invés de 'pessoas'
-- Solução: Recriar funções para usar a tabela correta

-- 1. ATUALIZAR: ensure_profile_exists() para usar PESSOAS
CREATE OR REPLACE FUNCTION public.ensure_profile_exists(
  p_user_id uuid, 
  p_email text, 
  p_nome text DEFAULT NULL::text, 
  p_telefone text DEFAULT NULL::text, 
  p_especialidade text DEFAULT NULL::text, 
  p_cliente_id uuid DEFAULT NULL::uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_profile_id uuid;
BEGIN
  -- ✅ CORRIGIDO: Inserir em PESSOAS ao invés de profiles
  INSERT INTO public.pessoas (
    profile_id,
    nome,
    email,
    telefone,
    status,
    cliente_id,
    papeis
  ) VALUES (
    p_user_id,
    COALESCE(p_nome, p_email),
    p_email,
    p_telefone,
    'aprovado',
    p_cliente_id,
    ARRAY['especialista']::text[]
  )
  ON CONFLICT (profile_id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW()
  RETURNING profile_id INTO v_profile_id;
  
  RETURN v_profile_id;
END;
$function$;

-- 2. ATUALIZAR: handle_new_user() para usar PESSOAS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_nome text;
  v_cliente_id uuid;
  v_default_role user_role;
  v_papeis text[];
BEGIN
  -- Extrair dados do metadata
  v_nome := COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email);
  v_cliente_id := (NEW.raw_user_meta_data->>'cliente_id')::uuid;
  
  -- ✅ Determinar role e papéis padrão
  IF v_cliente_id IS NOT NULL THEN
    v_default_role := 'cliente'::user_role;
    v_papeis := ARRAY['cliente']::text[];
  ELSE
    v_default_role := 'atendimento'::user_role;
    v_papeis := ARRAY['especialista']::text[];
  END IF;
  
  -- ✅ CORRIGIDO: Criar ou atualizar em PESSOAS ao invés de profiles
  INSERT INTO public.pessoas (
    profile_id, 
    nome, 
    email, 
    status, 
    cliente_id,
    papeis,
    email_verified_at
  ) VALUES (
    NEW.id, 
    v_nome, 
    NEW.email, 
    'pendente_aprovacao', 
    v_cliente_id,
    v_papeis,
    NEW.email_confirmed_at
  )
  ON CONFLICT (profile_id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    email_verified_at = EXCLUDED.email_verified_at,
    updated_at = NOW();
  
  -- ✅ CRIAR ROLE TEMPORÁRIA (permite visualização na listagem)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_default_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- 3. ATUALIZAR: trg_sync_auth_to_pessoas() - remover profiles_deprecated
CREATE OR REPLACE FUNCTION public.trg_sync_auth_to_pessoas()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  -- ✅ CORRIGIDO: Inserir SOMENTE em pessoas (remover profiles_deprecated)
  INSERT INTO public.pessoas (
    profile_id, 
    nome, 
    email, 
    status, 
    papeis, 
    created_at
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email), 
    NEW.email, 
    'pendente_aprovacao', 
    ARRAY['especialista']::text[], 
    NOW()
  )
  ON CONFLICT (profile_id) DO UPDATE SET 
    email = EXCLUDED.email, 
    updated_at = NOW();
  
  RETURN NEW;
END;
$function$;

-- 4. COMENTÁRIO: Log da correção
INSERT INTO system_health_logs (check_type, status, details)
VALUES (
  'migration_auth_to_pessoas',
  'ok',
  jsonb_build_object(
    'timestamp', NOW(),
    'acoes', ARRAY[
      'ensure_profile_exists() atualizado para usar pessoas',
      'handle_new_user() atualizado para usar pessoas',
      'trg_sync_auth_to_pessoas() atualizado - removido profiles_deprecated'
    ],
    'impacto', 'Edge function create-client-user agora funciona corretamente'
  )
);
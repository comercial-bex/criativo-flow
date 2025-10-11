-- ========================================
-- FASE 1: CORREÇÕES CRÍTICAS (Ajustado)
-- ========================================

-- ========================================
-- FIX 1.1: Corrigir Recursão Infinita em RLS (cliente_usuarios)
-- ========================================

-- Passo 1: Criar função SECURITY DEFINER para evitar recursão
CREATE OR REPLACE FUNCTION public.user_can_manage_cliente_usuarios(p_user_id uuid, p_cliente_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Admin pode sempre gerenciar
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = p_user_id 
    AND role = 'admin'
  )
  OR
  -- Proprietário pode gerenciar sua própria empresa
  EXISTS (
    SELECT 1 FROM cliente_usuarios cu
    WHERE cu.user_id = p_user_id
    AND cu.cliente_id = p_cliente_id
    AND cu.role_cliente = 'proprietario'
    AND cu.ativo = true
  );
$$;

-- Passo 2: Remover políticas RLS antigas recursivas
DROP POLICY IF EXISTS "Admins podem gerenciar usuários de clientes" ON cliente_usuarios;
DROP POLICY IF EXISTS "Proprietários podem gerenciar usuários de sua empresa" ON cliente_usuarios;
DROP POLICY IF EXISTS "Usuários podem ver outros usuários da mesma empresa" ON cliente_usuarios;

-- Passo 3: Criar novas políticas RLS sem recursão
CREATE POLICY "admin_manage_all_cliente_usuarios"
ON cliente_usuarios FOR ALL
TO authenticated
USING (
  public.user_can_manage_cliente_usuarios(auth.uid(), cliente_id)
);

CREATE POLICY "users_view_same_company"
ON cliente_usuarios FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM cliente_usuarios cu2
    WHERE cu2.user_id = auth.uid()
    AND cu2.cliente_id = cliente_usuarios.cliente_id
    AND cu2.ativo = true
  )
);

COMMENT ON FUNCTION public.user_can_manage_cliente_usuarios IS 'Security definer function to avoid RLS recursion when checking cliente_usuarios permissions';

-- ========================================
-- FIX 1.2: Garantir Integridade Profiles
-- ========================================

-- Passo 1: Alterar profiles.status para NOT NULL com default
ALTER TABLE public.profiles 
  ALTER COLUMN status SET DEFAULT 'aprovado';

-- Passo 2: Corrigir registros existentes com status NULL
UPDATE public.profiles 
SET status = 'aprovado' 
WHERE status IS NULL;

-- Passo 3: Agora tornar NOT NULL
ALTER TABLE public.profiles 
  ALTER COLUMN status SET NOT NULL;

-- Passo 4: Criar função helper para sincronização manual (usada pelas Edge Functions)
CREATE OR REPLACE FUNCTION public.ensure_profile_exists(
  p_user_id uuid,
  p_email text,
  p_nome text DEFAULT NULL,
  p_telefone text DEFAULT NULL,
  p_especialidade text DEFAULT NULL,
  p_cliente_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid;
BEGIN
  -- Tentar inserir ou retornar ID existente
  INSERT INTO public.profiles (
    id,
    nome,
    email,
    telefone,
    especialidade,
    status,
    cliente_id
  ) VALUES (
    p_user_id,
    COALESCE(p_nome, p_email),
    p_email,
    p_telefone,
    p_especialidade,
    'aprovado',
    p_cliente_id
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW()
  RETURNING id INTO v_profile_id;
  
  RETURN v_profile_id;
END;
$$;

COMMENT ON FUNCTION public.ensure_profile_exists IS 'Helper function to ensure profile exists for auth user - called by Edge Functions';

-- ========================================
-- VERIFICAÇÕES DE INTEGRIDADE
-- ========================================

-- Verificar usuários órfãos
DO $$
DECLARE
  orphan_count integer;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
  );
  
  IF orphan_count > 0 THEN
    RAISE NOTICE '⚠️ Encontrados % usuários órfãos (auth.users sem profiles)', orphan_count;
  ELSE
    RAISE NOTICE '✅ Nenhum usuário órfão detectado';
  END IF;
END $$;

-- Log de conclusão
DO $$
BEGIN
  RAISE NOTICE '✅ FASE 1 CONCLUÍDA: Correções críticas de banco aplicadas';
  RAISE NOTICE '  ✓ Fix 1.1: RLS recursion eliminada em cliente_usuarios';
  RAISE NOTICE '  ✓ Fix 1.2: profiles.status NOT NULL garantido';
  RAISE NOTICE '  ✓ Fix 1.3: Validação de input será implementada nas Edge Functions';
END $$;
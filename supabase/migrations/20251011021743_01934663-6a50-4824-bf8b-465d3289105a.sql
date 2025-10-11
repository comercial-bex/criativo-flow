-- ============================================
-- OPÇÃO 2: FIX DE PERMISSÕES DE SCHEMA
-- ============================================

-- Garantir que o role authenticated pode visualizar metadados do schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA information_schema TO authenticated;

-- Permitir SELECT em information_schema para queries de metadados
GRANT SELECT ON information_schema.tables TO authenticated;
GRANT SELECT ON information_schema.columns TO authenticated;

-- Criar view segura para metadados de tabelas
CREATE OR REPLACE VIEW public.safe_table_metadata AS
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name NOT LIKE 'pg_%'
ORDER BY table_name, ordinal_position;

-- Permitir acesso à view
GRANT SELECT ON public.safe_table_metadata TO authenticated;

-- ============================================
-- OPÇÃO 3: SISTEMA DE HEALTH CHECK AUTOMÁTICO
-- ============================================

-- Tabela para armazenar logs de integridade
CREATE TABLE IF NOT EXISTS public.system_health_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type text NOT NULL,
  status text NOT NULL, -- 'ok', 'warning', 'error'
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Índice para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_health_logs_created 
  ON public.system_health_logs(created_at DESC);

-- Tabela para rastrear integridade de usuários
CREATE TABLE IF NOT EXISTS public.user_integrity_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL,
  has_profile boolean DEFAULT false,
  has_role boolean DEFAULT false,
  is_orphan boolean DEFAULT false,
  last_check timestamptz DEFAULT now(),
  UNIQUE(auth_user_id)
);

-- Função para verificar integridade de usuários
CREATE OR REPLACE FUNCTION public.check_user_integrity()
RETURNS TABLE(
  total_auth_users bigint,
  users_with_profile bigint,
  users_with_role bigint,
  orphan_auth_users bigint,
  orphan_profiles bigint,
  integrity_score numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_auth bigint;
  v_with_profile bigint;
  v_with_role bigint;
  v_orphan_auth bigint;
  v_orphan_profile bigint;
BEGIN
  -- Contar usuários em auth
  SELECT COUNT(*) INTO v_total_auth FROM auth.users;
  
  -- Contar usuários com perfil
  SELECT COUNT(DISTINCT au.id) INTO v_with_profile
  FROM auth.users au
  INNER JOIN public.profiles p ON au.id = p.id;
  
  -- Contar usuários com role
  SELECT COUNT(DISTINCT au.id) INTO v_with_role
  FROM auth.users au
  INNER JOIN public.user_roles ur ON au.id = ur.user_id;
  
  -- Contar órfãos em auth (sem perfil)
  SELECT COUNT(*) INTO v_orphan_auth
  FROM auth.users au
  WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id);
  
  -- Contar órfãos em profiles (sem auth)
  SELECT COUNT(*) INTO v_orphan_profile
  FROM public.profiles p
  WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = p.id);
  
  -- Atualizar tabela de verificações
  TRUNCATE public.user_integrity_checks;
  
  INSERT INTO public.user_integrity_checks (
    auth_user_id, has_profile, has_role, is_orphan
  )
  SELECT 
    au.id,
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id),
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = au.id),
    NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id)
  FROM auth.users au;
  
  -- Registrar log
  INSERT INTO public.system_health_logs (check_type, status, details)
  VALUES (
    'user_integrity',
    CASE 
      WHEN v_orphan_auth > 0 OR v_orphan_profile > 0 THEN 'warning'
      ELSE 'ok'
    END,
    jsonb_build_object(
      'total_auth_users', v_total_auth,
      'users_with_profile', v_with_profile,
      'users_with_role', v_with_role,
      'orphan_auth_users', v_orphan_auth,
      'orphan_profiles', v_orphan_profile
    )
  );
  
  RETURN QUERY SELECT 
    v_total_auth,
    v_with_profile,
    v_with_role,
    v_orphan_auth,
    v_orphan_profile,
    CASE 
      WHEN v_total_auth = 0 THEN 0
      ELSE ROUND((v_with_profile::numeric / v_total_auth::numeric) * 100, 2)
    END;
END;
$$;

-- Função para sincronizar órfãos automaticamente
CREATE OR REPLACE FUNCTION public.auto_sync_orphan_users()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_synced_count integer := 0;
  v_orphan RECORD;
BEGIN
  -- Sincronizar usuários de auth sem perfil
  FOR v_orphan IN 
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = au.id)
  LOOP
    -- Criar perfil
    INSERT INTO public.profiles (id, email, nome, status)
    VALUES (
      v_orphan.id,
      v_orphan.email,
      COALESCE(v_orphan.raw_user_meta_data->>'nome', v_orphan.email),
      'pendente_aprovacao'
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Atribuir role padrão se não tiver
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_orphan.id, 'cliente')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    v_synced_count := v_synced_count + 1;
  END LOOP;
  
  -- Registrar log
  INSERT INTO public.system_health_logs (check_type, status, details)
  VALUES (
    'auto_sync_orphans',
    'ok',
    jsonb_build_object('synced_users', v_synced_count)
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'synced_count', v_synced_count
  );
END;
$$;

-- RLS para as novas tabelas
ALTER TABLE public.system_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_integrity_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver health logs"
  ON public.system_health_logs FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins podem ver integrity checks"
  ON public.user_integrity_checks FOR SELECT
  USING (is_admin(auth.uid()));

-- Comentários
COMMENT ON FUNCTION public.check_user_integrity() IS 
  'Verifica integridade entre auth.users, profiles e user_roles';
COMMENT ON FUNCTION public.auto_sync_orphan_users() IS 
  'Sincroniza automaticamente usuários órfãos criando perfis e roles';
COMMENT ON TABLE public.system_health_logs IS 
  'Armazena logs de verificações de integridade do sistema';
COMMENT ON TABLE public.user_integrity_checks IS 
  'Snapshot da última verificação de integridade de usuários';
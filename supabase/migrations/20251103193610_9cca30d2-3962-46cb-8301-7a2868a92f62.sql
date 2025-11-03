-- Corrigir check_user_integrity() - remover TRUNCATE e tornar STABLE
CREATE OR REPLACE FUNCTION check_user_integrity()
RETURNS TABLE (
  total_auth_users bigint,
  users_with_profile bigint,
  users_with_role bigint,
  orphan_auth_users bigint,
  orphan_profiles bigint,
  integrity_score numeric
) 
LANGUAGE plpgsql 
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH auth_stats AS (
    SELECT COUNT(*) as total_auth
    FROM auth.users
  ),
  profile_stats AS (
    SELECT COUNT(*) as with_profile
    FROM auth.users au
    INNER JOIN pessoas p ON p.profile_id = au.id
  ),
  role_stats AS (
    SELECT COUNT(DISTINCT user_id) as with_role
    FROM user_roles
  ),
  orphan_auth AS (
    SELECT COUNT(*) as orphans
    FROM auth.users au
    WHERE NOT EXISTS (SELECT 1 FROM pessoas p WHERE p.profile_id = au.id)
  ),
  orphan_profiles AS (
    SELECT COUNT(*) as orphans
    FROM pessoas p
    WHERE p.profile_id IS NOT NULL 
      AND NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = p.profile_id)
  )
  SELECT 
    auth_stats.total_auth,
    profile_stats.with_profile,
    role_stats.with_role,
    orphan_auth.orphans,
    orphan_profiles.orphans,
    CASE 
      WHEN auth_stats.total_auth = 0 THEN 100.0
      ELSE ROUND(
        (profile_stats.with_profile::numeric / NULLIF(auth_stats.total_auth, 0)) * 100, 
        2
      )
    END as integrity_score
  FROM auth_stats, profile_stats, role_stats, orphan_auth, orphan_profiles;
END;
$$;

-- Corrigir auto_sync_orphan_users() - usar tabela pessoas e adicionar tratamento de erros
CREATE OR REPLACE FUNCTION auto_sync_orphan_users()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_synced_count integer := 0;
  v_orphan RECORD;
  v_error_msg text;
BEGIN
  -- Sincronizar usuários de auth sem perfil em 'pessoas'
  FOR v_orphan IN 
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    WHERE NOT EXISTS (SELECT 1 FROM pessoas p WHERE p.profile_id = au.id)
    LIMIT 100 -- Limite de segurança
  LOOP
    BEGIN
      -- Criar registro em pessoas
      INSERT INTO pessoas (profile_id, email, nome, status, papeis)
      VALUES (
        v_orphan.id,
        v_orphan.email,
        COALESCE(v_orphan.raw_user_meta_data->>'nome', split_part(v_orphan.email, '@', 1)),
        'pendente',
        ARRAY['especialista']::text[]
      )
      ON CONFLICT (profile_id) DO NOTHING;
      
      -- Atribuir role padrão
      INSERT INTO user_roles (user_id, role)
      VALUES (v_orphan.id, 'cliente')
      ON CONFLICT (user_id, role) DO NOTHING;
      
      v_synced_count := v_synced_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      v_error_msg := SQLERRM;
      RAISE WARNING 'Erro ao sincronizar usuário %: %', v_orphan.email, v_error_msg;
    END;
  END LOOP;
  
  -- Registrar log apenas se tabela existir
  BEGIN
    INSERT INTO system_health_logs (check_type, status, details)
    VALUES (
      'auto_sync_orphans',
      CASE WHEN v_synced_count > 0 THEN 'ok'::text ELSE 'warning'::text END,
      jsonb_build_object(
        'synced_users', v_synced_count,
        'timestamp', now()
      )
    );
  EXCEPTION WHEN undefined_table THEN
    -- Ignorar se tabela não existe
    NULL;
  END;
  
  RETURN jsonb_build_object(
    'success', true,
    'synced_count', v_synced_count
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;
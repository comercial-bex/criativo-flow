-- Função de diagnóstico para encontrar usuários órfãos
-- (usuários no Auth sem perfil correspondente)
CREATE OR REPLACE FUNCTION public.find_orphan_auth_users()
RETURNS TABLE (
  auth_user_id uuid,
  email text,
  created_at timestamptz,
  has_profile boolean,
  user_metadata jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    au.id as auth_user_id,
    au.email,
    au.created_at,
    (p.id IS NOT NULL) as has_profile,
    au.raw_user_meta_data as user_metadata
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  WHERE p.id IS NULL
  ORDER BY au.created_at DESC;
$$;

COMMENT ON FUNCTION public.find_orphan_auth_users() IS 
'Diagnóstico: Encontra usuários existentes no Auth (auth.users) que não possuem perfil correspondente na tabela profiles. Útil para identificar registros órfãos que precisam de recuperação.';
-- Recriar usuário admin com todas as relações corretas
DO $$
DECLARE
  v_user_id uuid;
  v_encrypted_password text;
BEGIN
  -- Limpar completamente o usuário existente
  DELETE FROM auth.identities WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'wevertonnelluty@gmail.com'
  );
  
  DELETE FROM public.user_roles WHERE user_id IN (
    SELECT id FROM public.profiles WHERE email = 'wevertonnelluty@gmail.com'
  );
  
  DELETE FROM public.profiles WHERE email = 'wevertonnelluty@gmail.com';
  
  DELETE FROM auth.users WHERE email = 'wevertonnelluty@gmail.com';
  
  -- Gerar novo ID e senha criptografada
  v_user_id := gen_random_uuid();
  v_encrypted_password := crypt('123456', gen_salt('bf'));
  
  -- 1. Criar usuário no auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    is_super_admin,
    confirmation_token,
    recovery_token
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'wevertonnelluty@gmail.com',
    v_encrypted_password,
    now(),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nome":"Admin Weverton"}'::jsonb,
    'authenticated',
    'authenticated',
    false,
    '',
    ''
  );

  -- 2. Criar identidade na auth.identities
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    provider,
    identity_data,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    v_user_id::text,
    'email',
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', 'wevertonnelluty@gmail.com',
      'email_verified', true
    ),
    now(),
    now(),
    now()
  );

  -- 3. Criar profile
  INSERT INTO public.profiles (
    id,
    nome,
    email,
    status,
    especialidade,
    cliente_id,
    role_requested,
    email_verified_at
  ) VALUES (
    v_user_id,
    'Admin Weverton',
    'wevertonnelluty@gmail.com',
    'aprovado',
    NULL,
    NULL,
    'admin',
    now()
  );

  -- 4. Atribuir role admin
  INSERT INTO public.user_roles (
    user_id,
    role
  ) VALUES (
    v_user_id,
    'admin'
  );

  RAISE NOTICE '✅ Usuário admin criado completo: % (wevertonnelluty@gmail.com)', v_user_id;
END $$;
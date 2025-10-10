-- Limpar usuário admin criado incorretamente e criar novamente
DO $$
DECLARE
  v_user_id uuid;
  v_encrypted_password text;
BEGIN
  -- Remover usuário existente se houver
  DELETE FROM public.user_roles WHERE user_id IN (
    SELECT id FROM public.profiles WHERE email = 'wevertonnelluty@gmail.com'
  );
  
  DELETE FROM public.profiles WHERE email = 'wevertonnelluty@gmail.com';
  
  DELETE FROM auth.users WHERE email = 'wevertonnelluty@gmail.com';
  
  -- Criar novo usuário com ID fixo
  v_user_id := gen_random_uuid();
  v_encrypted_password := crypt('123456', gen_salt('bf'));
  
  -- Inserir no auth.users
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
    is_super_admin
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
    false
  );

  -- Inserir profile (sem especialidade para admin)
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
    NULL,  -- Admin não tem especialidade
    NULL,  -- Admin não tem cliente
    'admin',
    now()
  );

  -- Atribuir role admin
  INSERT INTO public.user_roles (
    user_id,
    role
  ) VALUES (
    v_user_id,
    'admin'
  );

  RAISE NOTICE '✅ Usuário admin criado: % (wevertonnelluty@gmail.com)', v_user_id;
END $$;
-- Criar usuário admin wevertonnelluty@gmail.com
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
  encrypted_password text;
BEGIN
  -- Criar usuário no auth.users
  encrypted_password := crypt('123456', gen_salt('bf'));
  
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'wevertonnelluty@gmail.com',
    encrypted_password,
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nome":"Admin Weverton"}'::jsonb,
    'authenticated',
    'authenticated'
  );

  -- Criar profile
  INSERT INTO public.profiles (
    id,
    nome,
    email,
    status
  ) VALUES (
    new_user_id,
    'Admin Weverton',
    'wevertonnelluty@gmail.com',
    'aprovado'
  );

  -- Atribuir role admin
  INSERT INTO public.user_roles (
    user_id,
    role
  ) VALUES (
    new_user_id,
    'admin'
  );

  RAISE NOTICE 'Usuário admin criado com sucesso: %', new_user_id;
END $$;
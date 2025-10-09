-- =====================================================
-- FASE 1: MELHORIAS NOS ADMINISTRADORES
-- =====================================================

-- 1.1 Atualizar Jefferson (NÃO verificar email, conforme solicitado)
UPDATE public.profiles
SET 
  role_requested = 'admin',
  updated_at = NOW()
WHERE email = 'jefferson@agenciabex.com.br';

-- 1.2 Atualizar Gabriel Brito (verificar email + corrigir especialidade)
UPDATE public.profiles
SET 
  email_verified_at = NOW(),
  role_requested = 'admin',
  especialidade = NULL, -- Admins não são especialistas
  updated_at = NOW()
WHERE email = 'xgabrielb634@gmail.com';

-- =====================================================
-- FASE 2: LIMPEZA DE ÓRFÃOS
-- =====================================================

-- 2.1 Deletar os 10 usuários órfãos (sem log, pois cliente_id é obrigatório)
DELETE FROM auth.users
WHERE id IN (
  '7dd4c669-5a7b-4f3b-920d-d94f47ca1675', -- catherinefelicio12@gmail.com
  'f31cbdb8-f3fa-4eb7-be41-8f2c09f492a5', -- reintegrar.bex1@gmail.com
  'a8d6e01f-cd85-462c-ab01-9bd7a9aa681d', -- reintegrar.bex@gmail.com
  'e31bd5e6-c67e-491c-8cdf-0167b9c4ccfe', -- brunoloska@abstartups.com.br
  'f04508ef-2101-4aec-bb5f-61005eeaff9a', -- felipe@grupomadretereza.com
  '2582275f-de44-4810-aaf1-0ac1704172d3', -- victoria.grs.bex@gmail.com
  '8b1aa436-36e1-40fc-bc58-ee7da0846182', -- victoriacardoso81103@gmail.com
  'e1a24580-3db1-4c25-b172-fce080abcc7c', -- rszagalo@gmail.com
  '21287186-b1c3-4e54-b6b2-f585e2c0c855', -- comercial@agenciabex.com.br
  'b8139090-af82-46af-be4e-54ce7ce2fc7d'  -- eduardo.cqc@gmail.com
);

-- =====================================================
-- FASE 3: PREVENÇÃO FUTURA
-- =====================================================

-- 3.1 Atualizar Trigger handle_new_user() para SEMPRE criar profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_nome text;
  v_email text;
  v_especialidade text;
  v_cliente_id uuid;
BEGIN
  v_nome := COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email);
  v_email := NEW.email;
  v_especialidade := NEW.raw_user_meta_data->>'especialidade';
  v_cliente_id := (NEW.raw_user_meta_data->>'cliente_id')::uuid;
  
  -- SEMPRE inserir profile (evita órfãos)
  INSERT INTO public.profiles (
    id, 
    nome, 
    email, 
    status,
    especialidade,
    cliente_id,
    role_requested
  ) VALUES (
    NEW.id,
    v_nome,
    v_email,
    'pendente_aprovacao',
    v_especialidade,
    v_cliente_id,
    CASE 
      WHEN v_especialidade IS NOT NULL THEN v_especialidade
      WHEN v_cliente_id IS NOT NULL THEN 'cliente'
      ELSE 'usuario'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE '✅ Profile criado: id=%, email=%', NEW.id, v_email;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '❌ Erro ao criar profile: % - %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$function$;

-- 3.2 Criar função de verificação de órfãos
CREATE OR REPLACE FUNCTION public.check_orphan_users()
RETURNS TABLE(
  orphan_count integer,
  orphan_emails text[]
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    COUNT(*)::integer as orphan_count,
    ARRAY_AGG(au.email) as orphan_emails
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = au.id
  );
$$;
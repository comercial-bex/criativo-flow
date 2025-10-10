-- Corrigir trigger handle_new_user para evitar erros de tipo
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_nome text;
  v_email text;
  v_especialidade especialidade_type;
  v_cliente_id uuid;
  v_role_requested text;
BEGIN
  v_nome := COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email);
  v_email := NEW.email;
  v_cliente_id := (NEW.raw_user_meta_data->>'cliente_id')::uuid;
  v_role_requested := NEW.raw_user_meta_data->>'role_requested';
  
  -- Converter especialidade de texto para enum (se aplicável)
  BEGIN
    IF NEW.raw_user_meta_data->>'especialidade' IS NOT NULL THEN
      v_especialidade := (NEW.raw_user_meta_data->>'especialidade')::especialidade_type;
    ELSE
      v_especialidade := NULL;
    END IF;
  EXCEPTION 
    WHEN invalid_text_representation THEN
      v_especialidade := NULL;
      RAISE NOTICE 'Especialidade inválida ignorada: %', NEW.raw_user_meta_data->>'especialidade';
  END;
  
  -- Inserir ou atualizar profile
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
    NEW.id,
    v_nome,
    v_email,
    'pendente_aprovacao',
    v_especialidade,
    v_cliente_id,
    COALESCE(v_role_requested, 
      CASE 
        WHEN v_especialidade IS NOT NULL THEN v_especialidade::text
        WHEN v_cliente_id IS NOT NULL THEN 'cliente'
        ELSE 'usuario'
      END
    ),
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN NEW.email_confirmed_at ELSE NULL END
  )
  ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    especialidade = EXCLUDED.especialidade,
    cliente_id = EXCLUDED.cliente_id,
    email_verified_at = EXCLUDED.email_verified_at;
  
  RAISE NOTICE '✅ Profile criado/atualizado: id=%, email=%', NEW.id, v_email;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '❌ Erro ao criar profile: % - %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$function$;
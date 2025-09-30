-- FASE 2: Melhorar função handle_new_user() com logging de erros

-- Recriar a função com tratamento de erros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nome text;
  v_email text;
BEGIN
  -- Extrair dados do novo usuário
  v_nome := COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email);
  v_email := NEW.email;
  
  -- Log para debug (será removido depois)
  RAISE NOTICE 'Tentando criar profile: id=%, nome=%, email=%', NEW.id, v_nome, v_email;
  
  -- Inserir na tabela profiles
  INSERT INTO public.profiles (id, nome, email, status)
  VALUES (
    NEW.id,
    v_nome,
    v_email,
    'pendente_aprovacao'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Profile criado com sucesso: id=%', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro
    RAISE WARNING 'Erro ao criar profile: % - %', SQLERRM, SQLSTATE;
    -- Não bloquear o signup, apenas logar o erro
    RETURN NEW;
END;
$$;
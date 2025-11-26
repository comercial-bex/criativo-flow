-- ================================================================
-- MIGRATION: Remove problematic triggers first
-- ================================================================

-- Dropar FUNÇÃO que causa problema
DROP FUNCTION IF EXISTS public.sync_user_roles_papeis() CASCADE;

-- Agora dropar outros triggers
DROP TRIGGER IF EXISTS trg_validate_pessoa_cliente ON public.pessoas CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- Recriar validação (só para aprovados)
CREATE OR REPLACE FUNCTION public.validate_pessoa_cliente_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF 'cliente' = ANY(NEW.papeis) AND NEW.status = 'aprovado' 
     AND (NEW.cpf_cnpj IS NULL OR NEW.cpf_cnpj = '') THEN
    RAISE EXCEPTION 'CPF/CNPJ obrigatório para clientes aprovados';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_pessoa_cliente
  BEFORE INSERT OR UPDATE ON public.pessoas
  FOR EACH ROW EXECUTE FUNCTION public.validate_pessoa_cliente_fields();

-- Criar handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.pessoas (profile_id, nome, email, telefones, papeis, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE WHEN NEW.raw_user_meta_data->>'telefone' IS NOT NULL 
      THEN ARRAY[NEW.raw_user_meta_data->>'telefone'] ELSE ARRAY[]::text[] END,
    CASE WHEN NEW.raw_user_meta_data->>'especialidade' IS NOT NULL
      THEN ARRAY['especialista', NEW.raw_user_meta_data->>'especialidade']
      ELSE ARRAY['cliente'] END,
    'pendente_aprovacao'
  ) ON CONFLICT (profile_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS policies
DROP POLICY IF EXISTS "service_role_insert_pessoas" ON public.pessoas;
DROP POLICY IF EXISTS "service_role_update_pessoas" ON public.pessoas;

CREATE POLICY "service_role_insert_pessoas" ON public.pessoas
  FOR INSERT TO service_role WITH CHECK (true);
  
CREATE POLICY "service_role_update_pessoas" ON public.pessoas
  FOR UPDATE TO service_role USING (true) WITH CHECK (true);
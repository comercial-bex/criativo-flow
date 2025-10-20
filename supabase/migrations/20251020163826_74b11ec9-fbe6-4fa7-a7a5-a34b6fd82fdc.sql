-- Sprint 1B: Fix user_roles table and sync function
-- Objetivo: Corrigir erro 400 ao atualizar pessoas e garantir sincronização de permissões

-- 1️⃣ Adicionar coluna updated_at em user_roles (se não existir)
ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2️⃣ Garantir um único papel por usuário
DO $$
DECLARE 
  cname text;
BEGIN
  -- Remover UNIQUE(user_id, role) se existir (busca direta no pg_constraint)
  SELECT conname INTO cname
  FROM pg_constraint
  WHERE conrelid = 'public.user_roles'::regclass
    AND contype = 'u'
    AND array_length(conkey, 1) = 2
    AND EXISTS (
      SELECT 1 FROM pg_attribute
      WHERE attrelid = conrelid
        AND attnum = ANY(conkey)
        AND attname IN ('user_id', 'role')
    );
  
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.user_roles DROP CONSTRAINT %I', cname);
  END IF;

  -- Deduplicar (manter a mais recente por user_id)
  WITH ranked AS (
    SELECT id, user_id, created_at,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC, id DESC) AS rn
    FROM public.user_roles
  )
  DELETE FROM public.user_roles ur
  USING ranked r
  WHERE ur.id = r.id AND r.rn > 1;

  -- Criar UNIQUE(user_id) se ainda não existir
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_roles_user_id_key'
      AND conrelid = 'public.user_roles'::regclass
  ) THEN
    ALTER TABLE public.user_roles
    ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 3️⃣ Criar trigger de updated_at para user_roles
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;

CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4️⃣ Recriar função de sincronização com EXCLUDED.role correto
CREATE OR REPLACE FUNCTION public.sync_especialidade_to_user_role()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role_sistema_value user_role;
BEGIN
  -- Buscar o role_sistema da especialidade selecionada
  IF NEW.especialidade_id IS NOT NULL THEN
    SELECT e.role_sistema INTO role_sistema_value
    FROM public.especialidades e
    WHERE e.id = NEW.especialidade_id;

    -- Sincronizar com user_roles se tiver profile_id e role válido
    IF NEW.profile_id IS NOT NULL AND role_sistema_value IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.profile_id, role_sistema_value)
      ON CONFLICT (user_id)
      DO UPDATE SET 
        role = EXCLUDED.role,
        updated_at = now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- ✅ Comentários finais
COMMENT ON FUNCTION public.sync_especialidade_to_user_role() IS 
'Sincroniza especialidade_id → user_roles.role automaticamente ao inserir/atualizar pessoa';

COMMENT ON COLUMN public.user_roles.updated_at IS 
'Timestamp de última atualização do papel do usuário';
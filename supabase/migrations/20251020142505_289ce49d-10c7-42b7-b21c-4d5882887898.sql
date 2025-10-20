-- ============================================
-- Migration: Adicionar Foreign Key user_roles -> pessoas
-- Razão: Edge Function admin-user-management precisa da FK 
--        para fazer JOIN automático via PostgREST
-- Correção: profiles é VIEW, FK deve apontar para pessoas.profile_id
-- ============================================

-- 1️⃣ Adicionar Foreign Key (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_roles_user_id_fkey'
      AND table_name = 'user_roles'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.user_roles 
    ADD CONSTRAINT user_roles_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.pessoas(profile_id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE '✅ Foreign Key user_roles_user_id_fkey criada com sucesso';
  ELSE
    RAISE NOTICE '⚠️ Foreign Key já existe, pulando...';
  END IF;
END $$;

-- 2️⃣ Criar índice adicional para otimizar JOIN (se não existir)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id 
ON public.user_roles(user_id);

-- 3️⃣ Criar índices adicionais para otimizar queries futuras na tabela pessoas
CREATE INDEX IF NOT EXISTS idx_pessoas_profile_id 
ON public.pessoas(profile_id) 
WHERE profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pessoas_email 
ON public.pessoas(email);

CREATE INDEX IF NOT EXISTS idx_pessoas_status 
ON public.pessoas(status);

-- 4️⃣ Atualizar comentários para documentação
COMMENT ON CONSTRAINT user_roles_user_id_fkey ON public.user_roles IS 
'FK para pessoas.profile_id - necessária para JOIN automático via PostgREST na view profiles';

COMMENT ON INDEX idx_user_roles_user_id IS 
'Otimiza JOIN entre user_roles e pessoas/profiles';
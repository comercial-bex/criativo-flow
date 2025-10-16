-- Permitir emails duplicados na tabela pessoas
-- Remove a constraint de unicidade do campo email
ALTER TABLE public.pessoas DROP CONSTRAINT IF EXISTS pessoas_email_key;

-- Remover índice único de email se existir
DROP INDEX IF EXISTS public.pessoas_email_key;
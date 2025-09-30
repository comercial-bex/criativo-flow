-- FASE 1: Corrigir políticas RLS para permitir signup automático

-- Remover política de INSERT que bloqueia o signup
DROP POLICY IF EXISTS "Usuários podem criar próprio perfil" ON public.profiles;

-- Criar nova política de INSERT que permite criação durante signup
-- Esta política permite que o trigger handle_new_user() crie o profile
CREATE POLICY "Sistema pode criar perfis durante signup"
ON public.profiles
FOR INSERT
WITH CHECK (true);

-- Manter as políticas de segurança para SELECT e UPDATE
-- Estas garantem que usuários só vejam/editem seus próprios dados após login
-- FASE 3: Restringir Política de INSERT em profiles

-- 1. Remover política permissiva atual
DROP POLICY IF EXISTS "Sistema pode criar perfis durante signup" ON public.profiles;

-- 2. Criar política segura
CREATE POLICY "Sistema pode criar perfis durante signup"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Usuário só pode criar seu próprio perfil OU admin pode criar qualquer perfil
  auth.uid() = id OR is_admin(auth.uid())
);
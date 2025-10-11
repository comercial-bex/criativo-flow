-- FASE 2: Limpar Políticas RLS Duplicadas em user_roles

-- 1. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Admins e gestores podem inserir roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins e gestores podem atualizar roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins e gestores podem deletar roles" ON public.user_roles;
DROP POLICY IF EXISTS "Usuários podem ver todos os papéis" ON public.user_roles;
DROP POLICY IF EXISTS "Admins podem gerenciar roles" ON public.user_roles;
DROP POLICY IF EXISTS "Usuários autenticados podem ver roles" ON public.user_roles;

-- 2. Criar apenas 2 políticas consolidadas e seguras

-- SELECT: Usuários autenticados podem ver roles (necessário para useUserRole)
CREATE POLICY "Usuários autenticados podem ver roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ALL: Apenas admins podem gerenciar roles (INSERT/UPDATE/DELETE)
CREATE POLICY "Apenas admins podem gerenciar roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));
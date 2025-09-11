-- Tighten RLS on clientes to restrict sensitive data access
-- 1) Drop overly broad policies
DROP POLICY IF EXISTS "Usuários autenticados podem ver clientes" ON public.clientes;
DROP POLICY IF EXISTS "Usuários podem criar clientes" ON public.clientes;

-- 2) Create role-based SELECT policy allowing only authorized personnel
CREATE POLICY "Acesso a clientes por papel ou responsável"
ON public.clientes
FOR SELECT
TO authenticated
USING (
  auth.uid() = responsavel_id
  OR is_admin(auth.uid())
  OR get_user_role(auth.uid()) = 'gestor'::user_role
  OR get_user_role(auth.uid()) = 'financeiro'::user_role
  OR get_user_role(auth.uid()) = 'atendimento'::user_role
  OR get_user_role(auth.uid()) = 'grs'::user_role
);

-- 3) Restrict who can create clientes
CREATE POLICY "Somente papéis autorizados criam clientes"
ON public.clientes
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin(auth.uid())
  OR get_user_role(auth.uid()) = 'gestor'::user_role
  OR get_user_role(auth.uid()) = 'financeiro'::user_role
  OR get_user_role(auth.uid()) = 'atendimento'::user_role
  OR get_user_role(auth.uid()) = 'grs'::user_role
);

-- Keep existing UPDATE policy (responsável ou admin) as-is to avoid breaking workflows

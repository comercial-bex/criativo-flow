-- FASE 1: Corrigir políticas RLS da tabela user_roles para permitir gestores atualizarem roles

-- Remover política existente que só permite admins
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Criar novas políticas mais flexíveis
CREATE POLICY "Admins e gestores podem atualizar roles" 
ON public.user_roles 
FOR UPDATE 
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) = 'gestor'::user_role
);

CREATE POLICY "Admins e gestores podem inserir roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) = 'gestor'::user_role
);

CREATE POLICY "Admins e gestores podem deletar roles" 
ON public.user_roles 
FOR DELETE 
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) = 'gestor'::user_role
);

CREATE POLICY "Usuários autenticados podem ver roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);
-- Fix security issue: Restrict access to propostas table with sensitive business data
-- Implement role-based access controls to protect business proposals and pricing information

-- Update the current policies on propostas table to be more restrictive

-- Drop the current policy if it's too permissive
DROP POLICY IF EXISTS "Usuários autenticados podem ver propostas" ON public.propostas;

-- Create stricter, role-based policies for propostas access

-- Policy 1: Only admins, managers, and responsible users can view proposals
CREATE POLICY "Acesso restrito a propostas por papel" 
ON public.propostas 
FOR SELECT 
USING (
  is_admin(auth.uid()) OR 
  auth.uid() = responsavel_id OR
  get_user_role(auth.uid()) = 'gestor'::user_role OR
  get_user_role(auth.uid()) = 'financeiro'::user_role OR
  get_user_role(auth.uid()) = 'atendimento'::user_role
);

-- Policy 2: Restrict updates to responsible users and admins only
DROP POLICY IF EXISTS "Responsáveis e admins podem atualizar propostas" ON public.propostas;

CREATE POLICY "Atualização restrita de propostas" 
ON public.propostas 
FOR UPDATE 
USING (
  is_admin(auth.uid()) OR 
  auth.uid() = responsavel_id
);

-- Policy 3: Restrict creation to authorized roles only
DROP POLICY IF EXISTS "Usuários podem criar propostas" ON public.propostas;

CREATE POLICY "Criação restrita de propostas" 
ON public.propostas 
FOR INSERT 
WITH CHECK (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) = 'gestor'::user_role OR
  get_user_role(auth.uid()) = 'financeiro'::user_role OR
  get_user_role(auth.uid()) = 'atendimento'::user_role
);
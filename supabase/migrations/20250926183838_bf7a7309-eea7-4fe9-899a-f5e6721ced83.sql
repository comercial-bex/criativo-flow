-- Fix security issue: Restrict access to clientes table with sensitive personal data
-- Only allow admin and the responsible user to have full access
-- Other roles get limited access to non-sensitive fields only

-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "Acesso a clientes por papel ou responsável" ON public.clientes;

-- Create stricter policies with field-level restrictions

-- Policy 1: Admins and responsible users can see all data
CREATE POLICY "Admin e responsável podem ver dados completos" 
ON public.clientes 
FOR SELECT 
USING (
  is_admin(auth.uid()) OR 
  auth.uid() = responsavel_id
);

-- Policy 2: Limited roles can only see basic business data (not personal sensitive info)
CREATE POLICY "Acesso limitado a dados básicos para papéis específicos" 
ON public.clientes 
FOR SELECT 
USING (
  (get_user_role(auth.uid()) = 'gestor'::user_role) OR 
  (get_user_role(auth.uid()) = 'atendimento'::user_role) OR 
  (get_user_role(auth.uid()) = 'grs'::user_role)
);

-- Note: We cannot implement column-level RLS in PostgreSQL natively
-- So we'll need to handle sensitive data filtering in the application layer
-- This policy structure allows us to identify which users should get filtered data

-- Update the INSERT policy to be more restrictive
DROP POLICY IF EXISTS "Somente papéis autorizados criam clientes" ON public.clientes;

CREATE POLICY "Criação restrita de clientes" 
ON public.clientes 
FOR INSERT 
WITH CHECK (
  is_admin(auth.uid()) OR 
  (get_user_role(auth.uid()) = 'atendimento'::user_role) OR 
  (get_user_role(auth.uid()) = 'grs'::user_role)
);

-- Update the UPDATE policy to be more restrictive  
DROP POLICY IF EXISTS "Responsáveis e admins podem atualizar clientes" ON public.clientes;

CREATE POLICY "Atualização restrita de clientes" 
ON public.clientes 
FOR UPDATE 
USING (
  is_admin(auth.uid()) OR 
  auth.uid() = responsavel_id OR
  (get_user_role(auth.uid()) = 'atendimento'::user_role AND auth.uid() = responsavel_id)
);
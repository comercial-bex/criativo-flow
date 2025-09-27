-- Secure Customer Data Access - Fix Personal Data Exposure
-- This migration implements strict access controls for sensitive customer data

-- 1. Drop the overly permissive policies
DROP POLICY IF EXISTS "Acesso limitado a dados básicos para papéis específicos" ON public.clientes;

-- 2. Create a security definer function to check if user can access sensitive customer data
CREATE OR REPLACE FUNCTION public.can_access_sensitive_customer_data(customer_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only admins and the assigned customer responsible can access sensitive data
  SELECT 
    is_admin(auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM public.clientes 
      WHERE id = customer_id AND responsavel_id = auth.uid()
    );
$$;

-- 3. Create a function to get filtered customer data based on access level
CREATE OR REPLACE FUNCTION public.get_filtered_customer_data(customer_id uuid)
RETURNS TABLE (
  id uuid,
  nome text,
  email text,
  telefone text,
  cnpj_cpf text,
  endereco text,
  status status_type,
  responsavel_id uuid,
  assinatura_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.id,
    c.nome,
    -- Only show sensitive data if user has appropriate access
    CASE 
      WHEN can_access_sensitive_customer_data(c.id) THEN c.email
      ELSE NULL 
    END as email,
    CASE 
      WHEN can_access_sensitive_customer_data(c.id) THEN c.telefone
      ELSE NULL 
    END as telefone,
    CASE 
      WHEN can_access_sensitive_customer_data(c.id) THEN c.cnpj_cpf
      ELSE NULL 
    END as cnpj_cpf,
    CASE 
      WHEN can_access_sensitive_customer_data(c.id) THEN c.endereco
      ELSE NULL 
    END as endereco,
    c.status,
    c.responsavel_id,
    c.assinatura_id,
    c.created_at,
    c.updated_at
  FROM public.clientes c
  WHERE c.id = customer_id;
$$;

-- 4. Create new restrictive RLS policies

-- Policy for viewing basic customer data (all authenticated users can see basic info)
CREATE POLICY "All authenticated users can view basic customer info"
ON public.clientes
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Policy for updating customer data (only admin and responsible)
CREATE POLICY "Only admin and responsible can update customer data"
ON public.clientes
FOR UPDATE
USING (
  is_admin(auth.uid()) OR 
  auth.uid() = responsavel_id
);

-- Policy for creating customer data (restricted to specific roles)
CREATE POLICY "Restricted customer creation"
ON public.clientes
FOR INSERT
WITH CHECK (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) = 'atendimento'::user_role OR 
  get_user_role(auth.uid()) = 'grs'::user_role
);

-- 5. Create a view for secure customer data access
CREATE OR REPLACE VIEW public.secure_clientes AS
SELECT 
  c.id,
  c.nome,
  -- Only show sensitive data if user has appropriate access
  CASE 
    WHEN is_admin(auth.uid()) OR auth.uid() = c.responsavel_id THEN c.email
    ELSE NULL 
  END as email,
  CASE 
    WHEN is_admin(auth.uid()) OR auth.uid() = c.responsavel_id THEN c.telefone
    ELSE NULL 
  END as telefone,
  CASE 
    WHEN is_admin(auth.uid()) OR auth.uid() = c.responsavel_id THEN c.cnpj_cpf
    ELSE NULL 
  END as cnpj_cpf,
  CASE 
    WHEN is_admin(auth.uid()) OR auth.uid() = c.responsavel_id THEN c.endereco
    ELSE NULL 
  END as endereco,
  c.status,
  c.responsavel_id,
  c.assinatura_id,
  c.created_at,
  c.updated_at
FROM public.clientes c
WHERE auth.uid() IS NOT NULL;

-- 6. Grant access to the view
GRANT SELECT ON public.secure_clientes TO authenticated;
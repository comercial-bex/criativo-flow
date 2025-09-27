-- Fix SQL aggregate function error and improve customer data protection

-- 1. Drop the existing function to fix the SQL error
DROP FUNCTION IF EXISTS public.get_filtered_customers_list();

-- 2. Create a corrected function to get multiple filtered customer records
CREATE OR REPLACE FUNCTION public.get_filtered_customers_list()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_agg(
    filtered_customer ORDER BY (filtered_customer->>'created_at')::timestamp DESC
  )
  FROM (
    SELECT 
      CASE 
        -- If user is admin or responsible for this customer, return all data
        WHEN is_admin(auth.uid()) OR auth.uid() = c.responsavel_id
        THEN
          to_jsonb(c.*) 
        -- If user has read access but not sensitive access, return filtered data
        WHEN auth.uid() IS NOT NULL THEN
          jsonb_build_object(
            'id', c.id,
            'nome', c.nome,
            'status', c.status,
            'responsavel_id', c.responsavel_id,
            'assinatura_id', c.assinatura_id,
            'created_at', c.created_at,
            'updated_at', c.updated_at,
            'email', NULL,
            'telefone', NULL,
            'cnpj_cpf', NULL,
            'endereco', NULL
          )
        ELSE
          NULL
      END as filtered_customer
    FROM public.clientes c 
    WHERE auth.uid() IS NOT NULL
    ORDER BY c.created_at DESC
  ) subquery
  WHERE filtered_customer IS NOT NULL;
$$;
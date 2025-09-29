-- CRITICAL SECURITY FIX: Restrict access to social media tokens
-- Remove the overly permissive policy that allows any authenticated user to see all tokens
DROP POLICY IF EXISTS "Users can view client social integrations" ON public.social_integrations_cliente;

-- Create a secure policy that only allows access to token owners and authorized users
CREATE POLICY "Secure access to client social integrations" 
ON public.social_integrations_cliente 
FOR SELECT 
USING (
  -- Only allow access if user is:
  -- 1. Admin
  is_admin(auth.uid()) OR 
  -- 2. The person who connected the integration
  (auth.uid() = connected_by) OR
  -- 3. The responsible user for this specific client
  (EXISTS (
    SELECT 1 FROM clientes c 
    WHERE c.id = social_integrations_cliente.cliente_id 
    AND c.responsavel_id = auth.uid()
  )) OR
  -- 4. A client user who belongs to this specific client
  (EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.cliente_id = social_integrations_cliente.cliente_id
  ))
);

-- Also update the management policy to be more restrictive for token modifications
DROP POLICY IF EXISTS "Users can manage client social integrations" ON public.social_integrations_cliente;

CREATE POLICY "Secure management of client social integrations" 
ON public.social_integrations_cliente 
FOR ALL 
USING (
  -- Only allow management if user is:
  -- 1. Admin
  is_admin(auth.uid()) OR 
  -- 2. The responsible user for this specific client
  (EXISTS (
    SELECT 1 FROM clientes c 
    WHERE c.id = social_integrations_cliente.cliente_id 
    AND c.responsavel_id = auth.uid()
  ))
);

-- Add an additional security function to mask sensitive token data for non-owners
CREATE OR REPLACE FUNCTION public.get_masked_social_integration(integration_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      -- If user is admin or responsible for the client, return full data
      WHEN is_admin(auth.uid()) OR 
           (EXISTS (
             SELECT 1 FROM clientes c, social_integrations_cliente sic
             WHERE c.id = sic.cliente_id 
             AND sic.id = integration_id
             AND c.responsavel_id = auth.uid()
           )) OR
           (EXISTS (
             SELECT 1 FROM social_integrations_cliente sic
             WHERE sic.id = integration_id
             AND sic.connected_by = auth.uid()
           ))
      THEN
        to_jsonb(sic.*) 
      -- Otherwise return data without sensitive tokens
      ELSE
        jsonb_build_object(
          'id', sic.id,
          'cliente_id', sic.cliente_id,
          'provider', sic.provider,
          'account_name', sic.account_name,
          'account_id', sic.account_id,
          'is_active', sic.is_active,
          'created_at', sic.created_at,
          'updated_at', sic.updated_at,
          'access_token', '***HIDDEN***',
          'refresh_token', '***HIDDEN***'
        )
    END
  FROM social_integrations_cliente sic
  WHERE sic.id = integration_id;
$$;
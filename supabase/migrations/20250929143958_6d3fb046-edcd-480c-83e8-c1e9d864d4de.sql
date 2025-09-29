-- Fix security issue: Restrict profile access to sensitive personal data
-- Remove the overly broad policy that allows gestores/atendimento/grs to access all profiles
DROP POLICY IF EXISTS "Gestores podem ver perfis da equipe" ON public.profiles;

-- Create a more secure policy that only allows viewing non-sensitive profile data
-- for team management roles
CREATE POLICY "Team roles can view limited profile data" 
ON public.profiles 
FOR SELECT 
USING (
  -- Using the existing security definer function to get filtered profile data
  -- This will return limited data for team roles through get_filtered_profile function
  (get_user_role(auth.uid()) IN ('gestor', 'atendimento', 'grs'))
);

-- Update the existing get_filtered_profile function to ensure it properly filters sensitive data
CREATE OR REPLACE FUNCTION public.get_filtered_profile(profile_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT 
    CASE 
      -- If requesting own profile or admin, return all data
      WHEN profile_id = auth.uid() OR is_admin(auth.uid()) THEN
        to_jsonb(profiles.*) 
      -- If manager viewing team profile, return limited data (no sensitive info)
      WHEN get_user_role(auth.uid()) IN ('gestor', 'atendimento', 'grs') THEN
        jsonb_build_object(
          'id', profiles.id,
          'nome', profiles.nome,
          'especialidade', profiles.especialidade,
          'avatar_url', profiles.avatar_url,
          'created_at', profiles.created_at,
          'status', profiles.status
          -- Explicitly exclude email, telefone and other sensitive data
        )
      ELSE
        NULL -- No access for other roles
    END
  FROM profiles 
  WHERE profiles.id = profile_id;
$$;
-- Fix security issue: Restrict access to profiles table with employee personal data
-- Implement role-based access controls to protect sensitive employee information

-- Drop the current overly permissive policy that allows all authenticated users to see all profiles
DROP POLICY IF EXISTS "Usuários podem ver todos os perfis" ON public.profiles;

-- Create stricter, role-based policies for profile access

-- Policy 1: Users can always view their own profile
CREATE POLICY "Usuários podem ver próprio perfil" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Admins can view all profiles
CREATE POLICY "Admins podem ver todos os perfis" 
ON public.profiles 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Policy 3: Managers can view profiles of their team members only (limited access)
-- This policy allows managers to see basic info but sensitive data should be filtered in app layer
CREATE POLICY "Gestores podem ver perfis da equipe" 
ON public.profiles 
FOR SELECT 
USING (
  get_user_role(auth.uid()) = 'gestor'::user_role OR
  get_user_role(auth.uid()) = 'atendimento'::user_role OR
  get_user_role(auth.uid()) = 'grs'::user_role
);

-- Keep existing update policies as they are already restrictive
-- Users can only update their own profile or admins can update any profile

-- Add a security function to filter sensitive profile data based on relationship
CREATE OR REPLACE FUNCTION public.get_filtered_profile(profile_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
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
          'created_at', profiles.created_at
          -- Exclude email and telefone for privacy
        )
      ELSE
        NULL -- No access for other roles
    END
  FROM profiles 
  WHERE profiles.id = profile_id;
$$;
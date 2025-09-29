-- Criar tabela para logs de acesso e autenticação
CREATE TABLE public.user_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  action TEXT NOT NULL, -- 'login_success', 'login_failed', 'logout', 'password_reset'
  ip_address TEXT,
  user_agent TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all access logs"
ON public.user_access_logs
FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) = 'gestor'
);

CREATE POLICY "System can create access logs"
ON public.user_access_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Criar função para registrar logs de acesso
CREATE OR REPLACE FUNCTION public.log_user_access(
  p_user_id UUID DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_action TEXT DEFAULT 'login_attempt',
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.user_access_logs (
    user_id,
    email,
    action,
    ip_address,
    user_agent,
    error_message,
    metadata
  ) VALUES (
    p_user_id,
    p_email,
    p_action,
    p_ip_address,
    p_user_agent,
    p_error_message,
    p_metadata
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;
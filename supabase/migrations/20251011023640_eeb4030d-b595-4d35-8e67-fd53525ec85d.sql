-- FASE 6: Monitoramento de Erros RLS

-- 1. Criar tabela de logs de erros RLS
CREATE TABLE IF NOT EXISTS public.rls_errors_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL, -- SELECT, INSERT, UPDATE, DELETE
  error_message TEXT,
  error_code TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_rls_errors_user_id ON public.rls_errors_log(user_id);
CREATE INDEX IF NOT EXISTS idx_rls_errors_table_name ON public.rls_errors_log(table_name);
CREATE INDEX IF NOT EXISTS idx_rls_errors_created_at ON public.rls_errors_log(created_at DESC);

-- 3. Enable RLS na própria tabela de logs
ALTER TABLE public.rls_errors_log ENABLE ROW LEVEL SECURITY;

-- 4. Apenas admins podem ver logs de RLS
CREATE POLICY "Apenas admins podem ver logs de RLS"
ON public.rls_errors_log
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- 5. Sistema pode inserir logs (qualquer usuário autenticado pode logar seus próprios erros)
CREATE POLICY "Usuários podem inserir seus próprios logs de erro RLS"
ON public.rls_errors_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 6. Criar função helper para logar erros de RLS
CREATE OR REPLACE FUNCTION public.log_rls_error(
  p_table_name TEXT,
  p_operation TEXT,
  p_error_message TEXT,
  p_error_code TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.rls_errors_log (
    user_id,
    table_name,
    operation,
    error_message,
    error_code,
    metadata
  ) VALUES (
    auth.uid(),
    p_table_name,
    p_operation,
    p_error_message,
    p_error_code,
    p_metadata
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- 7. Criar view para estatísticas de erros RLS (apenas admins)
CREATE OR REPLACE VIEW public.rls_errors_stats AS
SELECT 
  table_name,
  operation,
  COUNT(*) as error_count,
  COUNT(DISTINCT user_id) as affected_users,
  MAX(created_at) as last_occurrence
FROM public.rls_errors_log
GROUP BY table_name, operation
ORDER BY error_count DESC;

-- 8. RLS na view de estatísticas
ALTER VIEW public.rls_errors_stats SET (security_invoker = on);
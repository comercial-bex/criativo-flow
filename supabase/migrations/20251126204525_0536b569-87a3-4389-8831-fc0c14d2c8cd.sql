-- =====================================================
-- CORREÇÃO CRÍTICA: Atualizar função de auditoria
-- =====================================================

-- Dropar função antiga
DROP FUNCTION IF EXISTS public.fn_registrar_auditoria(TEXT, UUID, TEXT, JSONB, JSONB, TEXT, UUID) CASCADE;

-- Recriar com referência correta para 'pessoas'
CREATE OR REPLACE FUNCTION public.fn_registrar_auditoria(
  p_tabela TEXT,
  p_registro_id UUID,
  p_acao TEXT,
  p_dados_antes JSONB DEFAULT NULL,
  p_dados_depois JSONB DEFAULT NULL,
  p_detalhe TEXT DEFAULT NULL,
  p_trace_id UUID DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_nome TEXT;
  v_user_role TEXT;
BEGIN
  -- ✅ CORRIGIDO: Buscar de pessoas.profile_id
  SELECT p.nome, get_user_role(auth.uid())::text
  INTO v_user_nome, v_user_role
  FROM pessoas p
  WHERE p.profile_id = auth.uid()
  LIMIT 1;
  
  -- Inserir log
  INSERT INTO public.audit_trail (
    entidade_tipo,
    entidade_id,
    acao,
    acao_detalhe,
    user_id,
    user_nome,
    user_role,
    dados_antes,
    dados_depois,
    trace_id
  ) VALUES (
    p_tabela,
    p_registro_id,
    p_acao,
    p_detalhe,
    auth.uid(),
    COALESCE(v_user_nome, 'Sistema'),
    COALESCE(v_user_role, 'system'),
    p_dados_antes,
    p_dados_depois,
    COALESCE(p_trace_id, gen_random_uuid())
  );
END;
$$;
-- ============================================
-- SIMPLIFICAÇÃO: Sistema de Credenciais (Texto Plano)
-- ============================================

-- Remover colunas criptografadas
ALTER TABLE credenciais_cliente 
  DROP COLUMN IF EXISTS senha_cipher CASCADE,
  DROP COLUMN IF EXISTS secrets_cipher CASCADE;

-- Adicionar colunas de texto plano
ALTER TABLE credenciais_cliente
  ADD COLUMN IF NOT EXISTS senha TEXT,
  ADD COLUMN IF NOT EXISTS tokens_api JSONB DEFAULT '{}'::jsonb;

-- Remover funções antigas
DROP FUNCTION IF EXISTS public.fn_cred_reveal(uuid, text);
DROP FUNCTION IF EXISTS public.fn_cred_save(uuid, uuid, text, text, text, text, jsonb, jsonb, uuid, text);
DROP FUNCTION IF EXISTS public.fn_cred_get_metadata(uuid, uuid);

-- Criar função simplificada para salvar (texto plano)
CREATE OR REPLACE FUNCTION public.fn_cred_save(
  p_cliente_id UUID,
  p_projeto_id UUID,
  p_categoria TEXT,
  p_plataforma TEXT,
  p_usuario_login TEXT,
  p_senha TEXT,
  p_extra_json JSONB DEFAULT '{}'::jsonb,
  p_tokens_api JSONB DEFAULT '{}'::jsonb,
  p_cred_id UUID DEFAULT NULL,
  p_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result_id UUID;
BEGIN
  -- Validação de permissão (Admin, Gestor, GRS)
  IF NOT (
    is_admin(auth.uid()) 
    OR get_user_role(auth.uid()) IN ('gestor'::user_role, 'grs'::user_role)
  ) THEN
    RAISE EXCEPTION 'ACESSO_NEGADO: Apenas Admin, Gestor e GRS podem salvar credenciais';
  END IF;

  -- INSERT ou UPDATE direto (sem criptografia)
  INSERT INTO public.credenciais_cliente (
    id, cliente_id, projeto_id, plataforma, categoria, 
    usuario_login, senha, tokens_api, url, extra, criado_por
  ) VALUES (
    COALESCE(p_cred_id, gen_random_uuid()),
    p_cliente_id, p_projeto_id, p_plataforma, p_categoria,
    p_usuario_login, p_senha, p_tokens_api, p_url, p_extra_json, auth.uid()
  )
  ON CONFLICT (id) DO UPDATE SET
    plataforma = EXCLUDED.plataforma,
    categoria = EXCLUDED.categoria,
    usuario_login = EXCLUDED.usuario_login,
    senha = COALESCE(EXCLUDED.senha, credenciais_cliente.senha),
    tokens_api = EXCLUDED.tokens_api,
    url = EXCLUDED.url,
    extra = EXCLUDED.extra,
    projeto_id = EXCLUDED.projeto_id,
    updated_at = NOW()
  RETURNING id INTO v_result_id;

  -- Log de auditoria
  PERFORM criar_log_atividade(
    p_cliente_id,
    auth.uid(),
    CASE WHEN p_cred_id IS NULL THEN 'create_credential' ELSE 'update_credential' END,
    'credenciais_cliente',
    v_result_id,
    '🔐 Credencial salva: ' || p_plataforma,
    jsonb_build_object(
      'plataforma', p_plataforma,
      'categoria', p_categoria,
      'projeto_id', p_projeto_id,
      'tem_senha', (p_senha IS NOT NULL),
      'tem_tokens', (p_tokens_api != '{}'::jsonb),
      'tem_extra', (p_extra_json != '{}'::jsonb)
    )
  );

  RETURN v_result_id;
END;
$$;

-- Criar função para buscar credenciais (com senha em texto plano)
CREATE OR REPLACE FUNCTION public.fn_cred_get_metadata(
  p_cliente_id UUID,
  p_projeto_id UUID DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  categoria TEXT,
  plataforma TEXT,
  usuario_login TEXT,
  senha TEXT,
  tokens_api JSONB,
  url TEXT,
  extra JSONB,
  updated_at TIMESTAMPTZ,
  updated_by_nome TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id, c.categoria, c.plataforma, c.usuario_login,
    c.senha, c.tokens_api, c.url, c.extra,
    c.updated_at, p.nome as updated_by_nome
  FROM credenciais_cliente c
  LEFT JOIN profiles p ON c.updated_by = p.id
  WHERE c.cliente_id = p_cliente_id
    AND (p_projeto_id IS NULL OR c.projeto_id = p_projeto_id)
  ORDER BY c.updated_at DESC;
END;
$$;
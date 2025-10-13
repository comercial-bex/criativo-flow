-- ============================================
-- CORREÇÃO UNIFICADA: fn_cred_save
-- ============================================

-- Dropar todas as versões antigas da função
DROP FUNCTION IF EXISTS public.fn_cred_save(uuid, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.fn_cred_save(uuid, uuid, text, text, text, text, text, jsonb);

-- Criar função unificada com assinatura compatível com frontend e schema
CREATE OR REPLACE FUNCTION public.fn_cred_save(
  p_cliente_id UUID,
  p_projeto_id UUID,
  p_categoria TEXT,
  p_plataforma TEXT,
  p_usuario_login TEXT,
  p_senha_plain TEXT,
  p_extra_json JSONB DEFAULT '{}'::jsonb,
  p_secrets_json JSONB DEFAULT '{}'::jsonb,
  p_cred_id UUID DEFAULT NULL,
  p_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_encryption_key TEXT := 'BexCommunication2025!SecureKey#*';
  v_senha_encrypted TEXT;
  v_secrets_encrypted TEXT;
  v_result_id UUID;
BEGIN
  -- Validação de permissão (Admin, Gestor, GRS)
  IF NOT (
    is_admin(auth.uid()) 
    OR get_user_role(auth.uid()) IN ('gestor'::user_role, 'grs'::user_role)
  ) THEN
    RAISE EXCEPTION 'ACESSO_NEGADO: Apenas Admin, Gestor e GRS podem salvar credenciais';
  END IF;

  -- Criptografar senha (se fornecida)
  IF p_senha_plain IS NOT NULL AND p_senha_plain != '' THEN
    v_senha_encrypted := encode(pgp_sym_encrypt(p_senha_plain, v_encryption_key), 'base64');
  END IF;

  -- Criptografar secrets JSON (se fornecido)
  IF p_secrets_json IS NOT NULL AND p_secrets_json != '{}'::jsonb THEN
    v_secrets_encrypted := encode(pgp_sym_encrypt(p_secrets_json::text, v_encryption_key), 'base64');
  END IF;

  -- INSERT ou UPDATE
  INSERT INTO public.credenciais_cliente (
    id, cliente_id, projeto_id, plataforma, categoria, usuario_login, 
    senha_cipher, secrets_cipher, url, extra, criado_por
  ) VALUES (
    COALESCE(p_cred_id, gen_random_uuid()),
    p_cliente_id,
    p_projeto_id,
    p_plataforma,
    p_categoria,
    p_usuario_login,
    v_senha_encrypted,
    v_secrets_encrypted,
    p_url,
    p_extra_json,
    auth.uid()
  )
  ON CONFLICT (id) DO UPDATE SET
    plataforma = EXCLUDED.plataforma,
    categoria = EXCLUDED.categoria,
    usuario_login = EXCLUDED.usuario_login,
    senha_cipher = COALESCE(EXCLUDED.senha_cipher, credenciais_cliente.senha_cipher),
    secrets_cipher = COALESCE(EXCLUDED.secrets_cipher, credenciais_cliente.secrets_cipher),
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
      'tem_senha', (p_senha_plain IS NOT NULL),
      'tem_secrets', (p_secrets_json != '{}'::jsonb),
      'tem_extra', (p_extra_json != '{}'::jsonb)
    )
  );

  RETURN v_result_id;
END;
$$;
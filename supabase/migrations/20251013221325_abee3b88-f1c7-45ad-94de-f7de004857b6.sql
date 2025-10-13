-- ============================================
-- CORREÇÃO: Função fn_cred_save com secrets_json
-- ============================================

-- Dropar função antiga (sem p_secrets_json)
DROP FUNCTION IF EXISTS public.fn_cred_save(uuid, text, text, text, text, text, text);

-- Criar função completa com criptografia PGP
CREATE OR REPLACE FUNCTION public.fn_cred_save(
  p_cred_id UUID,
  p_cliente_id UUID,
  p_plataforma TEXT,
  p_categoria TEXT,
  p_usuario TEXT,
  p_senha_plain TEXT,
  p_url TEXT DEFAULT NULL,
  p_secrets_json JSONB DEFAULT '{}'::jsonb
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
    id, cliente_id, plataforma, categoria, usuario, 
    senha_cipher, secrets_cipher, url, criado_por
  ) VALUES (
    COALESCE(p_cred_id, gen_random_uuid()),
    p_cliente_id,
    p_plataforma,
    p_categoria,
    p_usuario,
    v_senha_encrypted,
    v_secrets_encrypted,
    p_url,
    auth.uid()
  )
  ON CONFLICT (id) DO UPDATE SET
    plataforma = EXCLUDED.plataforma,
    categoria = EXCLUDED.categoria,
    usuario = EXCLUDED.usuario,
    senha_cipher = COALESCE(EXCLUDED.senha_cipher, credenciais_cliente.senha_cipher),
    secrets_cipher = COALESCE(EXCLUDED.secrets_cipher, credenciais_cliente.secrets_cipher),
    url = EXCLUDED.url,
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
      'tem_senha', (p_senha_plain IS NOT NULL),
      'tem_secrets', (p_secrets_json != '{}'::jsonb)
    )
  );

  RETURN v_result_id;
END;
$$;
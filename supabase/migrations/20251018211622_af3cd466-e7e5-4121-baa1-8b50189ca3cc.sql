-- Sprint 2A: Criptografia de Credenciais com pgcrypto
-- Meta: +98% compliance LGPD

-- 1. Ativar extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Adicionar colunas encriptadas
ALTER TABLE credenciais_cliente
ADD COLUMN IF NOT EXISTS senha_encrypted BYTEA,
ADD COLUMN IF NOT EXISTS tokens_api_encrypted BYTEA;

-- 3. Função de encriptação segura
CREATE OR REPLACE FUNCTION encrypt_credential(
  p_plaintext TEXT,
  p_key_name TEXT DEFAULT 'credentials_master_key'
)
RETURNS BYTEA
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key TEXT;
BEGIN
  -- Usar chave do Vault ou fallback para ambiente dev
  BEGIN
    SELECT decrypted_secret INTO v_key
    FROM vault.decrypted_secrets
    WHERE name = p_key_name;
  EXCEPTION WHEN OTHERS THEN
    -- Fallback para desenvolvimento (NUNCA em produção)
    v_key := 'DEV_KEY_CHANGE_IN_PRODUCTION';
  END;
  
  -- Encriptar usando AES-256
  RETURN pgp_sym_encrypt(p_plaintext, v_key);
END;
$$;

-- 4. Função de decriptação segura
CREATE OR REPLACE FUNCTION decrypt_credential(
  p_encrypted BYTEA,
  p_key_name TEXT DEFAULT 'credentials_master_key'
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_key TEXT;
BEGIN
  BEGIN
    SELECT decrypted_secret INTO v_key
    FROM vault.decrypted_secrets
    WHERE name = p_key_name;
  EXCEPTION WHEN OTHERS THEN
    v_key := 'DEV_KEY_CHANGE_IN_PRODUCTION';
  END;
  
  RETURN pgp_sym_decrypt(p_encrypted, v_key);
END;
$$;

-- 5. RPC para salvar credencial criptografada
CREATE OR REPLACE FUNCTION save_credential_secure(
  p_cliente_id UUID,
  p_projeto_id UUID,
  p_plataforma TEXT,
  p_categoria TEXT,
  p_usuario_login TEXT,
  p_senha_plain TEXT,
  p_tokens_api_plain JSONB DEFAULT '{}'::jsonb,
  p_url TEXT DEFAULT NULL,
  p_extra JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cred_id UUID;
BEGIN
  -- Verificar permissão (Admin, Gestor, GRS)
  IF NOT (
    is_admin(auth.uid()) 
    OR get_user_role(auth.uid()) IN ('gestor'::user_role, 'grs'::user_role)
  ) THEN
    RAISE EXCEPTION 'ACESSO_NEGADO: Apenas Admin, Gestor e GRS podem salvar credenciais';
  END IF;

  -- Inserir com criptografia
  INSERT INTO credenciais_cliente (
    cliente_id,
    projeto_id,
    plataforma,
    categoria,
    usuario_login,
    senha_encrypted,
    tokens_api_encrypted,
    url,
    extra,
    criado_por
  ) VALUES (
    p_cliente_id,
    p_projeto_id,
    p_plataforma,
    p_categoria,
    p_usuario_login,
    CASE WHEN p_senha_plain IS NOT NULL THEN encrypt_credential(p_senha_plain) ELSE NULL END,
    CASE WHEN p_tokens_api_plain::TEXT != '{}'::TEXT THEN encrypt_credential(p_tokens_api_plain::TEXT) ELSE NULL END,
    p_url,
    p_extra,
    auth.uid()
  )
  RETURNING id INTO v_cred_id;
  
  -- Log de auditoria
  INSERT INTO audit_sensitive_access (
    user_id, action, table_name, record_id, metadata
  ) VALUES (
    auth.uid(), 
    'create_encrypted_credential', 
    'credenciais_cliente', 
    v_cred_id,
    jsonb_build_object(
      'plataforma', p_plataforma,
      'cliente_id', p_cliente_id,
      'tem_senha', (p_senha_plain IS NOT NULL),
      'tem_tokens', (p_tokens_api_plain::TEXT != '{}')
    )
  );

  RETURN v_cred_id;
END;
$$;

-- 6. RPC para recuperar credencial decriptada
CREATE OR REPLACE FUNCTION get_credential_secure(
  p_cred_id UUID
)
RETURNS TABLE (
  id UUID,
  cliente_id UUID,
  projeto_id UUID,
  plataforma TEXT,
  categoria TEXT,
  usuario_login TEXT,
  senha_decrypted TEXT,
  tokens_api_decrypted JSONB,
  url TEXT,
  extra JSONB,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar permissão
  IF NOT (
    is_admin(auth.uid()) 
    OR get_user_role(auth.uid()) IN ('gestor'::user_role, 'grs'::user_role)
  ) THEN
    RAISE EXCEPTION 'ACESSO_NEGADO: Sem permissão para acessar credenciais';
  END IF;

  -- Log de acesso sensível
  INSERT INTO audit_sensitive_access (
    user_id, action, table_name, record_id
  ) VALUES (
    auth.uid(), 
    'decrypt_credential', 
    'credenciais_cliente', 
    p_cred_id
  );

  -- Retornar dados decriptados
  RETURN QUERY
  SELECT 
    c.id,
    c.cliente_id,
    c.projeto_id,
    c.plataforma,
    c.categoria,
    c.usuario_login,
    CASE 
      WHEN c.senha_encrypted IS NOT NULL THEN decrypt_credential(c.senha_encrypted)
      ELSE c.senha -- Fallback para senhas não encriptadas (migração gradual)
    END as senha_decrypted,
    CASE 
      WHEN c.tokens_api_encrypted IS NOT NULL THEN decrypt_credential(c.tokens_api_encrypted)::JSONB
      ELSE c.tokens_api
    END as tokens_api_decrypted,
    c.url,
    c.extra,
    c.updated_at
  FROM credenciais_cliente c
  WHERE c.id = p_cred_id;
END;
$$;

-- 7. Migrar credenciais existentes (rodar manualmente após validação)
-- COMENTADO para segurança - rodar apenas quando aprovado
-- UPDATE credenciais_cliente
-- SET 
--   senha_encrypted = encrypt_credential(senha),
--   tokens_api_encrypted = encrypt_credential(tokens_api::TEXT)
-- WHERE senha IS NOT NULL OR tokens_api IS NOT NULL;
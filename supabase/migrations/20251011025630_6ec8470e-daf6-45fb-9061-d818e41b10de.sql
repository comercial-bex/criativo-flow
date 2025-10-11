-- ==========================================
-- CORREÇÕES CRÍTICAS DE SEGURANÇA
-- ==========================================

-- 1. Habilitar RLS em intelligence_data
ALTER TABLE intelligence_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin e Gestor podem ver intelligence"
ON intelligence_data FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) = 'gestor'::user_role
);

CREATE POLICY "Admin e Gestor podem gerenciar intelligence"
ON intelligence_data FOR ALL
TO authenticated
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) = 'gestor'::user_role
);

-- 2. Habilitar RLS em rh_colaboradores
-- Nota: Tabela não possui user_id, então RLS é apenas para admin/gestor
ALTER TABLE rh_colaboradores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin e Gestor podem ver todos colaboradores"
ON rh_colaboradores FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) = 'gestor'::user_role
);

CREATE POLICY "Admin e Gestor podem gerenciar colaboradores"
ON rh_colaboradores FOR ALL
TO authenticated
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) = 'gestor'::user_role
);

-- 3. Habilitar RLS em financeiro_folha e financeiro_folha_itens
ALTER TABLE financeiro_folha ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_folha_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin, Gestor e Financeiro podem ver folha"
ON financeiro_folha FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) IN ('gestor'::user_role, 'financeiro'::user_role)
);

CREATE POLICY "Admin, Gestor e Financeiro podem gerenciar folha"
ON financeiro_folha FOR ALL
TO authenticated
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) IN ('gestor'::user_role, 'financeiro'::user_role)
);

CREATE POLICY "Admin, Gestor e Financeiro podem ver itens folha"
ON financeiro_folha_itens FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) IN ('gestor'::user_role, 'financeiro'::user_role)
);

CREATE POLICY "Admin, Gestor e Financeiro podem gerenciar itens folha"
ON financeiro_folha_itens FOR ALL
TO authenticated
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) IN ('gestor'::user_role, 'financeiro'::user_role)
);

-- 4. Função para sanitizar mensagens de erro (connector_status)
CREATE OR REPLACE FUNCTION sanitize_error_message(error_msg text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF error_msg IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remove nomes de variáveis de ambiente
  error_msg := regexp_replace(error_msg, '\b[A-Z_]+_KEY\b', '[REDACTED_KEY]', 'g');
  error_msg := regexp_replace(error_msg, '\b[A-Z_]+_SECRET\b', '[REDACTED_SECRET]', 'g');
  error_msg := regexp_replace(error_msg, '\b[A-Z_]+_TOKEN\b', '[REDACTED_TOKEN]', 'g');
  
  -- Remove tokens e chaves longas
  error_msg := regexp_replace(error_msg, '\b[a-zA-Z0-9]{32,}\b', '[REDACTED_TOKEN]', 'g');
  
  -- Remove URLs completas
  error_msg := regexp_replace(error_msg, 'https?://[^\s]+', '[REDACTED_URL]', 'g');
  
  -- Remove endereços IP
  error_msg := regexp_replace(error_msg, '\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', '[REDACTED_IP]', 'g');
  
  RETURN error_msg;
END;
$$;

-- Aplicar sanitização automaticamente ao inserir/atualizar connector_status
CREATE OR REPLACE FUNCTION sanitize_connector_errors()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.last_error_message IS NOT NULL THEN
    NEW.last_error_message := sanitize_error_message(NEW.last_error_message);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sanitize_connector_errors_trigger ON connector_status;
CREATE TRIGGER sanitize_connector_errors_trigger
  BEFORE INSERT OR UPDATE ON connector_status
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_connector_errors();

-- 5. Melhorar função de revelação de credenciais (fn_cred_reveal)
-- Nota: A chave ainda está hardcoded, mas agora com mais segurança e auditoria
CREATE OR REPLACE FUNCTION fn_cred_reveal(
  p_cred_id uuid, 
  p_motivo text DEFAULT 'Acesso para trabalho'
)
RETURNS TABLE(senha_plain text, secrets_plain jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_encryption_key TEXT := 'BexCommunication2025!SecureKey#*'; -- TODO: Mover para secret do Supabase
  v_senha_decrypted TEXT;
  v_secrets_decrypted JSONB;
  v_cliente_id UUID;
  v_plataforma TEXT;
  v_user_role user_role;
BEGIN
  -- VALIDAÇÃO MAIS RESTRITIVA: Apenas admin e gestor
  SELECT get_user_role(auth.uid()) INTO v_user_role;
  
  IF NOT (is_admin(auth.uid()) OR v_user_role = 'gestor'::user_role) THEN
    RAISE EXCEPTION 'ACESSO_NEGADO: Apenas administradores e gestores podem revelar senhas';
  END IF;

  -- Buscar e descriptografar
  SELECT 
    c.cliente_id,
    c.plataforma,
    CASE 
      WHEN c.senha_cipher IS NOT NULL THEN
        pgp_sym_decrypt(decode(c.senha_cipher, 'base64'), v_encryption_key)
      ELSE NULL
    END,
    CASE 
      WHEN c.secrets_cipher IS NOT NULL THEN
        pgp_sym_decrypt(decode(c.secrets_cipher, 'base64'), v_encryption_key)::jsonb
      ELSE '{}'::jsonb
    END
  INTO v_cliente_id, v_plataforma, v_senha_decrypted, v_secrets_decrypted
  FROM credenciais_cliente c
  WHERE c.id = p_cred_id;

  IF v_senha_decrypted IS NULL AND v_secrets_decrypted = '{}'::jsonb THEN
    RAISE EXCEPTION 'CREDENCIAL_NAO_ENCONTRADA: ID inválido ou sem dados criptografados';
  END IF;

  -- Log de auditoria detalhado (CRÍTICO para compliance)
  PERFORM criar_log_atividade(
    v_cliente_id, 
    auth.uid(), 
    'reveal_credential', 
    'credenciais_cliente', 
    p_cred_id,
    '🔓 ACESSO SENSÍVEL: Senha revelada para ' || v_plataforma,
    jsonb_build_object(
      'plataforma', v_plataforma, 
      'motivo', p_motivo,
      'timestamp_utc', NOW() AT TIME ZONE 'UTC',
      'user_role', v_user_role,
      'ip_address', current_setting('request.headers', true)::json->>'x-real-ip'
    )
  );

  RETURN QUERY SELECT v_senha_decrypted, v_secrets_decrypted;
END;
$$;

-- 6. Criar tabela de auditoria para acesso a dados sensíveis
CREATE TABLE IF NOT EXISTS audit_sensitive_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  timestamp timestamptz NOT NULL DEFAULT NOW(),
  ip_address inet,
  user_agent text,
  success boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE audit_sensitive_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apenas admin e gestor veem audit logs"
ON audit_sensitive_access FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) = 'gestor'::user_role
);

CREATE POLICY "Sistema pode criar audit logs"
ON audit_sensitive_access FOR INSERT
TO authenticated
WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_sensitive_user_id ON audit_sensitive_access(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_sensitive_timestamp ON audit_sensitive_access(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_sensitive_table ON audit_sensitive_access(table_name, record_id);

COMMENT ON TABLE audit_sensitive_access IS 'Auditoria de acesso a dados sensíveis (salários, credenciais, dados pessoais)';
COMMENT ON TABLE intelligence_data IS 'RLS HABILITADO: Acesso restrito a admin e gestor';
COMMENT ON TABLE rh_colaboradores IS 'RLS HABILITADO: Dados pessoais protegidos por LGPD - Acesso: Admin/Gestor';
COMMENT ON TABLE financeiro_folha IS 'RLS HABILITADO: Dados salariais protegidos - Acesso: Admin/Gestor/Financeiro';
COMMENT ON TABLE financeiro_folha_itens IS 'RLS HABILITADO: Itens de folha protegidos - Acesso: Admin/Gestor/Financeiro';

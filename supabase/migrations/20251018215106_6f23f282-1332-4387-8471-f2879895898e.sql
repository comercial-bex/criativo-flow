-- ========================================
-- SPRINT 1B DIA 2+3: Credenciais + RLS
-- ========================================

-- DIA 2: Deprecar fn_cred_save (sem IF EXISTS)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_cred_save') THEN
    ALTER FUNCTION fn_cred_save(UUID, UUID, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, UUID, TEXT) 
    RENAME TO fn_cred_save_deprecated;
  END IF;
END $$;

-- Criar wrapper de compatibilidade
CREATE OR REPLACE FUNCTION fn_cred_save(
  p_cliente_id UUID, p_projeto_id UUID, p_categoria TEXT, p_plataforma TEXT,
  p_usuario_login TEXT, p_senha TEXT, p_extra_json JSONB DEFAULT '{}',
  p_tokens_api JSONB DEFAULT '{}', p_cred_id UUID DEFAULT NULL, p_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RAISE WARNING 'fn_cred_save DEPRECADA → use save_credential_secure';
  RETURN save_credential_secure(p_cliente_id, p_plataforma, p_usuario_login, p_senha, p_tokens_api);
END;
$$;

-- DIA 3: RLS em tabelas de backup
ALTER TABLE clientes_backup_pre_unificacao ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_only_backup" ON clientes_backup_pre_unificacao;
CREATE POLICY "admin_only_backup" ON clientes_backup_pre_unificacao
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

-- RLS em migracao_clientes_audit (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'migracao_clientes_audit') THEN
    EXECUTE 'ALTER TABLE migracao_clientes_audit ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "admin_gestor_audit" ON migracao_clientes_audit';
    EXECUTE 'CREATE POLICY "admin_gestor_audit" ON migracao_clientes_audit FOR SELECT TO authenticated USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = ''gestor''::user_role)';
  END IF;
END $$;

-- Health log final
INSERT INTO system_health_logs (check_type, status, details)
VALUES ('sprint1b_dia2_dia3', 'ok', jsonb_build_object(
  'credentials_deprecated', true,
  'rls_backups_enabled', true,
  'ts', NOW()
));
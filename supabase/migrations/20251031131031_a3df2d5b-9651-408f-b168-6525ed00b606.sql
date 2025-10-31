-- ESTRATÉGIA 1: SPRINT 1 - SEGURANÇA E LIMPEZA (CORRIGIDO)

-- Item 2: Limpar Posts Temporários (sem VACUUM em transação)
CREATE OR REPLACE FUNCTION cleanup_posts_temporarios()
RETURNS TABLE(
  deletados integer,
  tamanho_antes_mb integer,
  tamanho_depois_mb integer
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deletados integer;
  v_tamanho_antes bigint;
  v_tamanho_depois bigint;
BEGIN
  SELECT pg_total_relation_size('posts_gerados_temp') INTO v_tamanho_antes;
  
  DELETE FROM posts_gerados_temp
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS v_deletados = ROW_COUNT;
  
  SELECT pg_total_relation_size('posts_gerados_temp') INTO v_tamanho_depois;
  
  RETURN QUERY SELECT 
    v_deletados,
    (v_tamanho_antes / 1024 / 1024)::integer,
    (v_tamanho_depois / 1024 / 1024)::integer;
END;
$$;

-- Item 4: Auditoria de Credenciais
CREATE TABLE IF NOT EXISTS credenciais_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id uuid NOT NULL,
  action text NOT NULL,
  accessed_by uuid REFERENCES auth.users(id),
  accessed_at timestamptz NOT NULL DEFAULT now(),
  ip_address inet,
  success boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'
);

ALTER TABLE credenciais_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin pode ver auditoria de credenciais" ON credenciais_audit_log;
CREATE POLICY "Admin pode ver auditoria de credenciais"
  ON credenciais_audit_log FOR SELECT
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Sistema pode criar logs de auditoria" ON credenciais_audit_log;
CREATE POLICY "Sistema pode criar logs de auditoria"
  ON credenciais_audit_log FOR INSERT
  WITH CHECK (true);

-- Views de monitoramento
CREATE OR REPLACE VIEW credenciais_status_seguranca AS
SELECT 
  COUNT(*) as total_credenciais,
  COUNT(*) FILTER (WHERE senha_encrypted IS NOT NULL) as credenciais_criptografadas,
  COUNT(*) FILTER (WHERE senha_encrypted IS NULL) as credenciais_sem_criptografia,
  ROUND(
    (COUNT(*) FILTER (WHERE senha_encrypted IS NOT NULL)::numeric / 
    NULLIF(COUNT(*), 0) * 100), 
    2
  ) as percentual_seguro
FROM credenciais_cliente;

CREATE OR REPLACE VIEW estrategia1_progresso AS
SELECT 
  'Posts Temporários Antigos' as metrica,
  (SELECT COUNT(*) FROM posts_gerados_temp WHERE created_at < NOW() - INTERVAL '7 days')::integer as valor_atual,
  0 as meta,
  'registros' as unidade
UNION ALL
SELECT 
  'Credenciais Criptografadas',
  (SELECT COUNT(*) FROM credenciais_cliente WHERE senha_encrypted IS NOT NULL)::integer,
  (SELECT COUNT(*) FROM credenciais_cliente)::integer,
  'de'
UNION ALL
SELECT 
  'Tamanho Posts Temp',
  (SELECT pg_total_relation_size('posts_gerados_temp') / 1024 / 1024)::integer,
  10,
  'MB';

CREATE INDEX IF NOT EXISTS idx_credenciais_audit_accessed_at 
  ON credenciais_audit_log(accessed_at DESC);

-- Executar limpeza e ver resultados
SELECT * FROM cleanup_posts_temporarios();
SELECT * FROM credenciais_status_seguranca;
SELECT * FROM estrategia1_progresso;
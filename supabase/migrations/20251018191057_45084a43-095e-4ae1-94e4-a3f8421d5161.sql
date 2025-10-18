-- ============================================================================
-- FASE 1: PREPARAÇÃO E BACKUP - Unificação clientes → pessoas
-- ============================================================================

-- 1.1 Criar backup completo da tabela clientes
CREATE TABLE IF NOT EXISTS clientes_backup_pre_unificacao AS 
SELECT * FROM clientes;

COMMENT ON TABLE clientes_backup_pre_unificacao IS 
  'Backup completo da tabela clientes antes da unificação com pessoas (2025-10-18)';

-- 1.2 Criar tabela de auditoria para rastrear migração
CREATE TABLE IF NOT EXISTS migracao_clientes_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL UNIQUE,
  pessoa_id UUID REFERENCES pessoas(id),
  status TEXT NOT NULL CHECK (status IN ('pendente', 'migrado', 'erro', 'conflito')),
  dados_originais JSONB NOT NULL,
  dados_migrados JSONB,
  erros TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  migrado_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_audit_status ON migracao_clientes_audit(status);
CREATE INDEX IF NOT EXISTS idx_audit_pessoa ON migracao_clientes_audit(pessoa_id);

COMMENT ON TABLE migracao_clientes_audit IS 
  'Auditoria da migração clientes → pessoas. Rastreia cada cliente migrado.';

-- 1.3 Popular tabela de auditoria com status inicial
INSERT INTO migracao_clientes_audit (cliente_id, status, dados_originais)
SELECT 
  id,
  'pendente',
  jsonb_build_object(
    'id', id,
    'nome', nome,
    'email', email,
    'telefone', telefone,
    'cnpj_cpf', cnpj_cpf,
    'endereco', endereco,
    'status', status,
    'responsavel_id', responsavel_id,
    'assinatura_id', assinatura_id,
    'logo_url', logo_url,
    'razao_social', razao_social,
    'nome_fantasia', nome_fantasia,
    'situacao_cadastral', situacao_cadastral,
    'cnae_principal', cnae_principal,
    'cnpj_fonte', cnpj_fonte,
    'cnpj_ultima_consulta', cnpj_ultima_consulta,
    'created_at', created_at
  )
FROM clientes
ON CONFLICT (cliente_id) DO NOTHING;

-- 1.4 Criar view de relatório de conflitos potenciais
CREATE OR REPLACE VIEW vw_conflitos_migracao_clientes AS
WITH conflitos AS (
  SELECT 
    c.id as cliente_id,
    c.nome as cliente_nome,
    c.email as cliente_email,
    c.cnpj_cpf as cliente_cnpj,
    p.id as pessoa_id,
    p.nome as pessoa_nome,
    p.email as pessoa_email,
    p.cpf as pessoa_cpf,
    CASE 
      WHEN LOWER(TRIM(c.email)) = LOWER(TRIM(p.email)) THEN 'email_match'
      WHEN normalizar_cpf(c.cnpj_cpf) = normalizar_cpf(p.cpf) THEN 'cpf_match'
      ELSE 'no_match'
    END as tipo_conflito,
    CASE 
      WHEN 'cliente' = ANY(p.papeis) THEN true
      ELSE false
    END as pessoa_ja_eh_cliente
  FROM clientes c
  LEFT JOIN pessoas p ON (
    (LOWER(TRIM(c.email)) = LOWER(TRIM(p.email)) AND c.email IS NOT NULL AND p.email IS NOT NULL) OR
    (normalizar_cpf(c.cnpj_cpf) = normalizar_cpf(p.cpf) AND c.cnpj_cpf IS NOT NULL AND p.cpf IS NOT NULL)
  )
)
SELECT * FROM conflitos
WHERE pessoa_id IS NOT NULL
ORDER BY tipo_conflito, cliente_nome;

COMMENT ON VIEW vw_conflitos_migracao_clientes IS 
  'Identifica clientes que podem ter correspondência com pessoas existentes';

-- 1.5 Criar view de compatibilidade temporária (apenas com campos existentes em pessoas)
CREATE OR REPLACE VIEW clientes_compat AS
SELECT 
  p.id,
  p.nome,
  p.email,
  p.telefones[1] as telefone,
  p.cpf as cnpj_cpf,
  NULL::text as endereco, -- Campo será adicionado na Fase 2
  p.status::text as status,
  NULL::uuid as responsavel_id, -- Campo será mapeado na Fase 4
  NULL::uuid as assinatura_id, -- Campo será adicionado na Fase 2
  p.created_at,
  p.updated_at,
  NULL::text as logo_url, -- Campo será adicionado na Fase 2
  NULL::text as razao_social, -- Campo será adicionado na Fase 2
  NULL::text as nome_fantasia, -- Campo será adicionado na Fase 2
  NULL::text as situacao_cadastral, -- Campo será adicionado na Fase 2
  NULL::text as cnae_principal, -- Campo será adicionado na Fase 2
  NULL::text as cnpj_fonte, -- Campo será adicionado na Fase 2
  NULL::timestamptz as cnpj_ultima_consulta -- Campo será adicionado na Fase 2
FROM pessoas p
WHERE 'cliente' = ANY(p.papeis);

COMMENT ON VIEW clientes_compat IS 
  'View de compatibilidade temporária - Campos NULL serão preenchidos após Fase 2';

-- 1.6 Criar view de relatório de progresso da migração
CREATE OR REPLACE VIEW vw_progresso_migracao_clientes AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'pendente') as pendentes,
  COUNT(*) FILTER (WHERE status = 'migrado') as migrados,
  COUNT(*) FILTER (WHERE status = 'erro') as com_erro,
  COUNT(*) FILTER (WHERE status = 'conflito') as conflitos,
  COUNT(*) as total,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'migrado')::numeric / NULLIF(COUNT(*), 0)) * 100, 
    2
  ) as percentual_concluido
FROM migracao_clientes_audit;

COMMENT ON VIEW vw_progresso_migracao_clientes IS 
  'Dashboard de progresso da migração em tempo real';

-- 1.7 Conceder permissões
GRANT SELECT ON vw_conflitos_migracao_clientes TO authenticated;
GRANT SELECT ON vw_progresso_migracao_clientes TO authenticated;
GRANT SELECT ON clientes_compat TO authenticated;
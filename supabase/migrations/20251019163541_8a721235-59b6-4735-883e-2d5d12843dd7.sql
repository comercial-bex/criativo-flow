-- ============================================
-- SPRINT 3: AUDIT + CLEANUP (FINAL)
-- ============================================

-- ============================================
-- PARTE 1: CRIAR TABELA UNIFICADA DE AUDIT
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_trail_unified (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id UUID NOT NULL DEFAULT gen_random_uuid(),
  entidade_tipo TEXT NOT NULL,
  entidade_id UUID NOT NULL,
  acao TEXT NOT NULL,
  acao_detalhe TEXT,
  user_id UUID REFERENCES auth.users(id),
  user_nome TEXT,
  user_role TEXT,
  dados_antes JSONB DEFAULT '{}'::jsonb,
  dados_depois JSONB DEFAULT '{}'::jsonb,
  impacto_tipo TEXT,
  entidades_afetadas JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_unified_entidade ON audit_trail_unified(entidade_tipo, entidade_id);
CREATE INDEX IF NOT EXISTS idx_audit_unified_trace ON audit_trail_unified(trace_id);
CREATE INDEX IF NOT EXISTS idx_audit_unified_user ON audit_trail_unified(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_unified_created ON audit_trail_unified(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_unified_acao ON audit_trail_unified(acao);
CREATE INDEX IF NOT EXISTS idx_audit_unified_metadata ON audit_trail_unified USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_audit_unified_entidades ON audit_trail_unified USING GIN(entidades_afetadas);

ALTER TABLE public.audit_trail_unified ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sistema pode criar audit trail unificado"
  ON public.audit_trail_unified FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin e Gestor podem ver audit trail unificado"
  ON public.audit_trail_unified FOR SELECT
  USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor'::user_role);

-- ============================================
-- PARTE 2: MIGRAR DADOS EXISTENTES
-- ============================================

INSERT INTO public.audit_trail_unified (
  trace_id, entidade_tipo, entidade_id, acao, acao_detalhe,
  user_id, user_nome, user_role, dados_antes, dados_depois,
  impacto_tipo, entidades_afetadas, metadata, created_at
)
SELECT 
  COALESCE(trace_id, gen_random_uuid()),
  entidade_tipo, entidade_id, acao, acao_detalhe,
  user_id, user_nome, user_role,
  COALESCE(dados_antes, '{}'::jsonb),
  COALESCE(dados_depois, '{}'::jsonb),
  impacto_tipo,
  COALESCE(entidades_afetadas, '[]'::jsonb),
  COALESCE(metadata, '{}'::jsonb),
  created_at
FROM public.audit_trail
ON CONFLICT DO NOTHING;

INSERT INTO public.audit_trail_unified (
  entidade_tipo, entidade_id, acao, user_id, dados_antes, dados_depois, created_at
)
SELECT 
  'post', post_id, action, user_id,
  COALESCE(before, '{}'::jsonb),
  COALESCE(after, '{}'::jsonb),
  created_at
FROM public.audit_logs
ON CONFLICT DO NOTHING;

INSERT INTO public.audit_trail_unified (
  entidade_tipo, entidade_id, acao, user_id, metadata, created_at
)
SELECT 
  table_name,
  COALESCE(record_id, gen_random_uuid()),
  action, user_id,
  jsonb_build_object(
    'success', success,
    'ip_address', ip_address::text,
    'user_agent', user_agent,
    'original_metadata', metadata
  ),
  timestamp
FROM public.audit_sensitive_access
ON CONFLICT DO NOTHING;

-- ============================================
-- PARTE 3: REMOVER TABELAS LEGADAS
-- ============================================

DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.audit_sensitive_access CASCADE;
ALTER TABLE IF EXISTS public.audit_trail RENAME TO audit_trail_backup_legacy;
ALTER TABLE public.audit_trail_unified RENAME TO audit_trail;

ALTER INDEX IF EXISTS idx_audit_unified_entidade RENAME TO idx_audit_entidade;
ALTER INDEX IF EXISTS idx_audit_unified_trace RENAME TO idx_audit_trace;
ALTER INDEX IF EXISTS idx_audit_unified_user RENAME TO idx_audit_user;
ALTER INDEX IF EXISTS idx_audit_unified_created RENAME TO idx_audit_created;
ALTER INDEX IF EXISTS idx_audit_unified_acao RENAME TO idx_audit_acao;
ALTER INDEX IF EXISTS idx_audit_unified_metadata RENAME TO idx_audit_metadata;
ALTER INDEX IF EXISTS idx_audit_unified_entidades RENAME TO idx_audit_entidades;

-- ============================================
-- PARTE 4: OTIMIZAÇÃO DE PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_projetos_cliente_status ON projetos(cliente_id, status);
CREATE INDEX IF NOT EXISTS idx_projetos_created ON projetos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tarefa_projeto_status ON tarefa(projeto_id, status);
CREATE INDEX IF NOT EXISTS idx_tarefa_executor_status ON tarefa(executor_id, status) WHERE executor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tarefa_responsavel_status ON tarefa(responsavel_id, status) WHERE responsavel_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_eventos_responsavel_data ON eventos_calendario(responsavel_id, data_inicio);
CREATE INDEX IF NOT EXISTS idx_eventos_projeto_data ON eventos_calendario(projeto_id, data_inicio) WHERE projeto_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_financeiro_lancamentos_data ON financeiro_lancamentos(data_lancamento DESC);
CREATE INDEX IF NOT EXISTS idx_financeiro_lancamentos_tipo ON financeiro_lancamentos(tipo_origem);
CREATE INDEX IF NOT EXISTS idx_pessoas_papeis ON pessoas USING GIN(papeis);
CREATE INDEX IF NOT EXISTS idx_pessoas_status ON pessoas(status);

ANALYZE public.projetos;
ANALYZE public.tarefa;
ANALYZE public.eventos_calendario;
ANALYZE public.financeiro_lancamentos;
ANALYZE public.pessoas;
ANALYZE public.audit_trail;

-- ============================================
-- PARTE 5: FUNÇÃO HELPER PARA AUDIT
-- ============================================

CREATE OR REPLACE FUNCTION public.fn_registrar_audit(
  p_entidade_tipo TEXT,
  p_entidade_id UUID,
  p_acao TEXT,
  p_dados_antes JSONB DEFAULT NULL,
  p_dados_depois JSONB DEFAULT NULL,
  p_acao_detalhe TEXT DEFAULT NULL,
  p_impacto_tipo TEXT DEFAULT 'medio',
  p_entidades_afetadas JSONB DEFAULT '[]'::jsonb,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit_id UUID;
  v_user_nome TEXT;
  v_user_role TEXT;
BEGIN
  SELECT p.nome, ur.role::text
  INTO v_user_nome, v_user_role
  FROM profiles p
  LEFT JOIN user_roles ur ON ur.user_id = p.id
  WHERE p.id = auth.uid()
  LIMIT 1;

  INSERT INTO public.audit_trail (
    entidade_tipo, entidade_id, acao, acao_detalhe,
    user_id, user_nome, user_role,
    dados_antes, dados_depois, impacto_tipo,
    entidades_afetadas, metadata
  ) VALUES (
    p_entidade_tipo, p_entidade_id, p_acao, p_acao_detalhe,
    auth.uid(), v_user_nome, v_user_role,
    p_dados_antes, p_dados_depois, p_impacto_tipo,
    p_entidades_afetadas, p_metadata
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$;

INSERT INTO public.system_health_logs (check_type, status, details)
VALUES (
  'sprint3_completion',
  'ok',
  jsonb_build_object(
    'sprint', 'Sprint 3',
    'feature', 'audit_cleanup',
    'actions', jsonb_build_array(
      'unified_audit_trail',
      'migrated_legacy_logs',
      'removed_deprecated_tables',
      'optimized_indexes',
      'analyzed_statistics'
    ),
    'timestamp', NOW()
  )
);
-- ========================================
-- FASE 2: INTEGRAÇÃO & AUTOMAÇÃO
-- Objetivo: Alcançar 95% de saúde (+22%)
-- ========================================

-- ==========================================
-- PASSO 1: AUDITORIA UNIVERSAL
-- ==========================================

-- 1.1 Criar Tabela de Auditoria Unificada
CREATE TABLE IF NOT EXISTS public.audit_universal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela TEXT NOT NULL,
  registro_id UUID NOT NULL,
  operacao TEXT NOT NULL CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE')),
  dados_antigos JSONB,
  dados_novos JSONB,
  usuario_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_tabela_registro ON audit_universal(tabela, registro_id);
CREATE INDEX IF NOT EXISTS idx_audit_usuario ON audit_universal(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_universal(timestamp DESC);

-- RLS
ALTER TABLE audit_universal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin e Gestor podem ver audit universal"
  ON audit_universal FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'gestor')
    )
  );

CREATE POLICY "Sistema pode criar audit universal"
  ON audit_universal FOR INSERT
  WITH CHECK (true);

-- 1.2 Função Genérica de Auditoria
CREATE OR REPLACE FUNCTION fn_audit_universal()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_universal (
    tabela,
    registro_id,
    operacao,
    dados_antigos,
    dados_novos,
    usuario_id,
    ip_address
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid(),
    inet_client_addr()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1.3 Aplicar Auditoria nas 20 Tabelas Críticas
DO $$
DECLARE
  tabela TEXT;
  tabelas_criticas TEXT[] := ARRAY[
    'pessoas', 'clientes', 'projetos', 'tarefa', 'eventos_calendario',
    'transacoes_financeiras', 'financeiro_folha', 'credenciais_cliente',
    'aprovacoes_cliente', 'briefings', 'posts_planejamento', 'planejamentos',
    'inventario_itens', 'inventario_reservas', 'user_roles', 'contratos',
    'fornecedores', 'cliente_onboarding', 'notificacoes', 'cliente_metas'
  ];
BEGIN
  FOREACH tabela IN ARRAY tabelas_criticas
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_audit_%I ON public.%I;
      CREATE TRIGGER trg_audit_%I
        AFTER INSERT OR UPDATE OR DELETE ON public.%I
        FOR EACH ROW EXECUTE FUNCTION fn_audit_universal();
    ', tabela, tabela, tabela, tabela);
    
    RAISE NOTICE '✅ Auditoria ativada em: %', tabela;
  END LOOP;
END;
$$;

-- ==========================================
-- PASSO 2: UNIFICAR SISTEMA DE APROVAÇÕES
-- ==========================================

-- 2.1 Criar view retrocompatível para briefings
CREATE OR REPLACE VIEW vw_briefings_legacy AS
SELECT 
  ac.id,
  ac.tarefa_id,
  ac.cliente_id,
  ac.projeto_id,
  ac.titulo,
  ac.descricao,
  ac.status as status_briefing,
  ac.anexo_url,
  ac.created_at,
  ac.updated_at,
  ac.solicitado_por,
  ac.decidido_por,
  ac.decided_at,
  ac.motivo_reprovacao,
  ac.legenda,
  ac.hashtags,
  ac.formato_postagem,
  ac.objetivo_postagem,
  ac.call_to_action,
  ac.rede_social
FROM aprovacoes_cliente ac
WHERE ac.tipo = 'briefing';

-- 2.2 Trigger de Sincronização: briefings → aprovacoes_cliente
CREATE OR REPLACE FUNCTION fn_sync_briefing_to_aprovacao()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO aprovacoes_cliente (
    id, cliente_id, tarefa_id, tipo, titulo, descricao, status,
    anexo_url, solicitado_por, created_at, updated_at
  ) VALUES (
    NEW.id, 
    NEW.cliente_id, 
    NEW.tarefa_id, 
    'briefing',
    NEW.titulo, 
    NEW.descricao, 
    CASE NEW.status_briefing 
      WHEN 'aprovado' THEN 'aprovado'
      WHEN 'reprovado' THEN 'reprovado'
      ELSE 'pendente'
    END,
    NEW.manual_marca_url,
    auth.uid(),
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    titulo = EXCLUDED.titulo,
    descricao = EXCLUDED.descricao,
    status = EXCLUDED.status,
    anexo_url = EXCLUDED.anexo_url,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_briefing ON briefings;
CREATE TRIGGER trg_sync_briefing
  AFTER INSERT OR UPDATE ON briefings
  FOR EACH ROW EXECUTE FUNCTION fn_sync_briefing_to_aprovacao();

-- ==========================================
-- PASSO 3: TIMELINE UNIFICADA DO CLIENTE
-- ==========================================

-- 3.1 Criar Materialized View de Timeline
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_cliente_timeline AS
SELECT 
  c.id as cliente_id,
  jsonb_agg(
    jsonb_build_object(
      'tipo', evento.tipo,
      'titulo', evento.titulo,
      'data', evento.data,
      'entidade', evento.entidade,
      'metadata', evento.metadata
    ) ORDER BY evento.data DESC
  ) as timeline
FROM clientes c
LEFT JOIN LATERAL (
  -- Projetos
  SELECT 
    'projeto' as tipo,
    p.titulo as titulo,
    p.created_at as data,
    'projetos' as entidade,
    jsonb_build_object('id', p.id, 'status', p.status) as metadata
  FROM projetos p WHERE p.cliente_id = c.id
  
  UNION ALL
  
  -- Tarefas
  SELECT 
    'tarefa' as tipo,
    t.titulo as titulo,
    t.created_at as data,
    'tarefa' as entidade,
    jsonb_build_object('id', t.id, 'status', t.status) as metadata
  FROM tarefa t WHERE t.cliente_id = c.id
  
  UNION ALL
  
  -- Aprovações
  SELECT 
    'aprovacao' as tipo,
    a.titulo as titulo,
    a.created_at as data,
    'aprovacoes_cliente' as entidade,
    jsonb_build_object('id', a.id, 'status', a.status, 'tipo', a.tipo) as metadata
  FROM aprovacoes_cliente a WHERE a.cliente_id = c.id
  
  UNION ALL
  
  -- Transações Financeiras
  SELECT 
    'financeiro' as tipo,
    tf.descricao as titulo,
    tf.data_vencimento as data,
    'transacoes_financeiras' as entidade,
    jsonb_build_object('id', tf.id, 'valor', tf.valor, 'tipo', tf.tipo) as metadata
  FROM transacoes_financeiras tf WHERE tf.cliente_id = c.id
  
  UNION ALL
  
  -- Posts Planejados
  SELECT 
    'conteudo' as tipo,
    pp.titulo as titulo,
    pp.data_postagem as data,
    'posts_planejamento' as entidade,
    jsonb_build_object('id', pp.id, 'status', pp.status) as metadata
  FROM posts_planejamento pp 
  JOIN planejamentos pl ON pl.id = pp.planejamento_id
  WHERE pl.cliente_id = c.id
) as evento ON true
GROUP BY c.id;

-- Índice único para performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_timeline_cliente ON mv_cliente_timeline(cliente_id);

-- 3.2 Função de Refresh da Timeline
CREATE OR REPLACE FUNCTION refresh_cliente_timeline()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_cliente_timeline;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.3 RPC para buscar Timeline do Cliente
CREATE OR REPLACE FUNCTION get_cliente_timeline(p_cliente_id UUID, p_limit INT DEFAULT 50)
RETURNS TABLE(
  tipo TEXT,
  titulo TEXT,
  data TIMESTAMPTZ,
  entidade TEXT,
  metadata JSONB
) 
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (item->>'tipo')::text,
    (item->>'titulo')::text,
    (item->>'data')::timestamptz,
    (item->>'entidade')::text,
    (item->'metadata')::jsonb
  FROM mv_cliente_timeline ct,
       jsonb_array_elements(ct.timeline) as item
  WHERE ct.cliente_id = p_cliente_id
  ORDER BY (item->>'data')::timestamptz DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- PASSO 4: METAS AUTO-SINCRONIZADAS
-- ==========================================

-- 4.1 Otimizar Trigger de Meta de Posts (Engajamento)
CREATE OR REPLACE FUNCTION fn_sync_meta_engajamento()
RETURNS TRIGGER AS $$
DECLARE
  v_cliente_id UUID;
  v_mes_ref DATE;
  v_total_publicados INTEGER;
BEGIN
  -- Buscar cliente e mês
  SELECT pl.cliente_id, DATE_TRUNC('month', pl.mes_referencia)::date
  INTO v_cliente_id, v_mes_ref
  FROM planejamentos pl
  WHERE pl.id = NEW.planejamento_id;
  
  IF v_cliente_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Contar posts publicados no mês
  SELECT COUNT(*)
  INTO v_total_publicados
  FROM posts_planejamento pp
  JOIN planejamentos pl ON pl.id = pp.planejamento_id
  WHERE pl.cliente_id = v_cliente_id
    AND DATE_TRUNC('month', pl.mes_referencia)::date = v_mes_ref
    AND pp.status = 'publicado';
  
  -- Atualizar meta de engajamento
  UPDATE cliente_metas
  SET 
    valor_atual = v_total_publicados,
    progresso_percent = ROUND((v_total_publicados::NUMERIC / NULLIF(valor_alvo, 0)) * 100, 2),
    status = CASE
      WHEN v_total_publicados >= valor_alvo THEN 'concluida'
      WHEN v_total_publicados >= valor_alvo * 0.7 THEN 'em_andamento'
      ELSE 'em_andamento'
    END,
    updated_at = NOW()
  WHERE cliente_id = v_cliente_id
    AND tipo_meta = 'engajamento'
    AND periodo_inicio = v_mes_ref;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_meta_posts ON posts_planejamento;
CREATE TRIGGER trg_sync_meta_posts
  AFTER INSERT OR UPDATE OF status ON posts_planejamento
  FOR EACH ROW EXECUTE FUNCTION fn_sync_meta_engajamento();

-- 4.2 Criar Trigger de Meta de Receita (Nova)
CREATE OR REPLACE FUNCTION fn_sync_meta_receita()
RETURNS TRIGGER AS $$
DECLARE
  v_cliente_id UUID;
  v_mes_ref DATE;
  v_total_receita NUMERIC;
BEGIN
  IF NEW.tipo = 'receita' THEN
    v_cliente_id := NEW.cliente_id;
    v_mes_ref := DATE_TRUNC('month', NEW.data_vencimento)::date;
    
    -- Calcular receita do mês
    SELECT COALESCE(SUM(valor), 0)
    INTO v_total_receita
    FROM transacoes_financeiras
    WHERE cliente_id = v_cliente_id
      AND tipo = 'receita'
      AND DATE_TRUNC('month', data_vencimento)::date = v_mes_ref
      AND status IN ('pago', 'pendente');
    
    -- Atualizar meta de receita/vendas
    UPDATE cliente_metas
    SET 
      valor_atual = v_total_receita,
      progresso_percent = ROUND((v_total_receita / NULLIF(valor_alvo, 0)) * 100, 2),
      status = CASE
        WHEN v_total_receita >= valor_alvo THEN 'concluida'
        WHEN v_total_receita >= valor_alvo * 0.7 THEN 'em_andamento'
        ELSE 'em_andamento'
      END,
      updated_at = NOW()
    WHERE cliente_id = v_cliente_id
      AND tipo_meta IN ('vendas', 'receita')
      AND periodo_inicio = v_mes_ref;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_meta_receita ON transacoes_financeiras;
CREATE TRIGGER trg_sync_meta_receita
  AFTER INSERT OR UPDATE OF valor, status ON transacoes_financeiras
  FOR EACH ROW EXECUTE FUNCTION fn_sync_meta_receita();

-- ==========================================
-- INICIALIZAÇÃO
-- ==========================================

-- Refresh inicial da timeline
SELECT refresh_cliente_timeline();

-- Log de conclusão
DO $$
BEGIN
  RAISE NOTICE '✅ FASE 2 IMPLEMENTADA: Auditoria Universal + Timeline + Metas Auto-Sync';
  RAISE NOTICE '📊 Ganho Esperado: +22%% (73%% → 95%%)';
END $$;
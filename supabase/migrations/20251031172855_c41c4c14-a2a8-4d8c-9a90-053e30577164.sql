-- ============================================================
-- FASE 2: AUDITORIA COMPLETA + SINCRONIZAÇÃO DE METAS
-- ============================================================

-- 1️⃣ CRIAR TRIGGERS DE AUDITORIA EM 20 TABELAS CRÍTICAS
-- ============================================================

-- Pessoas
DROP TRIGGER IF EXISTS trg_audit_pessoas ON public.pessoas;
CREATE TRIGGER trg_audit_pessoas
  AFTER INSERT OR UPDATE OR DELETE ON public.pessoas
  FOR EACH ROW EXECUTE FUNCTION fn_audit_universal();

-- Clientes
DROP TRIGGER IF EXISTS trg_audit_clientes ON public.clientes;
CREATE TRIGGER trg_audit_clientes
  AFTER INSERT OR UPDATE OR DELETE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION fn_audit_universal();

-- Projetos
DROP TRIGGER IF EXISTS trg_audit_projetos ON public.projetos;
CREATE TRIGGER trg_audit_projetos
  AFTER INSERT OR UPDATE OR DELETE ON public.projetos
  FOR EACH ROW EXECUTE FUNCTION fn_audit_universal();

-- Tarefas
DROP TRIGGER IF EXISTS trg_audit_tarefa ON public.tarefa;
CREATE TRIGGER trg_audit_tarefa
  AFTER INSERT OR UPDATE OR DELETE ON public.tarefa
  FOR EACH ROW EXECUTE FUNCTION fn_audit_universal();

-- Eventos Calendário
DROP TRIGGER IF EXISTS trg_audit_eventos_calendario ON public.eventos_calendario;
CREATE TRIGGER trg_audit_eventos_calendario
  AFTER INSERT OR UPDATE OR DELETE ON public.eventos_calendario
  FOR EACH ROW EXECUTE FUNCTION fn_audit_universal();

-- Transações Financeiras
DROP TRIGGER IF EXISTS trg_audit_transacoes_financeiras ON public.transacoes_financeiras;
CREATE TRIGGER trg_audit_transacoes_financeiras
  AFTER INSERT OR UPDATE OR DELETE ON public.transacoes_financeiras
  FOR EACH ROW EXECUTE FUNCTION fn_audit_universal();

-- Folha de Pagamento
DROP TRIGGER IF EXISTS trg_audit_financeiro_folha ON public.financeiro_folha;
CREATE TRIGGER trg_audit_financeiro_folha
  AFTER INSERT OR UPDATE OR DELETE ON public.financeiro_folha
  FOR EACH ROW EXECUTE FUNCTION fn_audit_universal();

-- Credenciais
DROP TRIGGER IF EXISTS trg_audit_credenciais_cliente ON public.credenciais_cliente;
CREATE TRIGGER trg_audit_credenciais_cliente
  AFTER INSERT OR UPDATE OR DELETE ON public.credenciais_cliente
  FOR EACH ROW EXECUTE FUNCTION fn_audit_universal();

-- Aprovações
DROP TRIGGER IF EXISTS trg_audit_aprovacoes_cliente ON public.aprovacoes_cliente;
CREATE TRIGGER trg_audit_aprovacoes_cliente
  AFTER INSERT OR UPDATE OR DELETE ON public.aprovacoes_cliente
  FOR EACH ROW EXECUTE FUNCTION fn_audit_universal();

-- Briefings
DROP TRIGGER IF EXISTS trg_audit_briefings ON public.briefings;
CREATE TRIGGER trg_audit_briefings
  AFTER INSERT OR UPDATE OR DELETE ON public.briefings
  FOR EACH ROW EXECUTE FUNCTION fn_audit_universal();

-- Posts Planejamento
DROP TRIGGER IF EXISTS trg_audit_posts_planejamento ON public.posts_planejamento;
CREATE TRIGGER trg_audit_posts_planejamento
  AFTER INSERT OR UPDATE OR DELETE ON public.posts_planejamento
  FOR EACH ROW EXECUTE FUNCTION fn_audit_universal();

-- Planejamentos
DROP TRIGGER IF EXISTS trg_audit_planejamentos ON public.planejamentos;
CREATE TRIGGER trg_audit_planejamentos
  AFTER INSERT OR UPDATE OR DELETE ON public.planejamentos
  FOR EACH ROW EXECUTE FUNCTION fn_audit_universal();

-- Inventário Itens
DROP TRIGGER IF EXISTS trg_audit_inventario_itens ON public.inventario_itens;
CREATE TRIGGER trg_audit_inventario_itens
  AFTER INSERT OR UPDATE OR DELETE ON public.inventario_itens
  FOR EACH ROW EXECUTE FUNCTION fn_audit_universal();

-- Inventário Reservas
DROP TRIGGER IF EXISTS trg_audit_inventario_reservas ON public.inventario_reservas;
CREATE TRIGGER trg_audit_inventario_reservas
  AFTER INSERT OR UPDATE OR DELETE ON public.inventario_reservas
  FOR EACH ROW EXECUTE FUNCTION fn_audit_universal();

-- User Roles
DROP TRIGGER IF EXISTS trg_audit_user_roles ON public.user_roles;
CREATE TRIGGER trg_audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION fn_audit_universal();

-- Contratos
DROP TRIGGER IF EXISTS trg_audit_contratos ON public.contratos;
CREATE TRIGGER trg_audit_contratos
  AFTER INSERT OR UPDATE OR DELETE ON public.contratos
  FOR EACH ROW EXECUTE FUNCTION fn_audit_universal();

-- Fornecedores
DROP TRIGGER IF EXISTS trg_audit_fornecedores ON public.fornecedores;
CREATE TRIGGER trg_audit_fornecedores
  AFTER INSERT OR UPDATE OR DELETE ON public.fornecedores
  FOR EACH ROW EXECUTE FUNCTION fn_audit_universal();

-- Cliente Onboarding
DROP TRIGGER IF EXISTS trg_audit_cliente_onboarding ON public.cliente_onboarding;
CREATE TRIGGER trg_audit_cliente_onboarding
  AFTER INSERT OR UPDATE OR DELETE ON public.cliente_onboarding
  FOR EACH ROW EXECUTE FUNCTION fn_audit_universal();

-- Notificações
DROP TRIGGER IF EXISTS trg_audit_notificacoes ON public.notificacoes;
CREATE TRIGGER trg_audit_notificacoes
  AFTER INSERT OR UPDATE OR DELETE ON public.notificacoes
  FOR EACH ROW EXECUTE FUNCTION fn_audit_universal();

-- Cliente Metas
DROP TRIGGER IF EXISTS trg_audit_cliente_metas ON public.cliente_metas;
CREATE TRIGGER trg_audit_cliente_metas
  AFTER INSERT OR UPDATE OR DELETE ON public.cliente_metas
  FOR EACH ROW EXECUTE FUNCTION fn_audit_universal();


-- 2️⃣ SINCRONIZAÇÃO AUTOMÁTICA DE METAS
-- ============================================================

-- Função: Sincronizar meta de engajamento quando posts são publicados
CREATE OR REPLACE FUNCTION fn_sync_meta_engajamento()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  v_cliente_id UUID;
  v_mes_ref DATE;
  v_total_publicados INTEGER;
BEGIN
  -- Buscar cliente_id e mês de referência
  SELECT pl.cliente_id, DATE_TRUNC('month', pl.mes_referencia)::DATE
  INTO v_cliente_id, v_mes_ref
  FROM planejamentos pl
  WHERE pl.id = NEW.planejamento_id;
  
  -- Contar posts publicados no mês
  SELECT COUNT(*) INTO v_total_publicados
  FROM posts_planejamento pp
  JOIN planejamentos pl ON pl.id = pp.planejamento_id
  WHERE pl.cliente_id = v_cliente_id
    AND DATE_TRUNC('month', pl.mes_referencia) = v_mes_ref
    AND pp.status = 'publicado';
  
  -- Atualizar meta de engajamento
  UPDATE cliente_metas
  SET 
    valor_atual = v_total_publicados,
    progresso_percent = ROUND((v_total_publicados::NUMERIC / NULLIF(valor_alvo, 0)) * 100, 2),
    status = CASE
      WHEN v_total_publicados >= valor_alvo THEN 'concluida'
      WHEN v_total_publicados > 0 THEN 'em_andamento'
      ELSE 'pendente'
    END,
    updated_at = NOW()
  WHERE cliente_id = v_cliente_id
    AND tipo_meta = 'engajamento'
    AND periodo_inicio = v_mes_ref;
  
  RETURN NEW;
END;
$$;

-- Trigger: Sincronizar meta quando post é publicado
DROP TRIGGER IF EXISTS trg_sync_meta_posts ON public.posts_planejamento;
CREATE TRIGGER trg_sync_meta_posts
  AFTER INSERT OR UPDATE OF status ON public.posts_planejamento
  FOR EACH ROW 
  WHEN (NEW.status = 'publicado')
  EXECUTE FUNCTION fn_sync_meta_engajamento();


-- Função: Sincronizar meta de receita quando transação é registrada
CREATE OR REPLACE FUNCTION fn_sync_meta_receita()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  v_total_receita NUMERIC;
  v_mes_ref DATE;
BEGIN
  -- Só processar se for receita
  IF NEW.tipo = 'receita' AND NEW.cliente_id IS NOT NULL THEN
    v_mes_ref := DATE_TRUNC('month', NEW.data_vencimento)::DATE;
    
    -- Calcular total de receitas do mês
    SELECT COALESCE(SUM(valor), 0) INTO v_total_receita
    FROM transacoes_financeiras
    WHERE cliente_id = NEW.cliente_id
      AND tipo = 'receita'
      AND DATE_TRUNC('month', data_vencimento) = v_mes_ref
      AND status IN ('pago', 'parcialmente_pago');
    
    -- Atualizar meta de receita
    UPDATE cliente_metas
    SET 
      valor_atual = v_total_receita,
      progresso_percent = ROUND((v_total_receita / NULLIF(valor_alvo, 0)) * 100, 2),
      status = CASE
        WHEN v_total_receita >= valor_alvo THEN 'concluida'
        WHEN v_total_receita > 0 THEN 'em_andamento'
        ELSE 'pendente'
      END,
      updated_at = NOW()
    WHERE cliente_id = NEW.cliente_id
      AND tipo_meta = 'receita'
      AND periodo_inicio = v_mes_ref;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger: Sincronizar meta quando receita é registrada
DROP TRIGGER IF EXISTS trg_sync_meta_receita ON public.transacoes_financeiras;
CREATE TRIGGER trg_sync_meta_receita
  AFTER INSERT OR UPDATE OF valor, status ON public.transacoes_financeiras
  FOR EACH ROW 
  EXECUTE FUNCTION fn_sync_meta_receita();


-- ✅ VALIDAÇÃO FASE 2
COMMENT ON TRIGGER trg_audit_pessoas ON public.pessoas IS 'Fase 2: Auditoria automática ativa';
COMMENT ON FUNCTION fn_sync_meta_engajamento() IS 'Fase 2: Sincronização automática de metas de engajamento';
COMMENT ON FUNCTION fn_sync_meta_receita() IS 'Fase 2: Sincronização automática de metas de receita';
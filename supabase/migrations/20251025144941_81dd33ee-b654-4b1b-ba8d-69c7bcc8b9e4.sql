-- ============================================================================
-- INTEGRAÇÃO FINANCEIRA COMPLETA ✅ (FINAL - SEM VIEWS PROBLEMÁTICAS)
-- ============================================================================

-- 1. ADICIONAR COLUNAS
ALTER TABLE financeiro_lancamentos
ADD COLUMN IF NOT EXISTS projeto_id UUID REFERENCES projetos(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS tarefa_id UUID REFERENCES tarefa(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS evento_id UUID REFERENCES eventos_calendario(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS folha_item_id UUID REFERENCES financeiro_folha_itens(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL;

-- 2. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_lancamentos_projeto ON financeiro_lancamentos(projeto_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_tarefa ON financeiro_lancamentos(tarefa_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_evento ON financeiro_lancamentos(evento_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_folha ON financeiro_lancamentos(folha_item_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_cliente ON financeiro_lancamentos(cliente_id);

-- 3. ✅ TRIGGER: Tarefas finalizadas → Registro automático de custo
CREATE OR REPLACE FUNCTION fn_registrar_custo_tarefa()
RETURNS TRIGGER AS $$
DECLARE v_valor_hora NUMERIC := 150.00; v_custo NUMERIC; v_cc UUID; v_debito UUID; v_credito UUID;
BEGIN
  IF NEW.status::text = 'finalizada' AND (OLD.status IS NULL OR OLD.status::text != 'finalizada') THEN
    v_custo := v_valor_hora * COALESCE(NEW.horas_estimadas, 4);
    SELECT p.centro_custo_id INTO v_cc FROM projetos p WHERE p.id = NEW.projeto_id;
    SELECT id INTO v_debito FROM plano_contas WHERE codigo LIKE '3.1%' LIMIT 1;
    SELECT id INTO v_credito FROM plano_contas WHERE codigo LIKE '2.1%' LIMIT 1;
    INSERT INTO financeiro_lancamentos (numero_lancamento, data_lancamento, descricao, tipo_origem, origem_id, tarefa_id, projeto_id, cliente_id, conta_debito_id, conta_credito_id, valor, centro_custo_id, created_by)
    VALUES ((SELECT COALESCE(MAX(numero_lancamento), 0) + 1 FROM financeiro_lancamentos), CURRENT_DATE, 'Custo execução: ' || NEW.titulo, 'tarefa', NEW.id, NEW.id, NEW.projeto_id, NEW.cliente_id, v_debito, v_credito, v_custo, v_cc, NEW.executor_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_registrar_custo_tarefa ON tarefa;
CREATE TRIGGER trg_registrar_custo_tarefa AFTER UPDATE ON tarefa FOR EACH ROW WHEN (NEW.status::text = 'finalizada') EXECUTE FUNCTION fn_registrar_custo_tarefa();

-- 4. ✅ TRIGGER: Eventos externos → Registro automático de custo de deslocamento
CREATE OR REPLACE FUNCTION fn_registrar_custo_evento()
RETURNS TRIGGER AS $$
DECLARE v_custo NUMERIC := 50.00; v_debito UUID; v_credito UUID;
BEGIN
  IF NEW.tipo IN ('captacao_externa', 'reuniao_externa', 'evento_cliente') THEN
    SELECT id INTO v_debito FROM plano_contas WHERE codigo LIKE '3.2%' LIMIT 1;
    SELECT id INTO v_credito FROM plano_contas WHERE codigo LIKE '1.1%' LIMIT 1;
    INSERT INTO financeiro_lancamentos (numero_lancamento, data_lancamento, descricao, tipo_origem, origem_id, evento_id, cliente_id, conta_debito_id, conta_credito_id, valor, created_by)
    VALUES ((SELECT COALESCE(MAX(numero_lancamento), 0) + 1 FROM financeiro_lancamentos), NEW.data_inicio::DATE, 'Custo evento: ' || NEW.titulo, 'evento', NEW.id, NEW.id, NEW.cliente_id, v_debito, v_credito, v_custo, NEW.responsavel_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_registrar_custo_evento ON eventos_calendario;
CREATE TRIGGER trg_registrar_custo_evento AFTER INSERT ON eventos_calendario FOR EACH ROW EXECUTE FUNCTION fn_registrar_custo_evento();

-- 5. ✅ TRIGGER: Folha paga → Registro contábil automático
CREATE OR REPLACE FUNCTION fn_registrar_lancamento_folha()
RETURNS TRIGGER AS $$
DECLARE v_debito UUID; v_credito UUID; v_cc UUID;
BEGIN
  IF NEW.status::text = 'pago' AND (OLD.status IS NULL OR OLD.status::text != 'pago') THEN
    SELECT id INTO v_debito FROM plano_contas WHERE codigo LIKE '3.3%' LIMIT 1;
    SELECT id INTO v_credito FROM plano_contas WHERE codigo LIKE '1.1%' LIMIT 1;
    SELECT centro_custo_id INTO v_cc FROM colaboradores WHERE id = NEW.colaborador_id;
    INSERT INTO financeiro_lancamentos (numero_lancamento, data_lancamento, descricao, tipo_origem, origem_id, folha_item_id, conta_debito_id, conta_credito_id, valor, centro_custo_id)
    VALUES ((SELECT COALESCE(MAX(numero_lancamento), 0) + 1 FROM financeiro_lancamentos), NEW.data_pagamento, 'Pagamento folha: ' || (SELECT nome FROM colaboradores WHERE id = NEW.colaborador_id), 'folha', NEW.folha_id, NEW.id, v_debito, v_credito, NEW.liquido, v_cc);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_registrar_lancamento_folha ON financeiro_folha_itens;
CREATE TRIGGER trg_registrar_lancamento_folha AFTER UPDATE ON financeiro_folha_itens FOR EACH ROW WHEN (NEW.status::text = 'pago') EXECUTE FUNCTION fn_registrar_lancamento_folha();

-- 6. ✅ RPC: Financeiro Integrado (melhorado)
CREATE OR REPLACE FUNCTION get_financeiro_integrado(p_projeto_id UUID DEFAULT NULL, p_cliente_id UUID DEFAULT NULL, p_data_inicio DATE DEFAULT NULL, p_data_fim DATE DEFAULT NULL)
RETURNS TABLE (id UUID, data_lancamento DATE, descricao TEXT, tipo TEXT, valor NUMERIC, tipo_origem TEXT, tarefa_titulo TEXT, tarefa_status TEXT, evento_titulo TEXT, evento_tipo TEXT, projeto_titulo TEXT, colaborador_nome TEXT, centro_custo_nome TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT fl.id, fl.data_lancamento::DATE, fl.descricao,
    CASE WHEN pc.tipo_conta = 'despesa' THEN 'despesa'::TEXT WHEN pc.tipo_conta = 'receita' THEN 'receita'::TEXT ELSE 'outro'::TEXT END AS tipo,
    fl.valor, fl.tipo_origem, t.titulo AS tarefa_titulo, t.status::TEXT AS tarefa_status, e.titulo AS evento_titulo, e.tipo::TEXT AS evento_tipo,
    p.titulo AS projeto_titulo, col.nome AS colaborador_nome, cc.nome AS centro_custo_nome
  FROM financeiro_lancamentos fl
  LEFT JOIN plano_contas pc ON pc.id = fl.conta_debito_id
  LEFT JOIN tarefa t ON t.id = fl.tarefa_id
  LEFT JOIN eventos_calendario e ON e.id = fl.evento_id
  LEFT JOIN projetos p ON p.id = fl.projeto_id
  LEFT JOIN financeiro_folha_itens ffi ON ffi.id = fl.folha_item_id
  LEFT JOIN colaboradores col ON col.id = ffi.colaborador_id
  LEFT JOIN centros_custo cc ON cc.id = fl.centro_custo_id
  WHERE (p_projeto_id IS NULL OR fl.projeto_id = p_projeto_id)
    AND (p_cliente_id IS NULL OR fl.cliente_id = p_cliente_id)
    AND (p_data_inicio IS NULL OR fl.data_lancamento >= p_data_inicio)
    AND (p_data_fim IS NULL OR fl.data_lancamento <= p_data_fim)
  ORDER BY fl.data_lancamento DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON COLUMN financeiro_lancamentos.projeto_id IS 'Rastreamento automático de custos por projeto';
COMMENT ON COLUMN financeiro_lancamentos.tarefa_id IS 'Custo de execução de tarefas (R$/hora automático)';
COMMENT ON COLUMN financeiro_lancamentos.evento_id IS 'Custos de eventos/captações/deslocamentos';
COMMENT ON COLUMN financeiro_lancamentos.folha_item_id IS 'Lançamento contábil de pagamento de folha';
COMMENT ON COLUMN financeiro_lancamentos.cliente_id IS 'Análise financeira por cliente';
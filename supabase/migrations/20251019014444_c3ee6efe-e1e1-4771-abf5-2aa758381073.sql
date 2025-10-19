-- ============================================
-- SPRINT 2: INTEGRAÇÃO FINANCEIRA TOTAL
-- Triggers para gerar lançamentos automáticos
-- ============================================

-- ============================================
-- 1. FUNÇÃO: Gerar Receita ao Concluir Tarefa
-- ============================================
CREATE OR REPLACE FUNCTION public.fn_gerar_receita_tarefa()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_projeto RECORD;
  v_valor_receita NUMERIC;
  v_conta_receita UUID;
BEGIN
  -- Apenas gerar receita para tarefas concluídas
  IF NEW.status != 'concluida' OR OLD.status = 'concluida' THEN
    RETURN NEW;
  END IF;

  -- Buscar dados do projeto
  SELECT p.*, p.orcamento, p.cliente_id
  INTO v_projeto
  FROM projetos p
  WHERE p.id = NEW.projeto_id;

  IF v_projeto.id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calcular valor proporcional (orçamento / número total de tarefas do projeto)
  SELECT 
    COALESCE(v_projeto.orcamento / NULLIF(COUNT(*), 0), 0)
  INTO v_valor_receita
  FROM tarefa
  WHERE projeto_id = NEW.projeto_id;

  -- Buscar conta de receita de serviços (código 3.1.01.001)
  SELECT id INTO v_conta_receita
  FROM financeiro_plano_contas
  WHERE codigo = '3.1.01.001'
  LIMIT 1;

  -- Criar lançamento financeiro
  IF v_valor_receita > 0 AND v_conta_receita IS NOT NULL THEN
    INSERT INTO financeiro_lancamentos (
      data_lancamento,
      descricao,
      tipo_origem,
      origem_id,
      conta_credito_id,
      valor,
      created_by
    ) VALUES (
      CURRENT_DATE,
      'Receita - Conclusão: ' || NEW.titulo,
      'tarefa',
      NEW.id,
      v_conta_receita,
      v_valor_receita,
      auth.uid()
    );

    -- Criar transação financeira para rastreamento
    INSERT INTO transacoes_financeiras (
      cliente_id,
      titulo,
      descricao,
      tipo,
      valor,
      status,
      data_vencimento,
      data_pagamento,
      categoria_id
    ) VALUES (
      v_projeto.cliente_id,
      'Receita - ' || NEW.titulo,
      'Tarefa concluída no projeto: ' || v_projeto.titulo,
      'receita',
      v_valor_receita,
      'pago',
      CURRENT_DATE,
      CURRENT_DATE,
      v_conta_receita
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger para executar após update em tarefa
DROP TRIGGER IF EXISTS trg_gerar_receita_tarefa ON tarefa;
CREATE TRIGGER trg_gerar_receita_tarefa
  AFTER UPDATE ON tarefa
  FOR EACH ROW
  EXECUTE FUNCTION fn_gerar_receita_tarefa();

-- ============================================
-- 2. FUNÇÃO: Gerar Despesa de Eventos (Captação/Deslocamento)
-- ============================================
CREATE OR REPLACE FUNCTION public.fn_gerar_despesa_evento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valor_despesa NUMERIC := 0;
  v_conta_despesa UUID;
  v_descricao TEXT;
BEGIN
  -- Apenas para eventos de captação externa e deslocamento
  IF NEW.tipo NOT IN ('captacao_externa', 'deslocamento') THEN
    RETURN NEW;
  END IF;

  -- Calcular custo baseado no tipo
  CASE NEW.tipo
    WHEN 'captacao_externa' THEN
      -- Custo médio de captação externa: R$ 300 (combustível, pedágio, alimentação)
      v_valor_despesa := 300.00;
      v_descricao := 'Despesa - Captação Externa: ' || NEW.titulo;
      
    WHEN 'deslocamento' THEN
      -- Custo de deslocamento baseado no tipo
      CASE NEW.tipo_deslocamento
        WHEN 'curto' THEN v_valor_despesa := 50.00;  -- 30min
        WHEN 'medio' THEN v_valor_despesa := 100.00; -- 45min
        WHEN 'longo' THEN v_valor_despesa := 150.00; -- 60min
        ELSE v_valor_despesa := 75.00;
      END CASE;
      v_descricao := 'Despesa - Deslocamento: ' || COALESCE(NEW.local, 'Local não especificado');
  END CASE;

  -- Buscar conta de despesas operacionais (código 4.1.02.001)
  SELECT id INTO v_conta_despesa
  FROM financeiro_plano_contas
  WHERE codigo = '4.1.02.001'
  LIMIT 1;

  -- Criar lançamento financeiro
  IF v_valor_despesa > 0 AND v_conta_despesa IS NOT NULL THEN
    INSERT INTO financeiro_lancamentos (
      data_lancamento,
      descricao,
      tipo_origem,
      origem_id,
      conta_debito_id,
      valor,
      created_by
    ) VALUES (
      COALESCE(NEW.data_inicio::DATE, CURRENT_DATE),
      v_descricao,
      'evento',
      NEW.id,
      v_conta_despesa,
      v_valor_despesa,
      COALESCE(NEW.created_by, auth.uid())
    );

    -- Criar transação financeira
    IF NEW.cliente_id IS NOT NULL THEN
      INSERT INTO transacoes_financeiras (
        cliente_id,
        titulo,
        descricao,
        tipo,
        valor,
        status,
        data_vencimento
      ) VALUES (
        NEW.cliente_id,
        'Despesa - ' || NEW.tipo,
        v_descricao,
        'despesa',
        v_valor_despesa,
        'pendente',
        COALESCE(NEW.data_inicio::DATE, CURRENT_DATE)
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger para executar após insert em eventos_calendario
DROP TRIGGER IF EXISTS trg_gerar_despesa_evento ON eventos_calendario;
CREATE TRIGGER trg_gerar_despesa_evento
  AFTER INSERT ON eventos_calendario
  FOR EACH ROW
  EXECUTE FUNCTION fn_gerar_despesa_evento();

-- ============================================
-- 3. FUNÇÃO: Gerar Despesas de Folha de Pagamento
-- ============================================
CREATE OR REPLACE FUNCTION public.fn_gerar_despesa_folha()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conta_salarios UUID;
  v_conta_encargos UUID;
BEGIN
  -- Apenas quando folha for fechada
  IF NEW.status != 'fechada' OR (OLD.status IS NOT NULL AND OLD.status = 'fechada') THEN
    RETURN NEW;
  END IF;

  -- Buscar contas contábeis
  SELECT id INTO v_conta_salarios
  FROM financeiro_plano_contas
  WHERE codigo = '4.1.01.001' -- Despesas com Pessoal - Salários
  LIMIT 1;

  SELECT id INTO v_conta_encargos
  FROM financeiro_plano_contas
  WHERE codigo = '4.1.01.002' -- Despesas com Pessoal - Encargos
  LIMIT 1;

  -- Lançamento de Proventos (Salários)
  IF COALESCE(NEW.total_proventos, 0) > 0 AND v_conta_salarios IS NOT NULL THEN
    INSERT INTO financeiro_lancamentos (
      data_lancamento,
      descricao,
      tipo_origem,
      origem_id,
      conta_debito_id,
      valor,
      created_by
    ) VALUES (
      NEW.competencia,
      'Folha de Pagamento - Proventos - ' || TO_CHAR(NEW.competencia, 'MM/YYYY'),
      'folha',
      NEW.id,
      v_conta_salarios,
      NEW.total_proventos,
      COALESCE(NEW.fechada_por, auth.uid())
    );
  END IF;

  -- Lançamento de Encargos
  IF COALESCE(NEW.total_encargos, 0) > 0 AND v_conta_encargos IS NOT NULL THEN
    INSERT INTO financeiro_lancamentos (
      data_lancamento,
      descricao,
      tipo_origem,
      origem_id,
      conta_debito_id,
      valor,
      created_by
    ) VALUES (
      NEW.competencia,
      'Folha de Pagamento - Encargos - ' || TO_CHAR(NEW.competencia, 'MM/YYYY'),
      'folha',
      NEW.id,
      v_conta_encargos,
      NEW.total_encargos,
      COALESCE(NEW.fechada_por, auth.uid())
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger para executar após update em financeiro_folha
DROP TRIGGER IF EXISTS trg_gerar_despesa_folha ON financeiro_folha;
CREATE TRIGGER trg_gerar_despesa_folha
  AFTER UPDATE ON financeiro_folha
  FOR EACH ROW
  EXECUTE FUNCTION fn_gerar_despesa_folha();

-- ============================================
-- 4. VIEW: Financeiro com Origem Consolidada
-- ============================================
CREATE OR REPLACE VIEW vw_financeiro_origem AS
SELECT 
  fl.id,
  fl.data_lancamento,
  fl.descricao,
  fl.tipo_origem,
  fl.origem_id,
  fl.valor,
  fl.created_at,
  
  -- Dados de Tarefa (se origem = tarefa)
  t.titulo as tarefa_titulo,
  t.status as tarefa_status,
  t.projeto_id,
  
  -- Dados de Projeto
  p.titulo as projeto_titulo,
  p.cliente_id,
  
  -- Dados de Cliente
  c.nome as cliente_nome,
  
  -- Dados de Evento (se origem = evento)
  e.titulo as evento_titulo,
  e.tipo as evento_tipo,
  e.data_inicio as evento_data,
  
  -- Dados de Folha (se origem = folha)
  ff.competencia as folha_competencia,
  ff.total_colaboradores as folha_total_colaboradores,
  
  -- Plano de Contas
  pc_debito.nome as conta_debito_nome,
  pc_credito.nome as conta_credito_nome,
  
  -- Cálculos
  CASE 
    WHEN fl.conta_credito_id IS NOT NULL THEN 'receita'
    WHEN fl.conta_debito_id IS NOT NULL THEN 'despesa'
    ELSE 'indefinido'
  END as tipo_transacao,
  
  -- Margem (apenas para receitas vinculadas a projetos)
  CASE 
    WHEN p.id IS NOT NULL AND fl.conta_credito_id IS NOT NULL THEN
      ROUND((fl.valor / NULLIF(p.orcamento, 0)) * 100, 2)
    ELSE NULL
  END as percentual_projeto

FROM financeiro_lancamentos fl
LEFT JOIN tarefa t ON fl.tipo_origem = 'tarefa' AND fl.origem_id = t.id
LEFT JOIN projetos p ON t.projeto_id = p.id OR (fl.tipo_origem = 'projeto' AND fl.origem_id = p.id)
LEFT JOIN clientes c ON p.cliente_id = c.id
LEFT JOIN eventos_calendario e ON fl.tipo_origem = 'evento' AND fl.origem_id = e.id
LEFT JOIN financeiro_folha ff ON fl.tipo_origem = 'folha' AND fl.origem_id = ff.id
LEFT JOIN financeiro_plano_contas pc_debito ON fl.conta_debito_id = pc_debito.id
LEFT JOIN financeiro_plano_contas pc_credito ON fl.conta_credito_id = pc_credito.id
ORDER BY fl.data_lancamento DESC;

-- ============================================
-- 5. MATERIALIZED VIEW: Dashboard Financeiro (Performance)
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_financeiro AS
WITH ultimos_12_meses AS (
  SELECT generate_series(
    DATE_TRUNC('month', CURRENT_DATE - INTERVAL '11 months'),
    DATE_TRUNC('month', CURRENT_DATE),
    '1 month'::interval
  ) as mes
),
receitas_mes AS (
  SELECT 
    DATE_TRUNC('month', fl.data_lancamento) as mes,
    SUM(fl.valor) as total_receitas,
    COUNT(*) as qtd_receitas
  FROM financeiro_lancamentos fl
  WHERE fl.conta_credito_id IS NOT NULL
    AND fl.data_lancamento >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY DATE_TRUNC('month', fl.data_lancamento)
),
despesas_mes AS (
  SELECT 
    DATE_TRUNC('month', fl.data_lancamento) as mes,
    SUM(fl.valor) as total_despesas,
    COUNT(*) as qtd_despesas
  FROM financeiro_lancamentos fl
  WHERE fl.conta_debito_id IS NOT NULL
    AND fl.data_lancamento >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY DATE_TRUNC('month', fl.data_lancamento)
)
SELECT 
  um.mes,
  COALESCE(r.total_receitas, 0) as total_receitas,
  COALESCE(d.total_despesas, 0) as total_despesas,
  COALESCE(r.total_receitas, 0) - COALESCE(d.total_despesas, 0) as saldo,
  ROUND(
    CASE 
      WHEN COALESCE(r.total_receitas, 0) > 0 THEN 
        ((COALESCE(r.total_receitas, 0) - COALESCE(d.total_despesas, 0)) / r.total_receitas) * 100
      ELSE 0
    END, 2
  ) as margem_lucro_percent,
  COALESCE(r.qtd_receitas, 0) as qtd_receitas,
  COALESCE(d.qtd_despesas, 0) as qtd_despesas
FROM ultimos_12_meses um
LEFT JOIN receitas_mes r ON um.mes = r.mes
LEFT JOIN despesas_mes d ON um.mes = d.mes
ORDER BY um.mes DESC;

-- Criar índice único para refresh concorrente
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dashboard_financeiro_mes 
ON mv_dashboard_financeiro (mes);

-- ============================================
-- 6. FUNÇÃO: Refresh Automático da Materialized View
-- ============================================
CREATE OR REPLACE FUNCTION public.refresh_dashboard_financeiro()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_financeiro;
END;
$$;

-- ============================================
-- 7. ÍNDICES para Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_financeiro_lancamentos_tipo_origem 
ON financeiro_lancamentos(tipo_origem, origem_id);

CREATE INDEX IF NOT EXISTS idx_financeiro_lancamentos_data 
ON financeiro_lancamentos(data_lancamento DESC);

CREATE INDEX IF NOT EXISTS idx_tarefa_status_projeto 
ON tarefa(status, projeto_id);

CREATE INDEX IF NOT EXISTS idx_eventos_tipo 
ON eventos_calendario(tipo);

-- ============================================
-- 8. GRANTS para Acesso
-- ============================================
GRANT SELECT ON vw_financeiro_origem TO authenticated;
GRANT SELECT ON mv_dashboard_financeiro TO authenticated;
-- ============================================
-- FASE 5A-B FIX v3: Correção final (sem especialidade)
-- ============================================

-- 0️⃣ Remover triggers
DROP TRIGGER IF EXISTS trg_projeto_aprovado_gera_receita ON public.projetos;
DROP TRIGGER IF EXISTS trg_tarefa_concluida_gera_custo ON public.tarefa;

-- 1️⃣ Função: Gerar receita ao ativar projeto
CREATE OR REPLACE FUNCTION public.fn_projeto_gera_receita()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conta_receita_id UUID;
  v_conta_caixa_id UUID;
  v_valor_receita NUMERIC;
BEGIN
  SELECT id INTO v_conta_caixa_id FROM financeiro_plano_contas WHERE codigo = '1.1.01.001' LIMIT 1;
  SELECT id INTO v_conta_receita_id FROM financeiro_plano_contas WHERE codigo = '3.1.01.001' LIMIT 1;

  v_valor_receita := COALESCE(NEW.orcamento, NEW.orcamento_estimado, 0);

  IF v_valor_receita > 0 AND v_conta_caixa_id IS NOT NULL AND v_conta_receita_id IS NOT NULL THEN
    INSERT INTO financeiro_lancamentos (data_lancamento, descricao, tipo_origem, origem_id, conta_debito_id, conta_credito_id, valor, created_by)
    VALUES (NOW(), 'Receita - Projeto: ' || NEW.titulo, 'projeto', NEW.id, v_conta_caixa_id, v_conta_receita_id, v_valor_receita, NEW.created_by);
  END IF;

  RETURN NEW;
END;
$$;

-- 2️⃣ Trigger: Projeto ativo → receita
CREATE TRIGGER trg_projeto_aprovado_gera_receita
AFTER UPDATE OF status ON public.projetos
FOR EACH ROW
WHEN (NEW.status = 'ativo'::status_type AND OLD.status <> 'ativo'::status_type)
EXECUTE FUNCTION public.fn_projeto_gera_receita();

-- 3️⃣ Função: Custo ao concluir tarefa
CREATE OR REPLACE FUNCTION public.fn_tarefa_gera_custo()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conta_custo_id UUID;
  v_conta_caixa_id UUID;
  v_custo_hora NUMERIC;
  v_total_custo NUMERIC;
  v_executor_nome TEXT;
  v_horas_trabalhadas NUMERIC;
BEGIN
  SELECT id INTO v_conta_caixa_id FROM financeiro_plano_contas WHERE codigo = '1.1.01.001' LIMIT 1;
  SELECT id INTO v_conta_custo_id FROM financeiro_plano_contas WHERE codigo = '4.1.01.001' LIMIT 1;

  SELECT COALESCE(fee_mensal / 220, salario_base / 220, 50), nome_completo
  INTO v_custo_hora, v_executor_nome
  FROM rh_colaboradores
  WHERE id = NEW.executor_id
  LIMIT 1;

  v_horas_trabalhadas := COALESCE(NEW.horas_trabalhadas, NEW.horas_estimadas, 0);
  v_total_custo := v_horas_trabalhadas * COALESCE(v_custo_hora, 50);

  IF v_total_custo > 0 AND v_conta_custo_id IS NOT NULL AND v_conta_caixa_id IS NOT NULL THEN
    INSERT INTO financeiro_lancamentos (data_lancamento, descricao, tipo_origem, origem_id, conta_debito_id, conta_credito_id, valor, created_by)
    VALUES (NOW(), 'Custo - Tarefa: ' || NEW.titulo || ' (' || COALESCE(v_executor_nome, 'Executor') || ')', 'tarefa', NEW.id, v_conta_custo_id, v_conta_caixa_id, v_total_custo, COALESCE(NEW.updated_by, NEW.created_by));
  END IF;

  RETURN NEW;
END;
$$;

-- 4️⃣ Trigger: Tarefa concluída → custo
CREATE TRIGGER trg_tarefa_concluida_gera_custo
AFTER UPDATE OF status ON public.tarefa
FOR EACH ROW
WHEN (NEW.status = 'concluido'::status_tarefa_enum AND OLD.status <> 'concluido'::status_tarefa_enum)
EXECUTE FUNCTION public.fn_tarefa_gera_custo();

-- 5️⃣ Views de análise
CREATE OR REPLACE VIEW public.vw_projeto_lucro AS
SELECT 
  p.id as projeto_id,
  p.titulo as projeto_nome,
  c.nome as cliente_nome,
  p.status as projeto_status,
  p.data_inicio,
  COALESCE(SUM(CASE WHEN fl.conta_credito_id IN (SELECT id FROM financeiro_plano_contas WHERE codigo LIKE '3.%') THEN fl.valor ELSE 0 END), 0) as receita_total,
  COALESCE(SUM(CASE WHEN fl.conta_debito_id IN (SELECT id FROM financeiro_plano_contas WHERE codigo LIKE '4.%') THEN fl.valor ELSE 0 END), 0) as custo_total,
  COALESCE(SUM(CASE WHEN fl.conta_credito_id IN (SELECT id FROM financeiro_plano_contas WHERE codigo LIKE '3.%') THEN fl.valor ELSE 0 END), 0) - 
  COALESCE(SUM(CASE WHEN fl.conta_debito_id IN (SELECT id FROM financeiro_plano_contas WHERE codigo LIKE '4.%') THEN fl.valor ELSE 0 END), 0) as lucro_liquido,
  ROUND(CASE WHEN COALESCE(SUM(CASE WHEN fl.conta_credito_id IN (SELECT id FROM financeiro_plano_contas WHERE codigo LIKE '3.%') THEN fl.valor ELSE 0 END), 0) > 0 
  THEN ((COALESCE(SUM(CASE WHEN fl.conta_credito_id IN (SELECT id FROM financeiro_plano_contas WHERE codigo LIKE '3.%') THEN fl.valor ELSE 0 END), 0) - 
  COALESCE(SUM(CASE WHEN fl.conta_debito_id IN (SELECT id FROM financeiro_plano_contas WHERE codigo LIKE '4.%') THEN fl.valor ELSE 0 END), 0)) / 
  NULLIF(COALESCE(SUM(CASE WHEN fl.conta_credito_id IN (SELECT id FROM financeiro_plano_contas WHERE codigo LIKE '3.%') THEN fl.valor ELSE 0 END), 0), 0) * 100) ELSE 0 END, 2) as margem_lucro_percent
FROM public.projetos p
LEFT JOIN public.clientes c ON p.cliente_id = c.id
LEFT JOIN public.financeiro_lancamentos fl ON fl.tipo_origem = 'projeto' AND fl.origem_id = p.id
GROUP BY p.id, p.titulo, c.nome, p.status, p.data_inicio;

CREATE OR REPLACE VIEW public.vw_custo_hora_colaborador AS
SELECT 
  rc.id as colaborador_id,
  rc.nome_completo,
  rc.cargo_atual,
  rc.regime as tipo_vinculo,
  COALESCE(rc.fee_mensal / 220, rc.salario_base / 220, 50) as custo_hora,
  COUNT(t.id) as total_tarefas,
  COALESCE(SUM(t.horas_trabalhadas), 0) as horas_totais,
  COALESCE(SUM(t.horas_trabalhadas), 0) * COALESCE(rc.fee_mensal / 220, rc.salario_base / 220, 50) as custo_total_gerado,
  MAX(t.updated_at) as ultima_tarefa_concluida
FROM rh_colaboradores rc
LEFT JOIN public.tarefa t ON t.executor_id = rc.id AND t.status = 'concluido'::status_tarefa_enum
GROUP BY rc.id, rc.nome_completo, rc.cargo_atual, rc.regime, rc.fee_mensal, rc.salario_base;

-- 6️⃣ Log
INSERT INTO public.system_health_logs (check_type, status, details)
VALUES ('fase_5ab_complete', 'success', jsonb_build_object('ts', NOW()));

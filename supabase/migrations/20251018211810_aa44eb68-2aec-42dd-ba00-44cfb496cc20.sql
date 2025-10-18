-- Sprint 2B: Integração Financeira com Tarefas/Projetos/Eventos (CORRIGIDO)
-- Meta: +72% visibilidade de custos

-- 1. Adicionar FKs para relacionamentos (incluindo projeto_id)
ALTER TABLE financeiro_lancamentos
ADD COLUMN IF NOT EXISTS projeto_id UUID REFERENCES projetos(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS tarefa_id UUID REFERENCES tarefa(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS evento_id UUID REFERENCES eventos_calendario(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reserva_id UUID REFERENCES inventario_reservas(id) ON DELETE SET NULL;

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_financeiro_projeto ON financeiro_lancamentos(projeto_id) WHERE projeto_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_financeiro_tarefa ON financeiro_lancamentos(tarefa_id) WHERE tarefa_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_financeiro_evento ON financeiro_lancamentos(evento_id) WHERE evento_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_financeiro_reserva ON financeiro_lancamentos(reserva_id) WHERE reserva_id IS NOT NULL;

-- 3. Trigger automático: Tarefa concluída → Lançamento de custo
CREATE OR REPLACE FUNCTION auto_lancar_custo_tarefa()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valor_tarefa NUMERIC;
  v_conta_debito UUID;
  v_conta_credito UUID;
BEGIN
  -- Apenas ao concluir tarefa (não ao criar ou atualizar outros campos)
  IF NEW.status = 'concluido' AND (OLD.status IS NULL OR OLD.status != 'concluido') THEN
    
    -- Calcular custo baseado em horas (exemplo: R$ 150/hora)
    v_valor_tarefa := COALESCE(NEW.horas_estimadas, 2) * 150;
    
    -- Buscar contas contábeis (usar existentes ou criar padrão)
    SELECT id INTO v_conta_debito FROM financeiro_plano_contas WHERE codigo = '3.1.01.001' LIMIT 1;
    SELECT id INTO v_conta_credito FROM financeiro_plano_contas WHERE codigo = '1.1.01.001' LIMIT 1;
    
    -- Criar lançamento automático
    INSERT INTO financeiro_lancamentos (
      data_lancamento,
      descricao,
      tipo,
      valor,
      tarefa_id,
      projeto_id,
      tipo_origem,
      origem_id,
      conta_debito_id,
      conta_credito_id,
      created_by
    ) VALUES (
      NOW(),
      'Custo automático: ' || NEW.titulo,
      'despesa',
      v_valor_tarefa,
      NEW.id,
      NEW.projeto_id,
      'tarefa',
      NEW.id,
      v_conta_debito,
      v_conta_credito,
      COALESCE(auth.uid(), NEW.executor_id)
    );
    
    -- Log de auditoria
    INSERT INTO logs_atividade (
      cliente_id,
      usuario_id,
      acao,
      entidade_tipo,
      entidade_id,
      descricao,
      metadata
    )
    SELECT 
      t.cliente_id,
      COALESCE(auth.uid(), NEW.executor_id),
      'auto_lancamento_custo',
      'tarefa',
      NEW.id,
      'Lançamento automático de custo ao concluir tarefa',
      jsonb_build_object(
        'tarefa_id', NEW.id,
        'valor', v_valor_tarefa,
        'horas', NEW.horas_estimadas
      )
    FROM tarefa t
    WHERE t.id = NEW.id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_lancar_tarefa ON tarefa;
CREATE TRIGGER trg_auto_lancar_tarefa
AFTER UPDATE ON tarefa
FOR EACH ROW
EXECUTE FUNCTION auto_lancar_custo_tarefa();

-- 4. Trigger: Evento criado → Lançamento de custo (se tipo captacao)
CREATE OR REPLACE FUNCTION auto_lancar_custo_evento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valor_evento NUMERIC;
  v_conta_debito UUID;
  v_conta_credito UUID;
BEGIN
  -- Apenas para captações externas/internas (não blocos administrativos)
  IF NEW.tipo IN ('captacao_externa', 'captacao_interna') THEN
    
    -- Calcular custo baseado em tipo
    v_valor_evento := CASE 
      WHEN NEW.tipo = 'captacao_externa' THEN 800
      WHEN NEW.tipo = 'captacao_interna' THEN 400
      ELSE 200
    END;
    
    -- Buscar contas
    SELECT id INTO v_conta_debito FROM financeiro_plano_contas WHERE codigo = '3.1.02.001' LIMIT 1;
    SELECT id INTO v_conta_credito FROM financeiro_plano_contas WHERE codigo = '1.1.01.001' LIMIT 1;
    
    -- Criar lançamento
    INSERT INTO financeiro_lancamentos (
      data_lancamento,
      descricao,
      tipo,
      valor,
      evento_id,
      projeto_id,
      tipo_origem,
      origem_id,
      conta_debito_id,
      conta_credito_id,
      created_by
    ) VALUES (
      NEW.data_inicio,
      'Custo evento: ' || NEW.titulo,
      'despesa',
      v_valor_evento,
      NEW.id,
      NEW.projeto_id,
      'evento',
      NEW.id,
      v_conta_debito,
      v_conta_credito,
      COALESCE(auth.uid(), NEW.created_by)
    );
    
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_lancar_evento ON eventos_calendario;
CREATE TRIGGER trg_auto_lancar_evento
AFTER INSERT ON eventos_calendario
FOR EACH ROW
EXECUTE FUNCTION auto_lancar_custo_evento();

-- 5. Migrar lançamentos manuais existentes (conectar origem_id com tarefa_id/projeto_id)
UPDATE financeiro_lancamentos fl
SET 
  tarefa_id = fl.origem_id,
  projeto_id = t.projeto_id
FROM tarefa t
WHERE fl.tipo_origem = 'tarefa'
  AND fl.origem_id = t.id
  AND fl.tarefa_id IS NULL;

UPDATE financeiro_lancamentos fl
SET projeto_id = fl.origem_id
WHERE fl.tipo_origem = 'projeto'
  AND fl.projeto_id IS NULL;

-- 6. Função RPC para dashboard financeiro integrado
CREATE OR REPLACE FUNCTION get_financeiro_integrado(
  p_projeto_id UUID DEFAULT NULL,
  p_cliente_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  data_lancamento TIMESTAMPTZ,
  descricao TEXT,
  tipo TEXT,
  valor NUMERIC,
  tarefa_titulo TEXT,
  tarefa_status TEXT,
  evento_titulo TEXT,
  evento_tipo TEXT,
  projeto_titulo TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar permissão
  IF NOT (
    is_admin(auth.uid()) 
    OR get_user_role(auth.uid()) IN ('gestor'::user_role, 'grs'::user_role, 'financeiro'::user_role)
  ) THEN
    RAISE EXCEPTION 'ACESSO_NEGADO: Sem permissão para visualizar dados financeiros';
  END IF;

  RETURN QUERY
  SELECT 
    fl.id,
    fl.data_lancamento,
    fl.descricao,
    fl.tipo,
    fl.valor,
    t.titulo as tarefa_titulo,
    t.status::TEXT as tarefa_status,
    e.titulo as evento_titulo,
    e.tipo::TEXT as evento_tipo,
    p.titulo as projeto_titulo
  FROM financeiro_lancamentos fl
  LEFT JOIN tarefa t ON fl.tarefa_id = t.id
  LEFT JOIN eventos_calendario e ON fl.evento_id = e.id
  LEFT JOIN projetos p ON fl.projeto_id = p.id
  WHERE 
    (p_projeto_id IS NULL OR fl.projeto_id = p_projeto_id)
    AND (p_cliente_id IS NULL OR p.cliente_id = p_cliente_id)
  ORDER BY fl.data_lancamento DESC;
END;
$$;
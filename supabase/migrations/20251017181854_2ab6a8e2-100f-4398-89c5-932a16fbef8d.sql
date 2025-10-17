-- ========================================
-- DIA 3: HOMOLOGAÇÃO - TRIGGERS E VALIDAÇÕES
-- ========================================

-- 1. FINANCEIRO: Trigger para descontar adiantamentos na folha
-- ========================================
CREATE OR REPLACE FUNCTION fn_descontar_adiantamento_folha()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_total_adiantamentos NUMERIC := 0;
BEGIN
  -- Buscar total de adiantamentos do mês para o colaborador
  SELECT COALESCE(SUM(valor), 0) INTO v_total_adiantamentos
  FROM financeiro_adiantamentos
  WHERE pessoa_id = NEW.pessoa_id
    AND DATE_TRUNC('month', competencia) = DATE_TRUNC('month', NEW.competencia)
    AND status = 'aprovado';
  
  -- Atualizar o campo de adiantamentos na folha
  NEW.valor_adiantamentos := v_total_adiantamentos;
  
  RETURN NEW;
END;
$$;

-- Criar trigger antes de INSERT/UPDATE na folha de ponto
DROP TRIGGER IF EXISTS trg_descontar_adiantamento ON rh_folha_ponto;
CREATE TRIGGER trg_descontar_adiantamento
BEFORE INSERT OR UPDATE ON rh_folha_ponto
FOR EACH ROW
EXECUTE FUNCTION fn_descontar_adiantamento_folha();

COMMENT ON FUNCTION fn_descontar_adiantamento_folha IS 'Desconta automaticamente adiantamentos aprovados na folha de pagamento';

-- 2. GRS: Validação para criação de tarefas (apenas GRS)
-- ========================================
CREATE OR REPLACE FUNCTION fn_validar_criacao_tarefa()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se o usuário atual tem permissão para criar tarefas
  IF NOT (
    is_admin(auth.uid()) 
    OR get_user_role(auth.uid()) = 'grs'::user_role 
    OR get_user_role(auth.uid()) = 'gestor'::user_role
  ) THEN
    RAISE EXCEPTION 'ACESSO_NEGADO: Apenas GRS, Gestor e Admin podem criar tarefas'
      USING HINT = 'Solicite a um GRS que crie a tarefa para você';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger antes de INSERT em tarefa
DROP TRIGGER IF EXISTS trg_validar_criacao_tarefa ON tarefa;
CREATE TRIGGER trg_validar_criacao_tarefa
BEFORE INSERT ON tarefa
FOR EACH ROW
EXECUTE FUNCTION fn_validar_criacao_tarefa();

COMMENT ON FUNCTION fn_validar_criacao_tarefa IS 'Valida que apenas GRS, Gestor e Admin podem criar tarefas';

-- 3. ARSENAL: Validar disponibilidade de item antes de reserva
-- ========================================
CREATE OR REPLACE FUNCTION fn_validar_disponibilidade_item()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_item_disponivel BOOLEAN;
BEGIN
  -- Verificar se o item está disponível (não está em uso)
  SELECT NOT EXISTS (
    SELECT 1 
    FROM inventario_reservas 
    WHERE item_id = NEW.item_id 
      AND status_reserva = 'em_uso'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND (
        -- Verificar sobreposição de datas
        (NEW.inicio, NEW.fim) OVERLAPS (inicio, fim)
      )
  ) INTO v_item_disponivel;
  
  IF NOT v_item_disponivel THEN
    RAISE EXCEPTION 'ITEM_INDISPONIVEL: Este equipamento já está reservado para o período solicitado'
      USING HINT = 'Escolha outro período ou equipamento';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger antes de INSERT/UPDATE em reservas
DROP TRIGGER IF EXISTS trg_validar_disponibilidade_item ON inventario_reservas;
CREATE TRIGGER trg_validar_disponibilidade_item
BEFORE INSERT OR UPDATE ON inventario_reservas
FOR EACH ROW
EXECUTE FUNCTION fn_validar_disponibilidade_item();

COMMENT ON FUNCTION fn_validar_disponibilidade_item IS 'Valida que um item está disponível antes de criar/atualizar reserva';

-- 4. RH: Validação de termo de responsabilidade obrigatório
-- ========================================
CREATE OR REPLACE FUNCTION fn_validar_termo_responsabilidade()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se há termo anexado para colaboradores ativos
  IF NEW.status = 'aprovado' AND NEW.tipo_vinculo IN ('clt', 'pj') THEN
    IF NEW.termo_responsabilidade_url IS NULL OR NEW.termo_responsabilidade_url = '' THEN
      RAISE EXCEPTION 'TERMO_OBRIGATORIO: Termo de responsabilidade é obrigatório para admissão'
        USING HINT = 'Faça upload do termo assinado antes de aprovar';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger antes de UPDATE em profiles (quando status muda para aprovado)
DROP TRIGGER IF EXISTS trg_validar_termo_responsabilidade ON profiles;
CREATE TRIGGER trg_validar_termo_responsabilidade
BEFORE UPDATE OF status ON profiles
FOR EACH ROW
WHEN (NEW.status = 'aprovado' AND OLD.status != 'aprovado')
EXECUTE FUNCTION fn_validar_termo_responsabilidade();

COMMENT ON FUNCTION fn_validar_termo_responsabilidade IS 'Valida que termo de responsabilidade foi anexado antes de aprovar colaborador';

-- 5. FINANCEIRO: Validação de aprovador obrigatório em despesas
-- ========================================
CREATE OR REPLACE FUNCTION fn_validar_aprovador_despesa()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verificar se despesas acima de R$ 500 tem aprovador
  IF NEW.tipo = 'despesa' AND NEW.valor > 500 AND NEW.aprovador_id IS NULL THEN
    RAISE EXCEPTION 'APROVADOR_OBRIGATORIO: Despesas acima de R$ 500 precisam de aprovador'
      USING HINT = 'Atribua um gestor ou admin como aprovador';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger antes de INSERT/UPDATE em transações financeiras
DROP TRIGGER IF EXISTS trg_validar_aprovador_despesa ON transacoes_financeiras;
CREATE TRIGGER trg_validar_aprovador_despesa
BEFORE INSERT OR UPDATE ON transacoes_financeiras
FOR EACH ROW
EXECUTE FUNCTION fn_validar_aprovador_despesa();

COMMENT ON FUNCTION fn_validar_aprovador_despesa IS 'Valida que despesas acima de R$ 500 tem aprovador designado';

-- ========================================
-- LOGS E AUDITORIA
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ DIA 3 CONCLUÍDO: Triggers de homologação criados';
  RAISE NOTICE '   - fn_descontar_adiantamento_folha: Integra adiantamentos na folha';
  RAISE NOTICE '   - fn_validar_criacao_tarefa: Apenas GRS cria tarefas';
  RAISE NOTICE '   - fn_validar_disponibilidade_item: Bloqueio de item em uso';
  RAISE NOTICE '   - fn_validar_termo_responsabilidade: Termo obrigatório';
  RAISE NOTICE '   - fn_validar_aprovador_despesa: Aprovador em despesas > R$ 500';
END $$;
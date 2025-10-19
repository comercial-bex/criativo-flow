-- Sprint 6: Conectar Títulos → Lançamentos + Orçamentos → Projetos → Títulos + Caixa & Bancos

-- ============================================
-- 1. TRIGGER: Títulos → Lançamentos Contábeis
-- ============================================
CREATE OR REPLACE FUNCTION fn_registrar_lancamento_titulo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_conta_receita UUID;
  v_conta_despesa UUID;
  v_conta_caixa UUID;
BEGIN
  -- Apenas registrar quando título for marcado como pago
  IF NEW.status = 'pago' AND (OLD.status IS NULL OR OLD.status != 'pago') THEN
    
    -- Buscar contas contábeis
    SELECT id INTO v_conta_receita FROM financeiro_plano_contas WHERE codigo = '3.1.01.001' LIMIT 1;
    SELECT id INTO v_conta_despesa FROM financeiro_plano_contas WHERE codigo = '4.1.02.001' LIMIT 1;
    SELECT id INTO v_conta_caixa FROM financeiro_plano_contas WHERE codigo = '1.1.01.001' LIMIT 1;

    IF NEW.tipo = 'receber' THEN
      -- Débito: Caixa | Crédito: Receita
      INSERT INTO financeiro_lancamentos (
        data_lancamento,
        descricao,
        tipo_origem,
        origem_id,
        conta_debito_id,
        conta_credito_id,
        valor,
        created_by
      ) VALUES (
        COALESCE(NEW.data_pagamento, CURRENT_DATE),
        'Recebimento - ' || NEW.descricao,
        'titulo',
        NEW.id,
        v_conta_caixa,
        v_conta_receita,
        NEW.valor_pago,
        auth.uid()
      );
    ELSIF NEW.tipo = 'pagar' THEN
      -- Débito: Despesa | Crédito: Caixa
      INSERT INTO financeiro_lancamentos (
        data_lancamento,
        descricao,
        tipo_origem,
        origem_id,
        conta_debito_id,
        conta_credito_id,
        valor,
        created_by
      ) VALUES (
        COALESCE(NEW.data_pagamento, CURRENT_DATE),
        'Pagamento - ' || NEW.descricao,
        'titulo',
        NEW.id,
        v_conta_despesa,
        v_conta_caixa,
        NEW.valor_pago,
        auth.uid()
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_registrar_lancamento_titulo ON titulos_financeiros;
CREATE TRIGGER trg_registrar_lancamento_titulo
AFTER INSERT OR UPDATE ON titulos_financeiros
FOR EACH ROW
EXECUTE FUNCTION fn_registrar_lancamento_titulo();

-- ============================================
-- 2. TRIGGER: Orçamento Aprovado → Título a Receber
-- ============================================
CREATE OR REPLACE FUNCTION fn_gerar_titulo_orcamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_categoria_id UUID;
BEGIN
  -- Apenas quando orçamento for aprovado pela primeira vez
  IF NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status != 'aprovado') THEN
    
    -- Buscar categoria de receita de serviços
    SELECT id INTO v_categoria_id 
    FROM categorias_financeiras 
    WHERE tipo = 'receita' AND nome ILIKE '%serviço%'
    LIMIT 1;

    -- Criar título a receber
    INSERT INTO titulos_financeiros (
      tipo,
      descricao,
      valor_bruto,
      valor_liquido,
      data_emissao,
      data_vencimento,
      status,
      cliente_id,
      categoria_id,
      origem_tipo,
      origem_id
    ) VALUES (
      'receber',
      'Orçamento #' || NEW.numero_orcamento || ' - ' || NEW.titulo,
      NEW.valor_total,
      NEW.valor_total,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '30 days',
      'pendente',
      NEW.cliente_id,
      v_categoria_id,
      'orcamento',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_gerar_titulo_orcamento ON orcamentos;
CREATE TRIGGER trg_gerar_titulo_orcamento
AFTER INSERT OR UPDATE ON orcamentos
FOR EACH ROW
EXECUTE FUNCTION fn_gerar_titulo_orcamento();

-- ============================================
-- 3. TRIGGER: Orçamento Aprovado → Criar Projeto
-- ============================================
CREATE OR REPLACE FUNCTION fn_criar_projeto_orcamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_projeto_id UUID;
BEGIN
  -- Apenas quando orçamento for aprovado e ainda não tiver projeto
  IF NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status != 'aprovado') THEN
    
    -- Verificar se já existe projeto vinculado
    IF NOT EXISTS (
      SELECT 1 FROM projetos WHERE orcamento_id = NEW.id
    ) THEN
      -- Criar projeto automaticamente
      INSERT INTO projetos (
        cliente_id,
        titulo,
        descricao,
        status,
        data_inicio,
        orcamento,
        orcamento_id,
        responsavel_id
      ) VALUES (
        NEW.cliente_id,
        'Projeto - ' || NEW.titulo,
        NEW.descricao,
        'planejamento',
        CURRENT_DATE,
        NEW.valor_total,
        NEW.id,
        NEW.responsavel_id
      )
      RETURNING id INTO v_projeto_id;

      -- Log de auditoria
      INSERT INTO audit_trail (
        entidade_tipo,
        entidade_id,
        acao,
        acao_detalhe,
        user_id
      ) VALUES (
        'projeto',
        v_projeto_id,
        'create',
        'Projeto criado automaticamente a partir do orçamento #' || NEW.numero_orcamento,
        auth.uid()
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_criar_projeto_orcamento ON orcamentos;
CREATE TRIGGER trg_criar_projeto_orcamento
AFTER INSERT OR UPDATE ON orcamentos
FOR EACH ROW
EXECUTE FUNCTION fn_criar_projeto_orcamento();

-- ============================================
-- 4. TABELA: Contas Bancárias (Caixa & Bancos)
-- ============================================
CREATE TABLE IF NOT EXISTS contas_bancarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('caixa', 'conta_corrente', 'poupanca', 'investimento')),
  banco TEXT,
  agencia TEXT,
  conta TEXT,
  saldo_inicial NUMERIC(15,2) NOT NULL DEFAULT 0,
  saldo_atual NUMERIC(15,2) NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- RLS para contas bancárias
ALTER TABLE contas_bancarias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Financeiro e Admin podem gerenciar contas bancárias" ON contas_bancarias;
CREATE POLICY "Financeiro e Admin podem gerenciar contas bancárias"
ON contas_bancarias
FOR ALL
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) = 'financeiro' OR 
  get_user_role(auth.uid()) = 'gestor'
);

DROP POLICY IF EXISTS "Equipe pode visualizar contas bancárias" ON contas_bancarias;
CREATE POLICY "Equipe pode visualizar contas bancárias"
ON contas_bancarias
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Índices
CREATE INDEX IF NOT EXISTS idx_contas_bancarias_tipo ON contas_bancarias(tipo);
CREATE INDEX IF NOT EXISTS idx_contas_bancarias_ativo ON contas_bancarias(ativo);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_contas_bancarias_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_contas_bancarias_updated_at ON contas_bancarias;
CREATE TRIGGER trg_update_contas_bancarias_updated_at
BEFORE UPDATE ON contas_bancarias
FOR EACH ROW
EXECUTE FUNCTION update_contas_bancarias_updated_at();

-- ============================================
-- 5. MELHORAR TABELA: Fornecedores
-- ============================================
ALTER TABLE fornecedores
ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT,
ADD COLUMN IF NOT EXISTS razao_social TEXT,
ADD COLUMN IF NOT EXISTS nome_fantasia TEXT,
ADD COLUMN IF NOT EXISTS endereco TEXT,
ADD COLUMN IF NOT EXISTS cidade TEXT,
ADD COLUMN IF NOT EXISTS estado TEXT,
ADD COLUMN IF NOT EXISTS cep TEXT,
ADD COLUMN IF NOT EXISTS site TEXT,
ADD COLUMN IF NOT EXISTS observacoes TEXT,
ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS categoria TEXT,
ADD COLUMN IF NOT EXISTS condicao_pagamento TEXT;

-- Índices para fornecedores
CREATE INDEX IF NOT EXISTS idx_fornecedores_ativo ON fornecedores(ativo);
CREATE INDEX IF NOT EXISTS idx_fornecedores_cpf_cnpj ON fornecedores(cpf_cnpj);

COMMENT ON TABLE contas_bancarias IS 'Cadastro de contas bancárias e caixas da empresa';
COMMENT ON TABLE fornecedores IS 'Cadastro de fornecedores para gestão de despesas';
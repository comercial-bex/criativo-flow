-- ============================================
-- SPRINT 4: FORNECEDORES + CONTAS A PAGAR (CORRIGIDO)
-- ============================================

-- 1. CRIAR TABELA FORNECEDORES
-- ============================================
CREATE TABLE public.fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados básicos
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  cnpj TEXT UNIQUE NOT NULL,
  inscricao_estadual TEXT,
  inscricao_municipal TEXT,
  
  -- Contatos
  email TEXT,
  telefone TEXT,
  celular TEXT,
  site TEXT,
  
  -- Endereço
  cep TEXT,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  pais TEXT DEFAULT 'Brasil',
  
  -- Dados bancários
  banco_codigo TEXT,
  banco_nome TEXT,
  agencia TEXT,
  conta TEXT,
  tipo_conta TEXT CHECK (tipo_conta IN ('corrente', 'poupanca')),
  pix_tipo TEXT CHECK (pix_tipo IN ('cpf', 'cnpj', 'email', 'telefone', 'chave_aleatoria')),
  pix_chave TEXT,
  
  -- Categorias e classificação
  categoria_fornecedor TEXT[],
  tipo_fornecimento TEXT CHECK (tipo_fornecimento IN ('produto', 'servico', 'misto')) DEFAULT 'misto',
  
  -- Controle comercial
  prazo_pagamento_padrao INTEGER DEFAULT 30,
  forma_pagamento_preferencial TEXT,
  limite_credito NUMERIC(15,2),
  desconto_padrao NUMERIC(5,2),
  
  -- Status e rastreamento
  status TEXT CHECK (status IN ('ativo', 'inativo', 'bloqueado')) DEFAULT 'ativo',
  motivo_bloqueio TEXT,
  bloqueado_em TIMESTAMPTZ,
  bloqueado_por UUID REFERENCES auth.users(id),
  
  -- Compliance e documentação
  termo_fornecedor_url TEXT,
  certificados_url TEXT[],
  documentos_anexos JSONB DEFAULT '[]'::jsonb,
  
  -- Avaliação e performance
  avaliacao_qualidade NUMERIC(3,2) CHECK (avaliacao_qualidade BETWEEN 0 AND 5),
  total_compras NUMERIC(15,2) DEFAULT 0,
  ultima_compra_em TIMESTAMPTZ,
  
  -- Observações
  observacoes TEXT,
  
  -- Auditoria
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT cnpj_valido CHECK (length(cnpj) >= 14)
);

CREATE INDEX idx_fornecedores_cnpj ON public.fornecedores(cnpj);
CREATE INDEX idx_fornecedores_status ON public.fornecedores(status);
CREATE INDEX idx_fornecedores_categoria ON public.fornecedores USING GIN(categoria_fornecedor);
CREATE INDEX idx_fornecedores_razao_social ON public.fornecedores USING gin(to_tsvector('portuguese', razao_social));

ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Financeiro e Admin podem gerenciar fornecedores"
ON public.fornecedores
FOR ALL
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) IN ('financeiro', 'gestor', 'rh')
);

CREATE POLICY "Equipe pode visualizar fornecedores ativos"
ON public.fornecedores
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  (status = 'ativo' OR is_admin(auth.uid()))
);

-- 2. CRIAR TIPOS E TABELA TÍTULOS FINANCEIROS
-- ============================================
CREATE TYPE tipo_titulo AS ENUM ('pagar', 'receber');
CREATE TYPE status_titulo AS ENUM ('pendente', 'vencido', 'pago', 'cancelado', 'renegociado');
CREATE TYPE tipo_documento AS ENUM ('boleto', 'nf', 'recibo', 'fatura', 'duplicata', 'outros');

CREATE TABLE public.titulos_financeiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  tipo tipo_titulo NOT NULL,
  tipo_documento tipo_documento DEFAULT 'outros',
  numero_documento TEXT,
  
  cliente_id UUID REFERENCES public.clientes(id),
  fornecedor_id UUID REFERENCES public.fornecedores(id),
  projeto_id UUID REFERENCES public.projetos(id),
  contrato_id UUID REFERENCES public.contratos(id),
  categoria_id UUID REFERENCES public.categorias_financeiras(id),
  conta_bancaria_id UUID,
  
  valor_original NUMERIC(15,2) NOT NULL CHECK (valor_original > 0),
  valor_pago NUMERIC(15,2) DEFAULT 0,
  valor_desconto NUMERIC(15,2) DEFAULT 0,
  valor_juros NUMERIC(15,2) DEFAULT 0,
  valor_multa NUMERIC(15,2) DEFAULT 0,
  valor_liquido NUMERIC(15,2) GENERATED ALWAYS AS (
    valor_original - valor_desconto + valor_juros + valor_multa
  ) STORED,
  
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  data_competencia DATE NOT NULL DEFAULT CURRENT_DATE,
  
  status status_titulo NOT NULL DEFAULT 'pendente',
  
  forma_pagamento TEXT,
  comprovante_url TEXT,
  
  is_recorrente BOOLEAN DEFAULT false,
  recorrencia_tipo TEXT CHECK (recorrencia_tipo IN ('mensal', 'trimestral', 'semestral', 'anual')),
  proximo_vencimento DATE,
  
  descricao TEXT NOT NULL,
  observacoes TEXT,
  anexos_url TEXT[],
  
  centro_custo_id UUID,
  
  requer_aprovacao BOOLEAN DEFAULT false,
  aprovado_por UUID REFERENCES auth.users(id),
  aprovado_em TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT titulo_tem_parte CHECK (
    (tipo = 'pagar' AND fornecedor_id IS NOT NULL) OR
    (tipo = 'receber' AND cliente_id IS NOT NULL)
  ),
  CONSTRAINT valor_pago_valido CHECK (valor_pago <= (valor_original + valor_juros + valor_multa)),
  CONSTRAINT datas_validas CHECK (data_emissao <= data_vencimento)
);

-- Adicionar coluna dias_atraso separadamente (não pode ser GENERATED em algumas versões)
ALTER TABLE public.titulos_financeiros ADD COLUMN dias_atraso INTEGER DEFAULT 0;

CREATE INDEX idx_titulos_tipo ON public.titulos_financeiros(tipo);
CREATE INDEX idx_titulos_status ON public.titulos_financeiros(status);
CREATE INDEX idx_titulos_vencimento ON public.titulos_financeiros(data_vencimento);
CREATE INDEX idx_titulos_fornecedor ON public.titulos_financeiros(fornecedor_id) WHERE tipo = 'pagar';
CREATE INDEX idx_titulos_cliente ON public.titulos_financeiros(cliente_id) WHERE tipo = 'receber';
CREATE INDEX idx_titulos_projeto ON public.titulos_financeiros(projeto_id);
CREATE INDEX idx_titulos_competencia ON public.titulos_financeiros(data_competencia);
CREATE INDEX idx_titulos_pendentes ON public.titulos_financeiros(status, data_vencimento) 
  WHERE status IN ('pendente', 'vencido');

ALTER TABLE public.titulos_financeiros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Financeiro e Admin podem gerenciar títulos"
ON public.titulos_financeiros
FOR ALL
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) IN ('financeiro', 'gestor')
);

CREATE POLICY "GRS pode ver títulos de seus projetos"
ON public.titulos_financeiros
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    projeto_id IN (
      SELECT id FROM projetos WHERE responsavel_id = auth.uid()
    )
  )
);

CREATE POLICY "Clientes podem ver seus próprios títulos"
ON public.titulos_financeiros
FOR SELECT
USING (
  tipo = 'receber' AND
  cliente_id IN (
    SELECT cliente_id FROM pessoas WHERE id = auth.uid()
  )
);

-- 3. INTEGRAÇÃO COM LANÇAMENTOS
-- ============================================
ALTER TABLE public.financeiro_lancamentos
ADD COLUMN IF NOT EXISTS fornecedor_id UUID REFERENCES public.fornecedores(id),
ADD COLUMN IF NOT EXISTS titulo_id UUID REFERENCES public.titulos_financeiros(id);

CREATE INDEX IF NOT EXISTS idx_lancamentos_fornecedor ON public.financeiro_lancamentos(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_titulo ON public.financeiro_lancamentos(titulo_id);

-- 4. TRIGGERS E FUNÇÕES
-- ============================================
CREATE OR REPLACE FUNCTION fn_atualizar_status_titulo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualizar status baseado em pagamento
  IF NEW.valor_pago >= NEW.valor_liquido AND NEW.status != 'pago' THEN
    NEW.status := 'pago';
    NEW.data_pagamento := COALESCE(NEW.data_pagamento, CURRENT_DATE);
    NEW.dias_atraso := 0;
  ELSIF NEW.data_vencimento < CURRENT_DATE AND NEW.status = 'pendente' THEN
    NEW.status := 'vencido';
    NEW.dias_atraso := (CURRENT_DATE - NEW.data_vencimento);
  ELSE
    NEW.dias_atraso := 0;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_atualizar_status_titulo
BEFORE INSERT OR UPDATE ON public.titulos_financeiros
FOR EACH ROW
EXECUTE FUNCTION fn_atualizar_status_titulo();

CREATE OR REPLACE FUNCTION fn_registrar_lancamento_titulo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conta_debito UUID;
  v_conta_credito UUID;
BEGIN
  IF NEW.status = 'pago' AND (OLD.status IS NULL OR OLD.status != 'pago') THEN
    
    IF NEW.tipo = 'pagar' THEN
      SELECT id INTO v_conta_debito 
      FROM financeiro_plano_contas 
      WHERE codigo LIKE '4.%' AND aceita_lancamento = true LIMIT 1;
      
      SELECT id INTO v_conta_credito 
      FROM financeiro_plano_contas 
      WHERE codigo = '1.1.01.001' LIMIT 1;
    ELSE
      SELECT id INTO v_conta_debito 
      FROM financeiro_plano_contas 
      WHERE codigo = '1.1.01.001' LIMIT 1;
      
      SELECT id INTO v_conta_credito 
      FROM financeiro_plano_contas 
      WHERE codigo LIKE '3.%' AND aceita_lancamento = true LIMIT 1;
    END IF;
    
    IF v_conta_debito IS NOT NULL AND v_conta_credito IS NOT NULL THEN
      INSERT INTO financeiro_lancamentos (
        data_lancamento,
        descricao,
        tipo_origem,
        origem_id,
        titulo_id,
        fornecedor_id,
        conta_debito_id,
        conta_credito_id,
        valor,
        created_by
      ) VALUES (
        COALESCE(NEW.data_pagamento, CURRENT_DATE),
        'Pagamento: ' || NEW.descricao,
        CASE WHEN NEW.tipo = 'pagar' THEN 'titulo_pagar' ELSE 'titulo_receber' END,
        NEW.id,
        NEW.id,
        NEW.fornecedor_id,
        v_conta_debito,
        v_conta_credito,
        NEW.valor_liquido,
        NEW.updated_by
      );
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_registrar_lancamento_titulo
AFTER UPDATE ON public.titulos_financeiros
FOR EACH ROW
EXECUTE FUNCTION fn_registrar_lancamento_titulo();

CREATE OR REPLACE FUNCTION fn_notificar_vencimentos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_titulo RECORD;
BEGIN
  FOR v_titulo IN 
    SELECT 
      t.*,
      CASE 
        WHEN t.tipo = 'pagar' THEN f.razao_social
        ELSE c.nome
      END as parte_nome
    FROM titulos_financeiros t
    LEFT JOIN fornecedores f ON t.fornecedor_id = f.id
    LEFT JOIN clientes c ON t.cliente_id = c.id
    WHERE t.status IN ('pendente', 'vencido')
      AND t.data_vencimento BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '3 days')
  LOOP
    INSERT INTO notificacoes (
      user_id,
      titulo,
      mensagem,
      tipo,
      data_evento
    )
    SELECT 
      ur.user_id,
      'Título próximo ao vencimento',
      'Título ' || v_titulo.tipo || ' de ' || COALESCE(v_titulo.parte_nome, 'N/A') || 
      ' vence em ' || to_char(v_titulo.data_vencimento, 'DD/MM/YYYY') || 
      ' (R$ ' || to_char(v_titulo.valor_liquido, 'FM999,999,990.00') || ')',
      'warning',
      NOW()
    FROM user_roles ur
    WHERE ur.role IN ('financeiro', 'admin', 'gestor');
    
  END LOOP;
END;
$$;
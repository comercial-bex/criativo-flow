-- =============================================
-- FASE 1: FUNDAÇÃO - RH e FOLHA DE PAGAMENTO
-- =============================================

-- Enum para Regime de Trabalho
CREATE TYPE regime_trabalho AS ENUM ('clt', 'estagio', 'pj');

-- Enum para Tipo de Conta Bancária
CREATE TYPE tipo_conta_bancaria AS ENUM ('corrente', 'poupanca', 'pme', 'salario');

-- Enum para Tipo de Chave PIX
CREATE TYPE tipo_chave_pix AS ENUM ('cpf', 'cnpj', 'email', 'telefone', 'aleatoria');

-- Enum para Status de Colaborador
CREATE TYPE status_colaborador AS ENUM ('ativo', 'inativo', 'ferias', 'afastado', 'desligado');

-- Enum para Tipo de Rubrica
CREATE TYPE tipo_rubrica AS ENUM ('provento', 'desconto', 'encargo', 'beneficio');

-- Enum para Status da Folha
CREATE TYPE status_folha AS ENUM ('aberta', 'processada', 'fechada');

-- Enum para Status de Item da Folha
CREATE TYPE status_item_folha AS ENUM ('pendente', 'pago', 'cancelado');

-- =============================================
-- TABELA: rh_cargos
-- =============================================
CREATE TABLE public.rh_cargos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  senioridade TEXT, -- Junior, Pleno, Senior, Gestor, Diretor
  faixa_salarial_min NUMERIC(10, 2),
  faixa_salarial_max NUMERIC(10, 2),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: rh_colaboradores
-- =============================================
CREATE TABLE public.rh_colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados Pessoais
  nome_completo TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL UNIQUE,
  rg TEXT,
  data_nascimento DATE,
  email TEXT,
  telefone TEXT,
  celular TEXT,
  
  -- Endereço
  cep TEXT,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  estado TEXT,
  
  -- Vínculo Profissional
  cargo_id UUID REFERENCES public.rh_cargos(id),
  cargo_atual TEXT, -- Nome do cargo (desnormalizado para histórico)
  regime regime_trabalho NOT NULL,
  data_admissao DATE NOT NULL,
  data_desligamento DATE,
  status status_colaborador DEFAULT 'ativo',
  
  -- Remuneração
  salario_base NUMERIC(10, 2), -- Para CLT/Estágio
  fee_mensal NUMERIC(10, 2), -- Para PJ
  
  -- Centro de Custo / Organização
  centro_custo TEXT,
  unidade_filial TEXT,
  gestor_imediato_id UUID REFERENCES public.rh_colaboradores(id),
  
  -- Dados Bancários
  banco_codigo TEXT,
  banco_nome TEXT,
  agencia TEXT,
  conta TEXT,
  tipo_conta tipo_conta_bancaria,
  titular_conta TEXT,
  cpf_cnpj_titular TEXT,
  
  -- PIX
  tipo_chave_pix tipo_chave_pix,
  chave_pix TEXT,
  
  -- Metadados
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- =============================================
-- TABELA: financeiro_rubricas
-- =============================================
CREATE TABLE public.financeiro_rubricas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  tipo tipo_rubrica NOT NULL,
  base_calculo TEXT, -- 'fixo', 'percentual', 'formula'
  valor_padrao NUMERIC(10, 2),
  percentual_padrao NUMERIC(5, 2),
  incide_inss BOOLEAN DEFAULT false,
  incide_irrf BOOLEAN DEFAULT false,
  incide_fgts BOOLEAN DEFAULT false,
  centro_custo_padrao TEXT,
  conta_contabil TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABELA: financeiro_folha
-- =============================================
CREATE TABLE public.financeiro_folha (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competencia DATE NOT NULL, -- Primeiro dia do mês (ex: 2025-01-01)
  mes INTEGER NOT NULL, -- 1-12
  ano INTEGER NOT NULL,
  centro_custo TEXT,
  unidade_filial TEXT,
  status status_folha DEFAULT 'aberta',
  
  -- Totais Consolidados
  total_proventos NUMERIC(12, 2) DEFAULT 0,
  total_descontos NUMERIC(12, 2) DEFAULT 0,
  total_encargos NUMERIC(12, 2) DEFAULT 0,
  total_liquido NUMERIC(12, 2) DEFAULT 0,
  total_colaboradores INTEGER DEFAULT 0,
  
  -- Auditoria
  processada_em TIMESTAMPTZ,
  processada_por UUID REFERENCES auth.users(id),
  fechada_em TIMESTAMPTZ,
  fechada_por UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(competencia, centro_custo, unidade_filial)
);

-- =============================================
-- TABELA: financeiro_folha_itens
-- =============================================
CREATE TABLE public.financeiro_folha_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folha_id UUID NOT NULL REFERENCES public.financeiro_folha(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES public.rh_colaboradores(id) ON DELETE CASCADE,
  
  -- Valores Base
  base_calculo NUMERIC(10, 2) DEFAULT 0,
  total_proventos NUMERIC(10, 2) DEFAULT 0,
  total_descontos NUMERIC(10, 2) DEFAULT 0,
  total_encargos NUMERIC(10, 2) DEFAULT 0,
  liquido NUMERIC(10, 2) DEFAULT 0,
  
  -- Detalhamento (JSONB para flexibilidade)
  proventos JSONB DEFAULT '[]'::jsonb, -- [{rubrica_id, nome, valor}, ...]
  descontos JSONB DEFAULT '[]'::jsonb,
  encargos JSONB DEFAULT '[]'::jsonb,
  
  -- Pagamento
  status status_item_folha DEFAULT 'pendente',
  forma_pagamento TEXT, -- 'deposito', 'pix', 'dinheiro', 'ted', 'doc'
  data_pagamento TIMESTAMPTZ,
  comprovante_url TEXT,
  
  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  pago_por UUID REFERENCES auth.users(id),
  
  UNIQUE(folha_id, colaborador_id)
);

-- =============================================
-- ÍNDICES
-- =============================================
CREATE INDEX idx_colaboradores_cpf ON public.rh_colaboradores(cpf_cnpj);
CREATE INDEX idx_colaboradores_status ON public.rh_colaboradores(status);
CREATE INDEX idx_colaboradores_regime ON public.rh_colaboradores(regime);
CREATE INDEX idx_folha_competencia ON public.financeiro_folha(competencia);
CREATE INDEX idx_folha_status ON public.financeiro_folha(status);
CREATE INDEX idx_folha_itens_colaborador ON public.financeiro_folha_itens(colaborador_id);
CREATE INDEX idx_folha_itens_status ON public.financeiro_folha_itens(status);

-- =============================================
-- TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rh_cargos_updated_at
  BEFORE UPDATE ON public.rh_cargos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rh_colaboradores_updated_at
  BEFORE UPDATE ON public.rh_colaboradores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financeiro_rubricas_updated_at
  BEFORE UPDATE ON public.financeiro_rubricas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financeiro_folha_updated_at
  BEFORE UPDATE ON public.financeiro_folha
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financeiro_folha_itens_updated_at
  BEFORE UPDATE ON public.financeiro_folha_itens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- RLS POLICIES
-- =============================================

-- rh_cargos
ALTER TABLE public.rh_cargos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver cargos"
  ON public.rh_cargos FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin/Gestor podem gerenciar cargos"
  ON public.rh_cargos FOR ALL
  USING (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) = 'gestor'
  );

-- rh_colaboradores
ALTER TABLE public.rh_colaboradores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver colaboradores"
  ON public.rh_colaboradores FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin/Gestor/RH podem gerenciar colaboradores"
  ON public.rh_colaboradores FOR ALL
  USING (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) IN ('gestor', 'financeiro', 'atendimento')
  );

-- financeiro_rubricas
ALTER TABLE public.financeiro_rubricas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver rubricas"
  ON public.financeiro_rubricas FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin/Gestor/Financeiro podem gerenciar rubricas"
  ON public.financeiro_rubricas FOR ALL
  USING (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) IN ('gestor', 'financeiro')
  );

-- financeiro_folha
ALTER TABLE public.financeiro_folha ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver folha"
  ON public.financeiro_folha FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin/Gestor/Financeiro podem gerenciar folha"
  ON public.financeiro_folha FOR ALL
  USING (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) IN ('gestor', 'financeiro')
  );

-- financeiro_folha_itens
ALTER TABLE public.financeiro_folha_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver itens da folha"
  ON public.financeiro_folha_itens FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin/Gestor/Financeiro podem gerenciar itens da folha"
  ON public.financeiro_folha_itens FOR ALL
  USING (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) IN ('gestor', 'financeiro')
  );

-- =============================================
-- DADOS INICIAIS (RUBRICAS PADRÃO)
-- =============================================
INSERT INTO public.financeiro_rubricas (codigo, nome, tipo, base_calculo, valor_padrao, incide_inss, incide_irrf, incide_fgts) VALUES
  ('001', 'Salário Base', 'provento', 'fixo', 0, true, true, true),
  ('002', 'Hora Extra 50%', 'provento', 'percentual', 50, true, true, true),
  ('003', 'Hora Extra 100%', 'provento', 'percentual', 100, true, true, true),
  ('004', 'Adicional Noturno', 'provento', 'percentual', 20, true, true, true),
  ('005', 'Comissão', 'provento', 'fixo', 0, true, true, true),
  ('101', 'INSS', 'desconto', 'percentual', 0, false, false, false),
  ('102', 'IRRF', 'desconto', 'percentual', 0, false, false, false),
  ('103', 'Vale-Transporte', 'desconto', 'percentual', 6, false, false, false),
  ('104', 'Vale-Refeição', 'desconto', 'percentual', 20, false, false, false),
  ('105', 'Falta', 'desconto', 'fixo', 0, false, false, false),
  ('201', 'FGTS', 'encargo', 'percentual', 8, false, false, false),
  ('202', 'INSS Patronal', 'encargo', 'percentual', 20, false, false, false)
ON CONFLICT (codigo) DO NOTHING;
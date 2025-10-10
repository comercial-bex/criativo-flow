-- Estrutura de Dados para Módulo Financeiro Avançado

-- 1. Adiantamentos
CREATE TABLE IF NOT EXISTS financeiro_adiantamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folha_item_id UUID REFERENCES financeiro_folha_itens(id) ON DELETE CASCADE,
  colaborador_id UUID REFERENCES rh_colaboradores(id) ON DELETE CASCADE NOT NULL,
  competencia DATE NOT NULL,
  valor NUMERIC(10,2) NOT NULL CHECK (valor > 0),
  data_adiantamento DATE NOT NULL,
  forma_pagamento TEXT NOT NULL CHECK (forma_pagamento IN ('pix', 'ted', 'dinheiro', 'deposito')),
  chave_pix TEXT,
  banco_conta TEXT,
  comprovante_url TEXT,
  observacao TEXT,
  status TEXT DEFAULT 'registrado' CHECK (status IN ('registrado', 'abatido', 'cancelado')),
  criado_por UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_adiantamentos_colaborador ON financeiro_adiantamentos(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_adiantamentos_competencia ON financeiro_adiantamentos(competencia);
ALTER TABLE financeiro_adiantamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestor gerencia adiantamentos" ON financeiro_adiantamentos;
CREATE POLICY "Gestor gerencia adiantamentos" ON financeiro_adiantamentos FOR ALL
USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = ANY(ARRAY['gestor'::user_role, 'financeiro'::user_role]));

-- 2. ENUMs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'motivo_ponto_enum') THEN
    CREATE TYPE motivo_ponto_enum AS ENUM ('operacional', 'cliente', 'saude', 'acordo', 'outros');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_ponto_enum') THEN
    CREATE TYPE status_ponto_enum AS ENUM ('pendente', 'aprovado_gestor', 'aprovado_rh', 'rejeitado');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'etapa_carreira_enum') THEN
    CREATE TYPE etapa_carreira_enum AS ENUM ('trainee', 'estagiario', 'especialista', 'gestor');
  END IF;
END $$;

-- 3. Folha de Ponto
CREATE TABLE IF NOT EXISTS rh_folha_ponto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID REFERENCES rh_colaboradores(id) ON DELETE CASCADE NOT NULL,
  competencia DATE NOT NULL,
  horas_he_50 NUMERIC(5,2) DEFAULT 0 CHECK (horas_he_50 >= 0),
  horas_he_100 NUMERIC(5,2) DEFAULT 0 CHECK (horas_he_100 >= 0),
  horas_noturno NUMERIC(5,2) DEFAULT 0 CHECK (horas_noturno >= 0),
  dias_falta INTEGER DEFAULT 0 CHECK (dias_falta >= 0),
  horas_falta NUMERIC(5,2) DEFAULT 0 CHECK (horas_falta >= 0),
  minutos_atraso INTEGER DEFAULT 0 CHECK (minutos_atraso >= 0),
  horas_compensacao NUMERIC(5,2) DEFAULT 0,
  motivo motivo_ponto_enum DEFAULT 'operacional',
  observacao TEXT,
  arquivo_ponto_url TEXT,
  comprovantes_anexos JSONB DEFAULT '[]',
  status status_ponto_enum DEFAULT 'pendente',
  aprovado_gestor_por UUID,
  aprovado_gestor_em TIMESTAMPTZ,
  aprovado_rh_por UUID,
  aprovado_rh_em TIMESTAMPTZ,
  rejeitado_motivo TEXT,
  hora_base NUMERIC(10,2),
  valor_he_50 NUMERIC(10,2) DEFAULT 0,
  valor_he_100 NUMERIC(10,2) DEFAULT 0,
  valor_adicional_noturno NUMERIC(10,2) DEFAULT 0,
  valor_desconto_falta NUMERIC(10,2) DEFAULT 0,
  valor_desconto_atraso NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(colaborador_id, competencia)
);

CREATE INDEX IF NOT EXISTS idx_ponto_colaborador ON rh_folha_ponto(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_ponto_competencia ON rh_folha_ponto(competencia);
ALTER TABLE rh_folha_ponto ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestor gerencia ponto" ON rh_folha_ponto;
CREATE POLICY "Gestor gerencia ponto" ON rh_folha_ponto FOR ALL
USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor'::user_role);

-- 4. Timeline Carreira
CREATE TABLE IF NOT EXISTS rh_timeline_carreira (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID REFERENCES rh_colaboradores(id) ON DELETE CASCADE NOT NULL,
  etapa_anterior etapa_carreira_enum,
  etapa_nova etapa_carreira_enum NOT NULL,
  cargo_anterior TEXT,
  cargo_novo TEXT,
  salario_anterior NUMERIC(10,2),
  salario_novo NUMERIC(10,2) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  motivo TEXT NOT NULL CHECK (motivo IN ('promocao', 'merito', 'reestruturacao', 'admissao', 'outro')),
  observacao TEXT,
  anexos_urls JSONB DEFAULT '[]',
  criado_por UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeline_colaborador ON rh_timeline_carreira(colaborador_id);
ALTER TABLE rh_timeline_carreira ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestor gerencia timeline" ON rh_timeline_carreira;
CREATE POLICY "Gestor gerencia timeline" ON rh_timeline_carreira FOR ALL
USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor'::user_role);

-- 5. Plano de Contas
CREATE TABLE IF NOT EXISTS financeiro_plano_contas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('ativo', 'passivo', 'receita', 'despesa')),
  natureza TEXT NOT NULL CHECK (natureza IN ('debito', 'credito')),
  nivel INTEGER NOT NULL CHECK (nivel BETWEEN 1 AND 5),
  conta_pai_id UUID REFERENCES financeiro_plano_contas(id),
  aceita_lancamento BOOLEAN DEFAULT true,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE financeiro_plano_contas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Financeiro gerencia plano contas" ON financeiro_plano_contas;
CREATE POLICY "Financeiro gerencia plano contas" ON financeiro_plano_contas FOR ALL
USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = ANY(ARRAY['gestor'::user_role, 'financeiro'::user_role]));

-- Dados iniciais
INSERT INTO financeiro_plano_contas (codigo, nome, tipo, natureza, nivel, aceita_lancamento) VALUES
('1', 'ATIVO', 'ativo', 'debito', 1, false),
('1.1', 'Ativo Circulante', 'ativo', 'debito', 2, false),
('1.1.01', 'Caixa e Bancos', 'ativo', 'debito', 3, false),
('1.1.01.001', 'Caixa Geral', 'ativo', 'debito', 4, true),
('1.1.01.002', 'Banco Corrente', 'ativo', 'debito', 4, true),
('1.1.02', 'Adiantamentos', 'ativo', 'debito', 3, false),
('1.1.02.001', 'Adiantamentos a Empregados', 'ativo', 'debito', 4, true),
('2', 'PASSIVO', 'passivo', 'credito', 1, false),
('2.1', 'Passivo Circulante', 'passivo', 'credito', 2, false),
('2.1.01', 'Obrigações Trabalhistas', 'passivo', 'credito', 3, false),
('2.1.01.001', 'Salários a Pagar', 'passivo', 'credito', 4, true),
('2.1.01.002', 'INSS a Recolher', 'passivo', 'credito', 4, true),
('2.1.01.003', 'FGTS a Recolher', 'passivo', 'credito', 4, true),
('2.1.01.004', 'IRRF a Recolher', 'passivo', 'credito', 4, true),
('3', 'DESPESAS', 'despesa', 'debito', 1, false),
('3.1', 'Operacionais', 'despesa', 'debito', 2, false),
('3.1.01', 'Pessoal', 'despesa', 'debito', 3, false),
('3.1.01.001', 'Salários', 'despesa', 'debito', 4, true),
('3.1.01.002', 'Encargos', 'despesa', 'debito', 4, true),
('3.1.01.003', 'Horas Extras', 'despesa', 'debito', 4, true),
('3.1.01.004', 'Adicional Noturno', 'despesa', 'debito', 4, true)
ON CONFLICT (codigo) DO NOTHING;

-- 6. Lançamentos
CREATE TABLE IF NOT EXISTS financeiro_lancamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_lancamento SERIAL,
  data_lancamento DATE NOT NULL,
  descricao TEXT NOT NULL,
  tipo_origem TEXT NOT NULL CHECK (tipo_origem IN ('folha', 'adiantamento', 'manual', 'ponto', 'outros')),
  origem_id UUID,
  conta_debito_id UUID REFERENCES financeiro_plano_contas(id) NOT NULL,
  conta_credito_id UUID REFERENCES financeiro_plano_contas(id) NOT NULL,
  valor NUMERIC(10,2) NOT NULL CHECK (valor > 0),
  centro_custo TEXT,
  unidade TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON financeiro_lancamentos(data_lancamento);
ALTER TABLE financeiro_lancamentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Financeiro vê lançamentos" ON financeiro_lancamentos;
CREATE POLICY "Financeiro vê lançamentos" ON financeiro_lancamentos FOR SELECT
USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = ANY(ARRAY['gestor'::user_role, 'financeiro'::user_role]));

DROP POLICY IF EXISTS "Sistema cria lançamentos" ON financeiro_lancamentos;
CREATE POLICY "Sistema cria lançamentos" ON financeiro_lancamentos FOR INSERT WITH CHECK (true);

-- FUNÇÕES DE NEGÓCIO

CREATE OR REPLACE FUNCTION fn_validar_limite_adiantamento(
  p_colaborador_id UUID, p_competencia DATE, p_novo_valor NUMERIC
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_salario NUMERIC; v_total NUMERIC;
BEGIN
  SELECT COALESCE(salario_base, fee_mensal, 0) INTO v_salario FROM rh_colaboradores WHERE id = p_colaborador_id;
  SELECT COALESCE(SUM(valor), 0) INTO v_total FROM financeiro_adiantamentos
  WHERE colaborador_id = p_colaborador_id AND DATE_TRUNC('month', competencia) = DATE_TRUNC('month', p_competencia) AND status != 'cancelado';
  RETURN (v_total + p_novo_valor) <= v_salario;
END; $$;

CREATE OR REPLACE FUNCTION fn_calcular_ponto(p_ponto_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_ponto RECORD; v_salario NUMERIC; v_hora NUMERIC;
BEGIN
  SELECT * INTO v_ponto FROM rh_folha_ponto WHERE id = p_ponto_id;
  SELECT COALESCE(salario_base, fee_mensal, 0) INTO v_salario FROM rh_colaboradores WHERE id = v_ponto.colaborador_id;
  v_hora := v_salario / 220;
  UPDATE rh_folha_ponto SET hora_base = v_hora,
    valor_he_50 = v_hora * 1.5 * COALESCE(horas_he_50, 0),
    valor_he_100 = v_hora * 2 * COALESCE(horas_he_100, 0),
    valor_adicional_noturno = v_hora * 1.2 * COALESCE(horas_noturno, 0),
    valor_desconto_falta = v_hora * COALESCE(horas_falta, 0),
    valor_desconto_atraso = v_hora * (COALESCE(minutos_atraso, 0) / 60.0),
    updated_at = NOW() WHERE id = p_ponto_id;
END; $$;

CREATE OR REPLACE FUNCTION trg_calcular_ponto_auto()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN PERFORM fn_calcular_ponto(NEW.id); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trigger_calcular_ponto ON rh_folha_ponto;
CREATE TRIGGER trigger_calcular_ponto AFTER INSERT OR UPDATE ON rh_folha_ponto
FOR EACH ROW EXECUTE FUNCTION trg_calcular_ponto_auto();

CREATE OR REPLACE FUNCTION fn_registrar_lancamento_adiantamento()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_conta_adiant UUID; v_conta_caixa UUID; v_nome TEXT;
BEGIN
  SELECT id INTO v_conta_adiant FROM financeiro_plano_contas WHERE codigo = '1.1.02.001';
  SELECT id INTO v_conta_caixa FROM financeiro_plano_contas WHERE codigo = '1.1.01.001';
  SELECT nome_completo INTO v_nome FROM rh_colaboradores WHERE id = NEW.colaborador_id;
  INSERT INTO financeiro_lancamentos (data_lancamento, descricao, tipo_origem, origem_id, conta_debito_id, conta_credito_id, valor, created_by) 
  VALUES (NEW.data_adiantamento, 'Adiantamento - ' || COALESCE(v_nome, 'Colaborador'), 'adiantamento', NEW.id, v_conta_adiant, v_conta_caixa, NEW.valor, NEW.criado_por);
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_lanc_adiantamento ON financeiro_adiantamentos;
CREATE TRIGGER trg_lanc_adiantamento AFTER INSERT ON financeiro_adiantamentos
FOR EACH ROW EXECUTE FUNCTION fn_registrar_lancamento_adiantamento();
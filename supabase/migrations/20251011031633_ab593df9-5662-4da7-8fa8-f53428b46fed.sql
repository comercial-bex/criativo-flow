-- Unificacao Fase 1: Tabelas Basicas
DO $$ BEGIN CREATE TYPE public.pessoa_papel AS ENUM ('colaborador', 'especialista', 'cliente');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.pessoa_regime AS ENUM ('clt', 'pj', 'estagio', 'freelancer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.pessoa_status AS ENUM ('ativo', 'afastado', 'desligado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.pessoas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), nome TEXT NOT NULL, email TEXT UNIQUE, cpf TEXT UNIQUE,
  telefones JSONB DEFAULT '[]'::JSONB, papeis pessoa_papel[] NOT NULL DEFAULT '{}', dados_bancarios JSONB DEFAULT NULL,
  cargo_id UUID, regime pessoa_regime, data_admissao DATE, data_desligamento DATE, status pessoa_status DEFAULT 'ativo',
  salario_base NUMERIC(12,2), fee_mensal NUMERIC(12,2), observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(), created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_pessoas_papeis ON pessoas USING GIN(papeis);
CREATE INDEX IF NOT EXISTS idx_pessoas_email ON pessoas(email);
CREATE INDEX IF NOT EXISTS idx_pessoas_cpf ON pessoas(cpf);
CREATE INDEX IF NOT EXISTS idx_pessoas_status ON pessoas(status);

ALTER TABLE public.pessoas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access on pessoas" ON pessoas;
CREATE POLICY "Admin full access on pessoas" ON pessoas FOR ALL USING (is_admin(auth.uid()));
DROP POLICY IF EXISTS "Staff can view pessoas" ON pessoas;
CREATE POLICY "Staff can view pessoas" ON pessoas FOR SELECT USING (
  get_user_role(auth.uid()) = ANY(ARRAY['gestor'::user_role, 'financeiro'::user_role, 'grs'::user_role])
);

CREATE TABLE IF NOT EXISTS public.ocorrencias_ponto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), pessoa_id UUID REFERENCES pessoas(id) ON DELETE CASCADE,
  data DATE NOT NULL, tipo TEXT NOT NULL CHECK (tipo IN ('extra', 'folga', 'falta')),
  horas NUMERIC(6,2) DEFAULT 0, valor NUMERIC(12,2) DEFAULT 0, observacao TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ocorrencias_pessoa ON ocorrencias_ponto(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_ocorrencias_data ON ocorrencias_ponto(data);

ALTER TABLE public.ocorrencias_ponto ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin/Gestor manage ocorrencias" ON ocorrencias_ponto;
CREATE POLICY "Admin/Gestor manage ocorrencias" ON ocorrencias_ponto FOR ALL USING (
  is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor'::user_role
);
DROP POLICY IF EXISTS "Users view own ocorrencias" ON ocorrencias_ponto;
CREATE POLICY "Users view own ocorrencias" ON ocorrencias_ponto FOR SELECT USING (pessoa_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.folha_mes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), pessoa_id UUID REFERENCES pessoas(id) ON DELETE CASCADE,
  competencia DATE NOT NULL, salario_base NUMERIC(12,2) NOT NULL DEFAULT 0, total_extras NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_descontos NUMERIC(12,2) NOT NULL DEFAULT 0, total_adiantamentos NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_a_pagar NUMERIC(12,2) NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'fechada', 'paga')),
  resumo JSONB DEFAULT '{}'::JSONB, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_folha_pessoa ON folha_mes(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_folha_competencia ON folha_mes(competencia);
CREATE UNIQUE INDEX IF NOT EXISTS idx_folha_pessoa_competencia ON folha_mes(pessoa_id, competencia);

ALTER TABLE public.folha_mes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin/Financeiro manage folha" ON folha_mes;
CREATE POLICY "Admin/Financeiro manage folha" ON folha_mes FOR ALL USING (
  is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'financeiro'::user_role
);
DROP POLICY IF EXISTS "Users view own folha" ON folha_mes;
CREATE POLICY "Users view own folha" ON folha_mes FOR SELECT USING (pessoa_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.parcelas_receber (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), contrato_id UUID REFERENCES contratos(id) ON DELETE CASCADE,
  vencimento DATE NOT NULL, valor NUMERIC(12,2) NOT NULL, centro_custo TEXT,
  status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'paga', 'atrasada')),
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parcelas_contrato ON parcelas_receber(contrato_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_vencimento ON parcelas_receber(vencimento);
CREATE INDEX IF NOT EXISTS idx_parcelas_status ON parcelas_receber(status);

ALTER TABLE public.parcelas_receber ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin/Financeiro manage parcelas" ON parcelas_receber;
CREATE POLICY "Admin/Financeiro manage parcelas" ON parcelas_receber FOR ALL USING (
  is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'financeiro'::user_role
);

CREATE OR REPLACE FUNCTION calcular_folha_mes(p_pessoa_id UUID, p_competencia DATE)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_salario_base NUMERIC(12,2); v_total_extras NUMERIC(12,2) := 0; v_total_descontos NUMERIC(12,2) := 0;
  v_total_adiantamentos NUMERIC(12,2) := 0; v_total_a_pagar NUMERIC(12,2);
BEGIN
  SELECT COALESCE(salario_base, fee_mensal, 0) INTO v_salario_base FROM pessoas WHERE id = p_pessoa_id;
  SELECT COALESCE(SUM(valor), 0) INTO v_total_extras FROM ocorrencias_ponto
    WHERE pessoa_id = p_pessoa_id AND tipo = 'extra' AND DATE_TRUNC('month', data) = DATE_TRUNC('month', p_competencia);
  SELECT COALESCE(SUM(valor), 0) INTO v_total_descontos FROM ocorrencias_ponto
    WHERE pessoa_id = p_pessoa_id AND tipo = 'falta' AND DATE_TRUNC('month', data) = DATE_TRUNC('month', p_competencia);
  SELECT COALESCE(SUM(valor), 0) INTO v_total_adiantamentos FROM adiantamentos
    WHERE pessoa_id = p_pessoa_id AND DATE_TRUNC('month', competencia) = DATE_TRUNC('month', p_competencia) AND status = 'aberto';
  v_total_a_pagar := v_salario_base + v_total_extras - v_total_descontos - v_total_adiantamentos;
  RETURN jsonb_build_object('salario_base', v_salario_base, 'total_extras', v_total_extras,
    'total_descontos', v_total_descontos, 'total_adiantamentos', v_total_adiantamentos, 'total_a_pagar', v_total_a_pagar);
END; $$;

CREATE OR REPLACE FUNCTION fechar_folha_mes(p_pessoa_id UUID, p_competencia DATE)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_calculo JSONB; v_folha_id UUID;
BEGIN
  v_calculo := calcular_folha_mes(p_pessoa_id, p_competencia);
  INSERT INTO folha_mes (pessoa_id, competencia, salario_base, total_extras, total_descontos, total_adiantamentos,
    total_a_pagar, status, resumo) VALUES (p_pessoa_id, DATE_TRUNC('month', p_competencia),
    (v_calculo->>'salario_base')::NUMERIC, (v_calculo->>'total_extras')::NUMERIC, (v_calculo->>'total_descontos')::NUMERIC,
    (v_calculo->>'total_adiantamentos')::NUMERIC, (v_calculo->>'total_a_pagar')::NUMERIC, 'fechada', v_calculo)
  ON CONFLICT (pessoa_id, competencia) DO UPDATE SET salario_base = EXCLUDED.salario_base, total_extras = EXCLUDED.total_extras,
    total_descontos = EXCLUDED.total_descontos, total_adiantamentos = EXCLUDED.total_adiantamentos, total_a_pagar = EXCLUDED.total_a_pagar,
    status = 'fechada', resumo = EXCLUDED.resumo, updated_at = NOW() RETURNING id INTO v_folha_id;
  UPDATE adiantamentos SET status = 'descontado' WHERE pessoa_id = p_pessoa_id
    AND DATE_TRUNC('month', competencia) = DATE_TRUNC('month', p_competencia) AND status = 'aberto';
  RETURN v_folha_id;
END; $$;
-- =====================================================
-- FASE 2: CÁLCULOS FISCAIS INTELIGENTES
-- =====================================================

-- 1. Tabela de faixas INSS (tabela progressiva)
CREATE TABLE IF NOT EXISTS public.financeiro_faixas_inss (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vigencia_inicio DATE NOT NULL,
  vigencia_fim DATE,
  faixa INTEGER NOT NULL CHECK (faixa BETWEEN 1 AND 10),
  salario_de NUMERIC(10,2) NOT NULL,
  salario_ate NUMERIC(10,2),
  aliquota NUMERIC(5,2) NOT NULL CHECK (aliquota BETWEEN 0 AND 100),
  parcela_deduzir NUMERIC(10,2) DEFAULT 0,
  teto_maximo NUMERIC(10,2),
  is_ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (vigencia_inicio, faixa)
);

-- 2. Tabela de faixas IRRF
CREATE TABLE IF NOT EXISTS public.financeiro_faixas_irrf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vigencia_inicio DATE NOT NULL,
  vigencia_fim DATE,
  faixa INTEGER NOT NULL CHECK (faixa BETWEEN 1 AND 10),
  base_calculo_de NUMERIC(10,2) NOT NULL,
  base_calculo_ate NUMERIC(10,2),
  aliquota NUMERIC(5,2) NOT NULL CHECK (aliquota BETWEEN 0 AND 100),
  parcela_deduzir NUMERIC(10,2) DEFAULT 0,
  is_ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (vigencia_inicio, faixa)
);

-- 3. Histórico salarial (rastreabilidade)
CREATE TABLE IF NOT EXISTS public.financeiro_historico_salarial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES public.rh_colaboradores(id) ON DELETE CASCADE,
  data_vigencia DATE NOT NULL,
  tipo_alteracao TEXT NOT NULL CHECK (tipo_alteracao IN ('admissao', 'aumento', 'promocao', 'reducao', 'ajuste')),
  salario_anterior NUMERIC(10,2),
  salario_novo NUMERIC(10,2) NOT NULL,
  cargo_anterior TEXT,
  cargo_novo TEXT,
  motivo TEXT,
  justificativa TEXT,
  aprovado_por UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- 4. Logs de processamento de folha (auditoria)
CREATE TABLE IF NOT EXISTS public.financeiro_folha_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folha_id UUID NOT NULL REFERENCES public.financeiro_folha(id) ON DELETE CASCADE,
  acao TEXT NOT NULL CHECK (acao IN ('criacao', 'processamento', 'reprocessamento', 'fechamento', 'reabertura', 'cancelamento')),
  usuario_id UUID REFERENCES auth.users(id),
  dados_anteriores JSONB,
  dados_novos JSONB,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabela de parâmetros fiscais gerais
CREATE TABLE IF NOT EXISTS public.financeiro_parametros_fiscais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competencia DATE NOT NULL UNIQUE,
  salario_minimo NUMERIC(10,2) NOT NULL,
  teto_inss NUMERIC(10,2) NOT NULL,
  aliquota_fgts NUMERIC(5,2) DEFAULT 8.00,
  valor_dependente_irrf NUMERIC(10,2) DEFAULT 189.59,
  is_ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- FUNÇÕES DE CÁLCULO FISCAL
-- =====================================================

-- Função: Calcular INSS (progressivo)
CREATE OR REPLACE FUNCTION public.fn_calcular_inss(
  p_salario_bruto NUMERIC,
  p_competencia DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  valor_inss NUMERIC,
  aliquota_efetiva NUMERIC,
  faixas_aplicadas JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inss_total NUMERIC := 0;
  v_salario_restante NUMERIC := p_salario_bruto;
  v_teto_inss NUMERIC;
  v_faixa RECORD;
  v_faixas_aplicadas JSONB := '[]'::jsonb;
BEGIN
  -- Buscar teto do INSS
  SELECT teto_inss INTO v_teto_inss
  FROM financeiro_parametros_fiscais
  WHERE competencia <= p_competencia
  ORDER BY competencia DESC
  LIMIT 1;

  -- Aplicar faixas progressivas
  FOR v_faixa IN 
    SELECT * FROM financeiro_faixas_inss
    WHERE vigencia_inicio <= p_competencia
      AND (vigencia_fim IS NULL OR vigencia_fim >= p_competencia)
      AND is_ativo = true
    ORDER BY faixa ASC
  LOOP
    DECLARE
      v_base_faixa NUMERIC;
      v_inss_faixa NUMERIC;
    BEGIN
      -- Calcular base tributável da faixa
      IF v_faixa.salario_ate IS NULL THEN
        v_base_faixa := LEAST(v_salario_restante, COALESCE(v_teto_inss, 999999));
      ELSE
        v_base_faixa := LEAST(v_salario_restante, v_faixa.salario_ate - v_faixa.salario_de);
      END IF;

      -- Calcular INSS da faixa
      v_inss_faixa := v_base_faixa * (v_faixa.aliquota / 100);
      v_inss_total := v_inss_total + v_inss_faixa;
      v_salario_restante := v_salario_restante - v_base_faixa;

      -- Registrar faixa aplicada
      v_faixas_aplicadas := v_faixas_aplicadas || jsonb_build_object(
        'faixa', v_faixa.faixa,
        'base', v_base_faixa,
        'aliquota', v_faixa.aliquota,
        'valor', v_inss_faixa
      );

      EXIT WHEN v_salario_restante <= 0;
    END;
  END LOOP;

  -- Retornar resultado
  RETURN QUERY SELECT 
    ROUND(v_inss_total, 2) as valor_inss,
    ROUND((v_inss_total / NULLIF(p_salario_bruto, 0)) * 100, 2) as aliquota_efetiva,
    v_faixas_aplicadas as faixas_aplicadas;
END;
$$;

-- Função: Calcular IRRF (progressivo)
CREATE OR REPLACE FUNCTION public.fn_calcular_irrf(
  p_base_calculo NUMERIC,
  p_num_dependentes INTEGER DEFAULT 0,
  p_competencia DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  valor_irrf NUMERIC,
  aliquota_efetiva NUMERIC,
  faixa_aplicada INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_valor_dependente NUMERIC;
  v_base_liquida NUMERIC;
  v_faixa RECORD;
  v_irrf NUMERIC := 0;
BEGIN
  -- Buscar dedução por dependente
  SELECT valor_dependente_irrf INTO v_valor_dependente
  FROM financeiro_parametros_fiscais
  WHERE competencia <= p_competencia
  ORDER BY competencia DESC
  LIMIT 1;

  -- Deduzir dependentes
  v_base_liquida := p_base_calculo - (COALESCE(v_valor_dependente, 0) * p_num_dependentes);

  -- Buscar faixa aplicável
  SELECT * INTO v_faixa
  FROM financeiro_faixas_irrf
  WHERE vigencia_inicio <= p_competencia
    AND (vigencia_fim IS NULL OR vigencia_fim >= p_competencia)
    AND is_ativo = true
    AND v_base_liquida >= base_calculo_de
    AND (base_calculo_ate IS NULL OR v_base_liquida <= base_calculo_ate)
  ORDER BY faixa DESC
  LIMIT 1;

  -- Calcular IRRF
  IF v_faixa.id IS NOT NULL THEN
    v_irrf := (v_base_liquida * (v_faixa.aliquota / 100)) - COALESCE(v_faixa.parcela_deduzir, 0);
    v_irrf := GREATEST(v_irrf, 0); -- Nunca negativo
  END IF;

  RETURN QUERY SELECT 
    ROUND(v_irrf, 2) as valor_irrf,
    ROUND((v_irrf / NULLIF(p_base_calculo, 0)) * 100, 2) as aliquota_efetiva,
    COALESCE(v_faixa.faixa, 0) as faixa_aplicada;
END;
$$;

-- Função: Calcular FGTS
CREATE OR REPLACE FUNCTION public.fn_calcular_fgts(
  p_salario_bruto NUMERIC,
  p_competencia DATE DEFAULT CURRENT_DATE
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_aliquota_fgts NUMERIC;
BEGIN
  SELECT aliquota_fgts INTO v_aliquota_fgts
  FROM financeiro_parametros_fiscais
  WHERE competencia <= p_competencia
  ORDER BY competencia DESC
  LIMIT 1;

  RETURN ROUND(p_salario_bruto * (COALESCE(v_aliquota_fgts, 8) / 100), 2);
END;
$$;

-- =====================================================
-- ÍNDICES E OTIMIZAÇÕES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_faixas_inss_vigencia ON financeiro_faixas_inss(vigencia_inicio, vigencia_fim) WHERE is_ativo = true;
CREATE INDEX IF NOT EXISTS idx_faixas_irrf_vigencia ON financeiro_faixas_irrf(vigencia_inicio, vigencia_fim) WHERE is_ativo = true;
CREATE INDEX IF NOT EXISTS idx_historico_salarial_colaborador ON financeiro_historico_salarial(colaborador_id, data_vigencia DESC);
CREATE INDEX IF NOT EXISTS idx_folha_logs_folha ON financeiro_folha_logs(folha_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parametros_fiscais_competencia ON financeiro_parametros_fiscais(competencia DESC) WHERE is_ativo = true;

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_faixas_inss_updated_at
  BEFORE UPDATE ON financeiro_faixas_inss
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faixas_irrf_updated_at
  BEFORE UPDATE ON financeiro_faixas_irrf
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parametros_fiscais_updated_at
  BEFORE UPDATE ON financeiro_parametros_fiscais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE financeiro_faixas_inss ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_faixas_irrf ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_historico_salarial ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_folha_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_parametros_fiscais ENABLE ROW LEVEL SECURITY;

-- Admin/Financeiro podem gerenciar tudo
CREATE POLICY "Admin/Financeiro gerenciam faixas INSS"
  ON financeiro_faixas_inss FOR ALL
  USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'financeiro');

CREATE POLICY "Admin/Financeiro gerenciam faixas IRRF"
  ON financeiro_faixas_irrf FOR ALL
  USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'financeiro');

CREATE POLICY "Admin/Financeiro gerenciam parâmetros fiscais"
  ON financeiro_parametros_fiscais FOR ALL
  USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'financeiro');

CREATE POLICY "Admin/Financeiro gerenciam histórico salarial"
  ON financeiro_historico_salarial FOR ALL
  USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'financeiro');

-- Logs são append-only
CREATE POLICY "Sistema cria logs de folha"
  ON financeiro_folha_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin/Financeiro leem logs de folha"
  ON financeiro_folha_logs FOR SELECT
  USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'financeiro');

-- =====================================================
-- DADOS INICIAIS (Tabelas 2025)
-- =====================================================

-- Parâmetros fiscais 2025
INSERT INTO financeiro_parametros_fiscais (competencia, salario_minimo, teto_inss, aliquota_fgts, valor_dependente_irrf) VALUES
('2025-01-01', 1412.00, 7786.02, 8.00, 189.59)
ON CONFLICT (competencia) DO NOTHING;

-- Faixas INSS 2025 (progressivo)
INSERT INTO financeiro_faixas_inss (vigencia_inicio, faixa, salario_de, salario_ate, aliquota, parcela_deduzir, teto_maximo) VALUES
('2025-01-01', 1, 0.00, 1412.00, 7.50, 0, NULL),
('2025-01-01', 2, 1412.01, 2666.68, 9.00, 0, NULL),
('2025-01-01', 3, 2666.69, 4000.03, 12.00, 0, NULL),
('2025-01-01', 4, 4000.04, 7786.02, 14.00, 0, 7786.02)
ON CONFLICT (vigencia_inicio, faixa) DO NOTHING;

-- Faixas IRRF 2025
INSERT INTO financeiro_faixas_irrf (vigencia_inicio, faixa, base_calculo_de, base_calculo_ate, aliquota, parcela_deduzir) VALUES
('2025-01-01', 1, 0.00, 2259.20, 0.00, 0.00),
('2025-01-01', 2, 2259.21, 2826.65, 7.50, 169.44),
('2025-01-01', 3, 2826.66, 3751.05, 15.00, 381.44),
('2025-01-01', 4, 3751.06, 4664.68, 22.50, 662.77),
('2025-01-01', 5, 4664.69, NULL, 27.50, 896.00)
ON CONFLICT (vigencia_inicio, faixa) DO NOTHING;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE financeiro_faixas_inss IS 'Faixas progressivas de INSS (atualizadas conforme legislação)';
COMMENT ON TABLE financeiro_faixas_irrf IS 'Faixas progressivas de IRRF (atualizadas conforme legislação)';
COMMENT ON TABLE financeiro_historico_salarial IS 'Histórico completo de alterações salariais para auditoria';
COMMENT ON TABLE financeiro_folha_logs IS 'Logs de todas as operações em folhas de pagamento';
COMMENT ON TABLE financeiro_parametros_fiscais IS 'Parâmetros fiscais gerais (salário mínimo, teto INSS, etc.)';

COMMENT ON FUNCTION fn_calcular_inss IS 'Calcula INSS progressivo com base nas faixas vigentes';
COMMENT ON FUNCTION fn_calcular_irrf IS 'Calcula IRRF com dedução de dependentes';
COMMENT ON FUNCTION fn_calcular_fgts IS 'Calcula FGTS sobre salário bruto';
-- =====================================================
-- SPRINT 8: CONCILIAÇÃO + GESTOR DE DÍVIDAS + MAPA DE DÍVIDAS
-- =====================================================

-- ========== CONCILIAÇÃO BANCÁRIA ==========
CREATE TABLE IF NOT EXISTS public.conciliacoes_bancarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_bancaria_id UUID NOT NULL REFERENCES public.contas_bancarias(id) ON DELETE CASCADE,
  mes_referencia DATE NOT NULL,
  saldo_inicial NUMERIC(15,2) NOT NULL DEFAULT 0,
  saldo_final_extrato NUMERIC(15,2) NOT NULL DEFAULT 0,
  saldo_final_sistema NUMERIC(15,2) NOT NULL DEFAULT 0,
  diferenca NUMERIC(15,2) GENERATED ALWAYS AS (saldo_final_extrato - saldo_final_sistema) STORED,
  status TEXT NOT NULL DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'conciliado', 'divergente')),
  observacoes TEXT,
  conciliado_por UUID REFERENCES auth.users(id),
  conciliado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(conta_bancaria_id, mes_referencia)
);

CREATE TABLE IF NOT EXISTS public.conciliacoes_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conciliacao_id UUID NOT NULL REFERENCES public.conciliacoes_bancarias(id) ON DELETE CASCADE,
  titulo_id UUID REFERENCES public.titulos_financeiros(id),
  lancamento_id UUID REFERENCES public.financeiro_lancamentos(id),
  descricao TEXT NOT NULL,
  data_movimento DATE NOT NULL,
  valor NUMERIC(15,2) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  origem TEXT NOT NULL CHECK (origem IN ('extrato', 'sistema')),
  conciliado BOOLEAN NOT NULL DEFAULT FALSE,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_conciliacoes_conta_mes ON public.conciliacoes_bancarias(conta_bancaria_id, mes_referencia);
CREATE INDEX idx_conciliacoes_itens_conciliacao ON public.conciliacoes_itens(conciliacao_id);
CREATE INDEX idx_conciliacoes_itens_titulo ON public.conciliacoes_itens(titulo_id);

-- RLS Conciliações
ALTER TABLE public.conciliacoes_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conciliacoes_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin e Financeiro gerenciam conciliações"
  ON public.conciliacoes_bancarias FOR ALL
  USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'financeiro');

CREATE POLICY "Admin e Financeiro gerenciam itens de conciliação"
  ON public.conciliacoes_itens FOR ALL
  USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'financeiro');

-- Trigger updated_at
CREATE TRIGGER update_conciliacoes_updated_at
  BEFORE UPDATE ON public.conciliacoes_bancarias
  FOR EACH ROW
  EXECUTE FUNCTION update_tarefa_updated_at();

-- ========== GESTOR DE DÍVIDAS & PARCELAS ==========
CREATE TABLE IF NOT EXISTS public.dividas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('pagar', 'receber')),
  credor_devedor TEXT NOT NULL,
  fornecedor_id UUID REFERENCES public.fornecedores(id),
  cliente_id UUID REFERENCES public.clientes(id),
  descricao TEXT NOT NULL,
  valor_total NUMERIC(15,2) NOT NULL,
  valor_pago NUMERIC(15,2) NOT NULL DEFAULT 0,
  valor_restante NUMERIC(15,2) GENERATED ALWAYS AS (valor_total - valor_pago) STORED,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  numero_parcelas INTEGER NOT NULL DEFAULT 1,
  parcelas JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'quitada', 'renegociada', 'cancelada')),
  centro_custo_id UUID REFERENCES public.centros_custo(id),
  observacoes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_dividas_tipo ON public.dividas(tipo);
CREATE INDEX idx_dividas_status ON public.dividas(status);
CREATE INDEX idx_dividas_fornecedor ON public.dividas(fornecedor_id);
CREATE INDEX idx_dividas_cliente ON public.dividas(cliente_id);

-- RLS Dívidas
ALTER TABLE public.dividas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin e Financeiro gerenciam dívidas"
  ON public.dividas FOR ALL
  USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'financeiro');

CREATE POLICY "Usuários autenticados veem dívidas"
  ON public.dividas FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Trigger updated_at
CREATE TRIGGER update_dividas_updated_at
  BEFORE UPDATE ON public.dividas
  FOR EACH ROW
  EXECUTE FUNCTION update_tarefa_updated_at();

-- ========== VIEW MATERIALIZADA: MAPA DE DÍVIDAS ==========
CREATE MATERIALIZED VIEW IF NOT EXISTS public.vw_mapa_dividas AS
SELECT
  d.id AS divida_id,
  d.tipo,
  d.credor_devedor,
  d.descricao,
  d.valor_total,
  d.valor_pago,
  d.valor_restante,
  d.data_emissao,
  d.numero_parcelas,
  d.status,
  d.centro_custo_id,
  cc.nome AS centro_custo_nome,
  d.fornecedor_id,
  f.razao_social AS fornecedor_nome,
  d.cliente_id,
  c.nome AS cliente_nome,
  -- Parcelas vencidas
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(d.parcelas) AS parcela
    WHERE (parcela->>'status')::text = 'pendente'
      AND (parcela->>'data_vencimento')::date < CURRENT_DATE
  ) AS parcelas_vencidas,
  -- Próximo vencimento
  (
    SELECT MIN((parcela->>'data_vencimento')::date)
    FROM jsonb_array_elements(d.parcelas) AS parcela
    WHERE (parcela->>'status')::text = 'pendente'
  ) AS proximo_vencimento,
  d.updated_at
FROM public.dividas d
LEFT JOIN public.centros_custo cc ON d.centro_custo_id = cc.id
LEFT JOIN public.fornecedores f ON d.fornecedor_id = f.id
LEFT JOIN public.clientes c ON d.cliente_id = c.id
WHERE d.status IN ('ativa', 'renegociada');

-- Índice único para REFRESH CONCURRENTLY
CREATE UNIQUE INDEX idx_vw_mapa_dividas_id ON public.vw_mapa_dividas(divida_id);

-- RLS para view materializada
ALTER MATERIALIZED VIEW public.vw_mapa_dividas OWNER TO postgres;

-- Atualizar função de refresh para incluir mapa de dívidas
CREATE OR REPLACE FUNCTION public.refresh_relatorios_financeiros()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.vw_dre;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.vw_inadimplencia;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.vw_custos_projeto;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.vw_mapa_dividas;
END;
$$;
-- ====================================
-- MIGRAÇÃO: REFATORAÇÃO CLIENTE VIEW
-- De Modal para Página com Sub-rotas
-- ====================================

-- 1. Tabela de Notas do Cliente
CREATE TABLE IF NOT EXISTS public.notas_cliente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  projeto_id UUID REFERENCES public.projetos(id) ON DELETE SET NULL,
  conteudo TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para notas_cliente
ALTER TABLE public.notas_cliente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notes of their clients"
ON public.notas_cliente FOR SELECT
USING (
  is_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.clientes c
    WHERE c.id = cliente_id AND c.responsavel_id = auth.uid()
  ) OR
  get_user_role(auth.uid()) IN ('gestor', 'grs', 'atendimento')
);

CREATE POLICY "Users can manage notes"
ON public.notas_cliente FOR ALL
USING (
  is_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.clientes c
    WHERE c.id = cliente_id AND c.responsavel_id = auth.uid()
  ) OR
  get_user_role(auth.uid()) IN ('gestor', 'grs')
);

-- Trigger para updated_at
CREATE TRIGGER update_notas_cliente_updated_at
BEFORE UPDATE ON public.notas_cliente
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índice para performance
CREATE INDEX idx_notas_cliente ON public.notas_cliente(cliente_id, updated_at DESC);

-- 2. View de Métricas do Cliente (evitar N+1 queries)
-- Usando CAST para TEXT para flexibilidade com diferentes tipos de status
CREATE OR REPLACE VIEW public.vw_client_metrics AS
SELECT 
  c.id as cliente_id,
  c.nome,
  c.telefone,
  c.endereco,
  c.status::TEXT,
  c.cnpj_cpf,
  c.logo_url,
  p_resp.nome as responsavel_nome,
  p_resp.id as responsavel_id,
  asig.nome as assinatura_nome,
  -- Projetos (usando contagem simples por status ativo/inativo)
  COUNT(DISTINCT p.id) FILTER (WHERE p.status IS NOT NULL) as projetos_totais,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status::TEXT = 'ativo') as projetos_abertos,
  -- Financeiro
  COALESCE(SUM(CASE WHEN tf.tipo = 'receita' THEN tf.valor ELSE 0 END), 0) as faturas_total,
  COALESCE(SUM(CASE WHEN tf.tipo = 'receita' AND tf.status::TEXT = 'pago' THEN tf.valor ELSE 0 END), 0) as pagamentos_total,
  -- Percentuais
  CASE 
    WHEN SUM(CASE WHEN tf.tipo = 'receita' THEN tf.valor ELSE 0 END) > 0 
    THEN (SUM(CASE WHEN tf.tipo = 'receita' AND tf.status::TEXT = 'pago' THEN tf.valor ELSE 0 END) * 100.0 / SUM(CASE WHEN tf.tipo = 'receita' THEN tf.valor ELSE 0 END))
    ELSE 0 
  END as pagamentos_percentual
FROM public.clientes c
LEFT JOIN public.profiles p_resp ON p_resp.id = c.responsavel_id
LEFT JOIN public.assinaturas asig ON asig.id = c.assinatura_id
LEFT JOIN public.projetos p ON p.cliente_id = c.id
LEFT JOIN public.transacoes_financeiras tf ON tf.cliente_id = c.id
GROUP BY c.id, c.nome, c.telefone, c.endereco, c.status, c.cnpj_cpf, c.logo_url, p_resp.nome, p_resp.id, asig.nome;

-- 3. Índices para Timeline e queries frequentes
CREATE INDEX IF NOT EXISTS idx_logs_cliente_data 
ON public.logs_atividade(cliente_id, data_hora DESC) 
WHERE cliente_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_logs_projeto 
ON public.logs_atividade((metadata->>'projeto_id'), data_hora DESC) 
WHERE metadata->>'projeto_id' IS NOT NULL;

-- 4. Índices para Projetos
CREATE INDEX IF NOT EXISTS idx_projects_cliente_status 
ON public.projetos(cliente_id, status, created_at DESC) 
WHERE cliente_id IS NOT NULL;

-- 5. Índices para Financeiro
CREATE INDEX IF NOT EXISTS idx_finances_cliente 
ON public.transacoes_financeiras(cliente_id, status, data_vencimento DESC) 
WHERE cliente_id IS NOT NULL;

-- 6. Comentários para documentação
COMMENT ON TABLE public.notas_cliente IS 'Notas internas vinculadas a clientes e/ou projetos específicos';
COMMENT ON VIEW public.vw_client_metrics IS 'View consolidada de métricas do cliente para dashboard (evita N+1 queries)';
COMMENT ON INDEX idx_logs_cliente_data IS 'Índice para timeline do cliente (paginação eficiente)';
COMMENT ON INDEX idx_projects_cliente_status IS 'Índice para filtros e stats de projetos do cliente';
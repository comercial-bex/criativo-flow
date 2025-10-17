-- =====================================================
-- FASE 1: ESTRUTURA DE BANCO DE DADOS
-- Módulo: Painel do Cliente V2
-- =====================================================

-- 1.1 Criar tabela cliente_metas
CREATE TABLE IF NOT EXISTS public.cliente_metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo_meta TEXT NOT NULL, -- 'vendas', 'alcance', 'engajamento', 'trafego'
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor_alvo NUMERIC NOT NULL,
  valor_atual NUMERIC DEFAULT 0,
  unidade TEXT DEFAULT 'unidade', -- 'unidade', 'reais', 'porcentagem', 'pessoas'
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  status TEXT DEFAULT 'em_andamento', -- 'em_andamento', 'concluida', 'cancelada'
  progresso_percent NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN valor_alvo = 0 THEN 0 
      ELSE (valor_atual / valor_alvo) * 100 
    END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cliente_metas_cliente ON cliente_metas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cliente_metas_status ON cliente_metas(status);

-- 1.2 Criar tabela cliente_documentos
CREATE TABLE IF NOT EXISTS public.cliente_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  projeto_id UUID REFERENCES public.projetos(id) ON DELETE SET NULL,
  categoria TEXT NOT NULL, -- 'contrato', 'relatorio', 'apresentacao', 'briefing', 'outros'
  titulo TEXT NOT NULL,
  descricao TEXT,
  arquivo_url TEXT NOT NULL,
  arquivo_path TEXT NOT NULL,
  tamanho_kb INTEGER,
  mime_type TEXT,
  criado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cliente_documentos_cliente ON cliente_documentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cliente_documentos_projeto ON cliente_documentos(projeto_id);

-- 1.3 Criar tabela cliente_tickets
CREATE TABLE IF NOT EXISTS public.cliente_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  assunto TEXT NOT NULL,
  descricao TEXT NOT NULL,
  prioridade TEXT DEFAULT 'media', -- 'baixa', 'media', 'alta', 'urgente'
  status TEXT DEFAULT 'aberto', -- 'aberto', 'em_analise', 'em_espera', 'resolvido', 'fechado'
  categoria TEXT, -- 'suporte', 'financeiro', 'aprovacao', 'duvida', 'reclamacao'
  atribuido_a UUID REFERENCES auth.users(id),
  criado_por UUID NOT NULL REFERENCES auth.users(id),
  resolvido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cliente_tickets_cliente ON cliente_tickets(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cliente_tickets_status ON cliente_tickets(status);

-- 1.4 Criar tabela ticket_mensagens
CREATE TABLE IF NOT EXISTS public.ticket_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.cliente_tickets(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES auth.users(id),
  mensagem TEXT NOT NULL,
  anexo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_mensagens_ticket ON ticket_mensagens(ticket_id);

-- 1.5 Atualizar tabela campanha
ALTER TABLE public.campanha 
  ADD COLUMN IF NOT EXISTS tipo_campanha TEXT DEFAULT 'social_media',
  ADD COLUMN IF NOT EXISTS criativos_url TEXT[],
  ADD COLUMN IF NOT EXISTS metricas JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS status_aprovacao TEXT DEFAULT 'rascunho';

COMMENT ON COLUMN campanha.metricas IS 'Armazena alcance, engajamento, ROI, conversões, etc.';

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Políticas para cliente_metas
ALTER TABLE cliente_metas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes podem ver suas próprias metas"
  ON cliente_metas FOR SELECT
  USING (cliente_id IN (
    SELECT cliente_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Staff pode gerenciar todas as metas"
  ON cliente_metas FOR ALL
  USING (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) = ANY(ARRAY['gestor'::user_role, 'grs'::user_role, 'atendimento'::user_role])
  );

-- Políticas para cliente_documentos
ALTER TABLE cliente_documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes podem ver seus documentos"
  ON cliente_documentos FOR SELECT
  USING (cliente_id IN (
    SELECT cliente_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Staff pode gerenciar documentos"
  ON cliente_documentos FOR ALL
  USING (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) = ANY(ARRAY['gestor'::user_role, 'grs'::user_role, 'atendimento'::user_role])
  );

-- Políticas para cliente_tickets
ALTER TABLE cliente_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes podem ver seus tickets"
  ON cliente_tickets FOR SELECT
  USING (
    cliente_id IN (SELECT cliente_id FROM profiles WHERE id = auth.uid()) 
    OR criado_por = auth.uid()
  );

CREATE POLICY "Clientes podem criar tickets"
  ON cliente_tickets FOR INSERT
  WITH CHECK (criado_por = auth.uid());

CREATE POLICY "Staff pode gerenciar tickets"
  ON cliente_tickets FOR ALL
  USING (
    is_admin(auth.uid()) OR 
    get_user_role(auth.uid()) = ANY(ARRAY['gestor'::user_role, 'atendimento'::user_role])
  );

-- Políticas para ticket_mensagens
ALTER TABLE ticket_mensagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver mensagens de seus tickets"
  ON ticket_mensagens FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM cliente_tickets 
      WHERE cliente_id IN (SELECT cliente_id FROM profiles WHERE id = auth.uid()) 
        OR criado_por = auth.uid() 
        OR atribuido_a = auth.uid()
    )
  );

CREATE POLICY "Usuários podem enviar mensagens em seus tickets"
  ON ticket_mensagens FOR INSERT
  WITH CHECK (usuario_id = auth.uid());
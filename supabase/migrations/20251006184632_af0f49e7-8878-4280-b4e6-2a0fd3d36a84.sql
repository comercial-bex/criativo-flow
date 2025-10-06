-- =====================================================
-- FASE 1: TABELAS ESSENCIAIS PARA APROVAÇÕES E PLANOS
-- =====================================================

-- 1. Tabela de aprovações do cliente
CREATE TABLE IF NOT EXISTS public.aprovacoes_cliente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  projeto_id UUID REFERENCES public.projetos(id) ON DELETE SET NULL,
  tarefa_id UUID REFERENCES public.tarefas_projeto(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('arte', 'roteiro', 'video', 'post', 'captacao', 'outro')),
  titulo TEXT NOT NULL,
  descricao TEXT,
  anexo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'reprovado', 'revisao')),
  motivo_reprovacao TEXT,
  decidido_por UUID REFERENCES public.profiles(id),
  decided_at TIMESTAMP WITH TIME ZONE,
  solicitado_por UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Tabela de planos estratégicos
CREATE TABLE IF NOT EXISTS public.planos_estrategicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  missao TEXT,
  visao TEXT,
  valores TEXT[],
  analise_swot JSONB DEFAULT '{}'::jsonb,
  origem_ia BOOLEAN DEFAULT false,
  dados_onboarding JSONB,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. Tabela de objetivos do plano
CREATE TABLE IF NOT EXISTS public.planos_objetivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_id UUID NOT NULL REFERENCES public.planos_estrategicos(id) ON DELETE CASCADE,
  objetivo TEXT NOT NULL,
  descricao TEXT,
  kpis TEXT[],
  iniciativas TEXT[],
  prazo_conclusao DATE,
  responsavel_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'planejado' CHECK (status IN ('planejado', 'em_andamento', 'concluido', 'cancelado')),
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. Tabela de exportações
CREATE TABLE IF NOT EXISTS public.exportacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  plano_id UUID REFERENCES public.planos_estrategicos(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('pdf', 'pptx', 'excel')),
  titulo TEXT NOT NULL,
  arquivo_url TEXT NOT NULL,
  gerado_por UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. Tabela de cache de IA
CREATE TABLE IF NOT EXISTS public.ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  prompt_hash TEXT NOT NULL,
  response_data JSONB NOT NULL,
  model_used TEXT,
  tokens_used INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 6. View pública do plano estratégico (sem dados sensíveis)
CREATE OR REPLACE VIEW public.vw_planos_publicos AS
SELECT 
  pe.id,
  pe.cliente_id,
  pe.titulo,
  pe.periodo_inicio,
  pe.periodo_fim,
  pe.missao,
  pe.visao,
  pe.valores,
  pe.created_at,
  pe.updated_at
FROM public.planos_estrategicos pe;

-- 7. View pública dos objetivos (sem dados sensíveis)
CREATE OR REPLACE VIEW public.vw_planos_publicos_itens AS
SELECT 
  po.id,
  po.plano_id,
  po.objetivo,
  po.descricao,
  po.kpis,
  po.iniciativas,
  po.prazo_conclusao,
  po.status,
  po.ordem,
  p.nome as responsavel_nome
FROM public.planos_objetivos po
LEFT JOIN public.profiles p ON po.responsavel_id = p.id
ORDER BY po.ordem ASC;

-- 8. View de produtividade (últimos 7 dias)
CREATE OR REPLACE VIEW public.vw_produtividade_7d AS
SELECT 
  tp.setor_responsavel,
  tp.responsavel_id,
  p.nome as responsavel_nome,
  COUNT(*) FILTER (WHERE tp.created_at >= NOW() - INTERVAL '7 days') as tarefas_criadas,
  COUNT(*) FILTER (WHERE tp.status = 'concluida' AND tp.updated_at >= NOW() - INTERVAL '7 days') as tarefas_concluidas,
  COUNT(*) FILTER (WHERE tp.data_prazo < CURRENT_DATE AND tp.status != 'concluida') as tarefas_vencidas,
  ROUND(
    AVG(EXTRACT(EPOCH FROM (tp.updated_at - tp.created_at)) / 86400.0) 
    FILTER (WHERE tp.status = 'concluida' AND tp.updated_at >= NOW() - INTERVAL '7 days')
  , 1) as lead_time_medio_dias
FROM public.tarefas_projeto tp
LEFT JOIN public.profiles p ON tp.responsavel_id = p.id
WHERE tp.created_at >= NOW() - INTERVAL '30 days'
GROUP BY tp.setor_responsavel, tp.responsavel_id, p.nome;

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE public.aprovacoes_cliente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes veem suas próprias aprovações"
ON public.aprovacoes_cliente FOR SELECT
USING (
  cliente_id IN (
    SELECT cliente_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Clientes podem atualizar suas aprovações"
ON public.aprovacoes_cliente FOR UPDATE
USING (
  cliente_id IN (
    SELECT cliente_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Staff pode gerenciar todas as aprovações"
ON public.aprovacoes_cliente FOR ALL
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) IN ('gestor', 'grs', 'atendimento')
);

ALTER TABLE public.planos_estrategicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes veem seus planos"
ON public.planos_estrategicos FOR SELECT
USING (
  cliente_id IN (
    SELECT cliente_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Staff pode gerenciar planos"
ON public.planos_estrategicos FOR ALL
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) IN ('gestor', 'grs')
);

ALTER TABLE public.planos_objetivos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes veem objetivos de seus planos"
ON public.planos_objetivos FOR SELECT
USING (
  plano_id IN (
    SELECT id FROM public.planos_estrategicos 
    WHERE cliente_id IN (
      SELECT cliente_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Staff pode gerenciar objetivos"
ON public.planos_objetivos FOR ALL
USING (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) IN ('gestor', 'grs')
);

ALTER TABLE public.exportacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes veem suas exportações"
ON public.exportacoes FOR SELECT
USING (
  cliente_id IN (
    SELECT cliente_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Staff pode criar exportações"
ON public.exportacoes FOR INSERT
WITH CHECK (
  is_admin(auth.uid()) OR 
  get_user_role(auth.uid()) IN ('gestor', 'grs', 'atendimento')
);

ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apenas sistema pode gerenciar cache"
ON public.ai_cache FOR ALL
USING (true);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_aprovacoes_cliente_updated_at
BEFORE UPDATE ON public.aprovacoes_cliente
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planos_estrategicos_updated_at
BEFORE UPDATE ON public.planos_estrategicos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planos_objetivos_updated_at
BEFORE UPDATE ON public.planos_objetivos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION notificar_nova_aprovacao()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notificacoes (
    user_id,
    titulo,
    mensagem,
    tipo,
    data_evento
  )
  SELECT 
    p.id,
    'Nova Solicitação de Aprovação',
    'Você tem um novo material aguardando aprovação: ' || NEW.titulo,
    'info',
    NOW()
  FROM public.profiles p
  WHERE p.cliente_id = NEW.cliente_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notificar_nova_aprovacao
AFTER INSERT ON public.aprovacoes_cliente
FOR EACH ROW EXECUTE FUNCTION notificar_nova_aprovacao();

CREATE OR REPLACE FUNCTION registrar_decisao_aprovacao()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status AND NEW.status IN ('aprovado', 'reprovado') THEN
    NEW.decidido_por = auth.uid();
    NEW.decided_at = NOW();
    
    INSERT INTO public.notificacoes (
      user_id,
      titulo,
      mensagem,
      tipo,
      data_evento
    ) VALUES (
      OLD.solicitado_por,
      CASE 
        WHEN NEW.status = 'aprovado' THEN 'Aprovação Confirmada'
        ELSE 'Aprovação Rejeitada'
      END,
      'O material "' || NEW.titulo || '" foi ' || NEW.status,
      CASE 
        WHEN NEW.status = 'aprovado' THEN 'success'
        ELSE 'warning'
      END,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_registrar_decisao_aprovacao
BEFORE UPDATE ON public.aprovacoes_cliente
FOR EACH ROW EXECUTE FUNCTION registrar_decisao_aprovacao();

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_aprovacoes_cliente_cliente_id ON public.aprovacoes_cliente(cliente_id);
CREATE INDEX IF NOT EXISTS idx_aprovacoes_cliente_status ON public.aprovacoes_cliente(status);
CREATE INDEX IF NOT EXISTS idx_aprovacoes_cliente_projeto_id ON public.aprovacoes_cliente(projeto_id);

CREATE INDEX IF NOT EXISTS idx_planos_estrategicos_cliente_id ON public.planos_estrategicos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_planos_objetivos_plano_id ON public.planos_objetivos(plano_id);
CREATE INDEX IF NOT EXISTS idx_planos_objetivos_status ON public.planos_objetivos(status);

CREATE INDEX IF NOT EXISTS idx_exportacoes_cliente_id ON public.exportacoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ai_cache_key ON public.ai_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON public.ai_cache(expires_at);
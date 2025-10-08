-- ============================================================================
-- BEX 3.0 - Sistema Unificado de Tarefas (Cartão Padrão)
-- Substitui: briefings, tarefas_projeto (parcial), posts_planejamento
-- ============================================================================

-- 1) ENUMS
CREATE TYPE tipo_tarefa_enum AS ENUM (
  'planejamento_estrategico',
  'roteiro_reels',
  'criativo_card',
  'criativo_carrossel',
  'datas_comemorativas',
  'trafego_pago',
  'contrato',
  'outro'
);

CREATE TYPE prioridade_enum AS ENUM ('baixa', 'media', 'alta', 'critica');

CREATE TYPE status_tarefa_enum AS ENUM (
  'backlog',
  'briefing',
  'em_producao',
  'em_revisao',
  'aprovacao_cliente',
  'aprovado',
  'agendado',
  'publicado',
  'pausado',
  'cancelado'
);

CREATE TYPE area_enum AS ENUM (
  'GRS',
  'Design',
  'Audiovisual',
  'Social',
  'Midia_Paga',
  'Adm'
);

CREATE TYPE canal_enum AS ENUM (
  'Instagram',
  'TikTok',
  'Facebook',
  'YouTube',
  'Site',
  'GoogleAds',
  'MetaAds',
  'Outros'
);

CREATE TYPE executor_area_enum AS ENUM ('Audiovisual', 'Criativo');

CREATE TYPE tipo_anexo_enum AS ENUM (
  'referencia',
  'briefing',
  'logo',
  'paleta',
  'roteiro',
  'psd_ai',
  'raw_video',
  'planilha',
  'contrato',
  'outro'
);

CREATE TYPE status_aprovacao_enum AS ENUM (
  'pendente',
  'aprovado',
  'ajustes',
  'reprovado'
);

-- 2) TABELA: produto (para padronizar produtos/linhas de entrega)
CREATE TABLE IF NOT EXISTS public.produto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  sku TEXT,
  time_responsavel TEXT,
  checklist_padrao JSONB DEFAULT '[]'::jsonb,
  sla_padrao INTEGER DEFAULT 7,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3) TABELA: campanha (opcional)
CREATE TABLE IF NOT EXISTS public.campanha (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  data_inicio DATE,
  data_fim DATE,
  objetivo TEXT,
  orcamento NUMERIC,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4) TABELA PRINCIPAL: tarefa
CREATE TABLE public.tarefa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tipo e produto
  tipo tipo_tarefa_enum NOT NULL DEFAULT 'outro',
  produto_id UUID REFERENCES public.produto(id) ON DELETE SET NULL,
  campanha_id UUID REFERENCES public.campanha(id) ON DELETE SET NULL,
  
  -- Info básica
  titulo TEXT NOT NULL,
  descricao TEXT,
  prioridade prioridade_enum DEFAULT 'media',
  status status_tarefa_enum DEFAULT 'backlog',
  
  -- Responsabilidade
  responsavel_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  area area_enum[] DEFAULT ARRAY[]::area_enum[],
  
  -- Executor (SLA específico)
  executor_area executor_area_enum,
  executor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  prazo_executor TIMESTAMPTZ,
  
  -- Datas
  data_inicio_prevista DATE,
  data_entrega_prevista DATE,
  data_publicacao TIMESTAMPTZ,
  
  -- Canais e público
  canais canal_enum[] DEFAULT ARRAY[]::canal_enum[],
  publico_alvo TEXT,
  tom_voz TEXT,
  cta TEXT,
  
  -- KPIs e metas
  kpis JSONB DEFAULT '{}'::jsonb,
  
  -- Tags e origem
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  origem TEXT,
  grs_action_id TEXT,
  trace_id UUID,
  
  -- Vinculação
  projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  
  -- Auditoria
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5) TABELA: tarefa_conteudo (campos condicionais por tipo)
CREATE TABLE public.tarefa_conteudo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id UUID NOT NULL REFERENCES public.tarefa(id) ON DELETE CASCADE,
  bloco_json JSONB DEFAULT '{}'::jsonb,
  versao INTEGER DEFAULT 1,
  publicado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6) TABELA: anexo
CREATE TABLE public.anexo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id UUID NOT NULL REFERENCES public.tarefa(id) ON DELETE CASCADE,
  tipo tipo_anexo_enum DEFAULT 'outro',
  arquivo_url TEXT NOT NULL,
  legenda TEXT,
  versao INTEGER DEFAULT 1,
  hash_publico TEXT,
  trace_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7) TABELA: aprovacao (reaproveitando ou criando nova)
CREATE TABLE public.aprovacao_tarefa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id UUID NOT NULL REFERENCES public.tarefa(id) ON DELETE CASCADE,
  status_aprovacao status_aprovacao_enum DEFAULT 'pendente',
  comentarios TEXT,
  aprovado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  data_aprovacao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8) TABELA: log_atividade_tarefa
CREATE TABLE public.log_atividade_tarefa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id UUID NOT NULL REFERENCES public.tarefa(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  acao TEXT NOT NULL,
  detalhe JSONB DEFAULT '{}'::jsonb,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- ÍNDICES
-- ============================================================================
CREATE INDEX idx_tarefa_tipo ON public.tarefa(tipo);
CREATE INDEX idx_tarefa_status ON public.tarefa(status);
CREATE INDEX idx_tarefa_executor_area ON public.tarefa(executor_area);
CREATE INDEX idx_tarefa_prazo_executor ON public.tarefa(prazo_executor);
CREATE INDEX idx_tarefa_data_publicacao ON public.tarefa(data_publicacao);
CREATE INDEX idx_tarefa_cliente_id ON public.tarefa(cliente_id);
CREATE INDEX idx_tarefa_projeto_id ON public.tarefa(projeto_id);
CREATE INDEX idx_tarefa_responsavel_id ON public.tarefa(responsavel_id);
CREATE INDEX idx_tarefa_executor_id ON public.tarefa(executor_id);
CREATE INDEX idx_tarefa_trace_id ON public.tarefa(trace_id);

-- ============================================================================
-- TRIGGERS (updated_at)
-- ============================================================================
CREATE OR REPLACE FUNCTION update_tarefa_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tarefa_updated_at
BEFORE UPDATE ON public.tarefa
FOR EACH ROW
EXECUTE FUNCTION update_tarefa_updated_at();

CREATE TRIGGER trg_tarefa_conteudo_updated_at
BEFORE UPDATE ON public.tarefa_conteudo
FOR EACH ROW
EXECUTE FUNCTION update_tarefa_updated_at();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE public.tarefa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefa_conteudo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aprovacao_tarefa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_atividade_tarefa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campanha ENABLE ROW LEVEL SECURITY;

-- Políticas: tarefa
CREATE POLICY "Admins e Gestores podem gerenciar todas as tarefas"
ON public.tarefa FOR ALL
USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor'::user_role);

CREATE POLICY "Responsáveis e executores podem ver suas tarefas"
ON public.tarefa FOR SELECT
USING (
  auth.uid() = responsavel_id 
  OR auth.uid() = executor_id 
  OR cliente_id IN (SELECT cliente_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Responsáveis podem atualizar suas tarefas"
ON public.tarefa FOR UPDATE
USING (auth.uid() = responsavel_id OR auth.uid() = executor_id);

-- Políticas: tarefa_conteudo
CREATE POLICY "Usuários podem ver conteúdo de tarefas que acessam"
ON public.tarefa_conteudo FOR SELECT
USING (
  tarefa_id IN (
    SELECT id FROM public.tarefa 
    WHERE auth.uid() = responsavel_id 
       OR auth.uid() = executor_id
       OR cliente_id IN (SELECT cliente_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "Responsáveis podem gerenciar conteúdo"
ON public.tarefa_conteudo FOR ALL
USING (
  tarefa_id IN (
    SELECT id FROM public.tarefa WHERE auth.uid() = responsavel_id
  )
);

-- Políticas: anexo
CREATE POLICY "Usuários podem ver anexos de tarefas que acessam"
ON public.anexo FOR SELECT
USING (
  tarefa_id IN (
    SELECT id FROM public.tarefa 
    WHERE auth.uid() = responsavel_id 
       OR auth.uid() = executor_id
       OR cliente_id IN (SELECT cliente_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "Responsáveis podem gerenciar anexos"
ON public.anexo FOR ALL
USING (
  tarefa_id IN (
    SELECT id FROM public.tarefa WHERE auth.uid() = responsavel_id
  )
);

-- Políticas: aprovacao_tarefa
CREATE POLICY "Usuários podem ver aprovações de tarefas que acessam"
ON public.aprovacao_tarefa FOR SELECT
USING (
  tarefa_id IN (
    SELECT id FROM public.tarefa 
    WHERE auth.uid() = responsavel_id 
       OR auth.uid() = executor_id
       OR cliente_id IN (SELECT cliente_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "Admins e clientes podem criar aprovações"
ON public.aprovacao_tarefa FOR INSERT
WITH CHECK (
  is_admin(auth.uid()) 
  OR tarefa_id IN (
    SELECT id FROM public.tarefa 
    WHERE cliente_id IN (SELECT cliente_id FROM public.profiles WHERE id = auth.uid())
  )
);

-- Políticas: log_atividade_tarefa
CREATE POLICY "Admins podem ver todos os logs"
ON public.log_atividade_tarefa FOR SELECT
USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor'::user_role);

CREATE POLICY "Sistema pode criar logs"
ON public.log_atividade_tarefa FOR INSERT
WITH CHECK (true);

-- Políticas: produto
CREATE POLICY "Usuários autenticados podem ver produtos"
ON public.produto FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins podem gerenciar produtos"
ON public.produto FOR ALL
USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor'::user_role);

-- Políticas: campanha
CREATE POLICY "Usuários podem ver campanhas de seus clientes"
ON public.campanha FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    is_admin(auth.uid()) 
    OR cliente_id IN (SELECT cliente_id FROM public.profiles WHERE id = auth.uid())
  )
);

CREATE POLICY "Admins podem gerenciar campanhas"
ON public.campanha FOR ALL
USING (is_admin(auth.uid()) OR get_user_role(auth.uid()) = 'gestor'::user_role);

-- ============================================================================
-- FUNÇÃO: Calcular status de prazo (vermelho/amarelo/verde/cinza)
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_tarefa_status_prazo(p_tarefa_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_prazo_executor TIMESTAMPTZ;
  v_tempo_restante INTERVAL;
BEGIN
  SELECT prazo_executor INTO v_prazo_executor
  FROM public.tarefa
  WHERE id = p_tarefa_id;
  
  IF v_prazo_executor IS NULL THEN
    RETURN 'cinza'; -- Sem prazo
  END IF;
  
  v_tempo_restante := v_prazo_executor - now();
  
  IF v_tempo_restante < INTERVAL '0' THEN
    RETURN 'vermelho'; -- Vencido
  ELSIF v_tempo_restante <= INTERVAL '24 hours' THEN
    RETURN 'amarelo'; -- Atenção
  ELSE
    RETURN 'verde'; -- OK
  END IF;
END;
$$;

-- ============================================================================
-- FUNÇÃO: Registrar log de atividade da tarefa
-- ============================================================================
CREATE OR REPLACE FUNCTION fn_log_tarefa(
  p_tarefa_id UUID,
  p_actor_id UUID,
  p_acao TEXT,
  p_detalhe JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.log_atividade_tarefa (tarefa_id, actor_id, acao, detalhe)
  VALUES (p_tarefa_id, p_actor_id, p_acao, p_detalhe)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;
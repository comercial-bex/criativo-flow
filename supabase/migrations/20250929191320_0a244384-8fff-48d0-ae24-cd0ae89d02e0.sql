-- Criar tabela de briefings para tarefas
CREATE TABLE public.briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id UUID NOT NULL REFERENCES public.tarefas_projeto(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  objetivo_postagem TEXT,
  publico_alvo TEXT,
  formato_postagem TEXT DEFAULT 'post',
  call_to_action TEXT,
  hashtags TEXT,
  contexto_estrategico TEXT,
  observacoes TEXT,
  anexos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de logs de atividade para timeline
CREATE TABLE public.logs_atividade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  acao TEXT NOT NULL, -- 'criou', 'aprovou', 'reprovou', 'atualizou', 'concluiu', 'atribuiu'
  entidade_tipo TEXT NOT NULL, -- 'projeto', 'tarefa', 'post', 'briefing', 'planejamento'
  entidade_id UUID NOT NULL,
  descricao TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  data_hora TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar campos à tabela tarefas_projeto para aprovações e briefing
ALTER TABLE public.tarefas_projeto 
ADD COLUMN aprovacao_status TEXT DEFAULT 'pendente',
ADD COLUMN briefing_obrigatorio BOOLEAN DEFAULT false,
ADD COLUMN tipo_tarefa TEXT DEFAULT 'geral',
ADD COLUMN aprovado_por UUID REFERENCES public.profiles(id),
ADD COLUMN data_aprovacao TIMESTAMPTZ,
ADD COLUMN observacoes_aprovacao TEXT;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_atividade ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para briefings
CREATE POLICY "Usuarios podem ver briefings de seus clientes"
ON public.briefings FOR SELECT
USING (
  cliente_id IN (
    SELECT c.id FROM public.clientes c 
    WHERE c.id = briefings.cliente_id 
    AND (
      is_admin(auth.uid()) OR 
      auth.uid() = c.responsavel_id OR
      EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.cliente_id = c.id
      )
    )
  )
);

CREATE POLICY "Usuarios podem criar briefings de seus clientes"
ON public.briefings FOR INSERT
WITH CHECK (
  cliente_id IN (
    SELECT c.id FROM public.clientes c 
    WHERE c.id = briefings.cliente_id 
    AND (
      is_admin(auth.uid()) OR 
      auth.uid() = c.responsavel_id OR
      EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.cliente_id = c.id
      )
    )
  )
);

CREATE POLICY "Usuarios podem atualizar briefings de seus clientes"
ON public.briefings FOR UPDATE
USING (
  cliente_id IN (
    SELECT c.id FROM public.clientes c 
    WHERE c.id = briefings.cliente_id 
    AND (
      is_admin(auth.uid()) OR 
      auth.uid() = c.responsavel_id OR
      EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.cliente_id = c.id
      )
    )
  )
);

-- Políticas RLS para logs_atividade
CREATE POLICY "Usuarios podem ver logs de seus clientes"
ON public.logs_atividade FOR SELECT
USING (
  cliente_id IN (
    SELECT c.id FROM public.clientes c 
    WHERE c.id = logs_atividade.cliente_id 
    AND (
      is_admin(auth.uid()) OR 
      auth.uid() = c.responsavel_id OR
      EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() AND p.cliente_id = c.id
      )
    )
  )
);

CREATE POLICY "Sistema pode criar logs de atividade"
ON public.logs_atividade FOR INSERT
WITH CHECK (true);

-- Trigger para atualizar updated_at em briefings
CREATE OR REPLACE FUNCTION update_briefings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER briefings_updated_at
  BEFORE UPDATE ON public.briefings
  FOR EACH ROW
  EXECUTE FUNCTION update_briefings_updated_at();

-- Função para criar log de atividade automaticamente
CREATE OR REPLACE FUNCTION public.criar_log_atividade(
  p_cliente_id UUID,
  p_usuario_id UUID,
  p_acao TEXT,
  p_entidade_tipo TEXT,
  p_entidade_id UUID,
  p_descricao TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.logs_atividade (
    cliente_id,
    usuario_id,
    acao,
    entidade_tipo,
    entidade_id,
    descricao,
    metadata
  ) VALUES (
    p_cliente_id,
    p_usuario_id,
    p_acao,
    p_entidade_tipo,
    p_entidade_id,
    p_descricao,
    p_metadata
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;